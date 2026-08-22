import { useEffect, useMemo, useState } from "react";
import type { ConfirmedLoad } from "../types/estimator";
import type { ExpenseLineItem, ExpenseRequest } from "../types/expenseRequest";
import { getLoads } from "../lib/loadsStore";
import { createExpenseRequest, getExpenseRequestsForLoad } from "../lib/expenseRequestsStore";
import { computeAlreadyPaidByHead, computeLastRemarkByHead, clearDraft, loadDraft, saveDraft } from "../lib/requestFormHelpers";
import { formatINR } from "../lib/calculations";

const EXPENSE_HEADS: { label: string; getFixedAmount: (load: ConfirmedLoad) => number }[] = [
  { label: "Loading Cost", getFixedAmount: (l) => Number(l.loadingCost) || 0 },
  { label: "Unloading Cost", getFixedAmount: (l) => Number(l.unloadingCost) || 0 },
  { label: "Fuel Cost (3km/L)", getFixedAmount: (l) => l.fuelCost || 0 },
  { label: "RTO", getFixedAmount: (l) => Number(l.rto) || 0 },
  { label: "Fastag Cost", getFixedAmount: (l) => Number(l.fastagCost) || 0 },
  { label: "Driver", getFixedAmount: (l) => l.driver || 0 },
  { label: "Other Expenses", getFixedAmount: () => 0 },
];

/**
 * Shared "is this row over budget" logic — used both to drive the red
 * highlighting/alerts and to decide whether Remark becomes required.
 * A row with no fixed cap (fixedAmount === 0) only counts as exceeding
 * via alreadyPaidExceeds, never via the requesting-amount check (nothing
 * meaningful to "exceed" there — see Other Expenses).
 *
 * `remarkRequired` is deliberately narrower than `alreadyPaidExceeds` on
 * its own: a row you're NOT touching this visit (Requesting Amount left
 * blank) never demands a fresh remark just because it went over budget in
 * a past submission — that overage was already explained and saved then.
 * Only rows where you're actively entering a new amount this time (and
 * that amount is/keeps the row over) need a new remark.
 */
function getRowExceedState(li: ExpenseLineItem) {
  const hasCap = li.fixedAmount > 0;
  const isTouched = li.requestingAmount.trim() !== "";
  const requesting = parseFloat(li.requestingAmount) || 0;
  const projectedTotal = li.alreadyPaid + requesting;
  const alreadyPaidExceeds = li.alreadyPaid > li.fixedAmount;
  const requestExceeds = hasCap && isTouched && projectedTotal > li.fixedAmount;
  const overageAmount = projectedTotal - li.fixedAmount;
  return {
    alreadyPaidExceeds,
    requestExceeds,
    overageAmount,
    anyExceeds: alreadyPaidExceeds || requestExceeds,
    remarkRequired: isTouched && (alreadyPaidExceeds || requestExceeds),
  };
}

export default function RequestForm() {
  const [loads, setLoads] = useState<ConfirmedLoad[]>([]);
  const [loadsLoading, setLoadsLoading] = useState(true);
  const [loadsError, setLoadsError] = useState<string | null>(null);

  const [selectedLoadId, setSelectedLoadId] = useState<string>("");
  const [lineItems, setLineItems] = useState<ExpenseLineItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [previousRequests, setPreviousRequests] = useState<ExpenseRequest[]>([]);
  const [lastRemarkByHead, setLastRemarkByHead] = useState<Record<string, string>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    getLoads()
      .then(setLoads)
      .catch((e) => setLoadsError(e instanceof Error ? e.message : "Failed to load trips"))
      .finally(() => setLoadsLoading(false));
  }, []);

  const selectedLoad = useMemo(
    () => loads.find((l) => String(l.id) === selectedLoadId) || null,
    [loads, selectedLoadId]
  );

  const handleSelectLoad = async (id: string) => {
    setSelectedLoadId(id);
    setSubmitted(false);
    setSubmitError(null);
    const load = loads.find((l) => String(l.id) === id);
    if (!load) {
      setLineItems([]);
      return;
    }

    setHistoryLoading(true);
    try {
      const fetched = await getExpenseRequestsForLoad(load.id);
      setPreviousRequests(fetched);
      const alreadyPaidByHead = computeAlreadyPaidByHead(fetched);
      setLastRemarkByHead(computeLastRemarkByHead(fetched));
      const draft = loadDraft(load.id);

      setLineItems(
        EXPENSE_HEADS.map((head) => {
          const draftItem = draft?.find((d) => d.expenseHead === head.label);
          return {
            expenseHead: head.label,
            fixedAmount: head.getFixedAmount(load),
            alreadyPaid: alreadyPaidByHead[head.label] || 0,
            requestingAmount: draftItem?.requestingAmount || "",
            remark: draftItem?.remark || "",
          };
        })
      );
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Failed to load request history for this trip");
    } finally {
      setHistoryLoading(false);
    }
  };

  const updateLineItem = (index: number, field: "requestingAmount" | "remark", value: string) => {
    setLineItems((items) => {
      const next = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
      if (selectedLoad) {
        saveDraft(
          selectedLoad.id,
          next.map((li) => ({
            expenseHead: li.expenseHead,
            requestingAmount: li.requestingAmount,
            remark: li.remark,
          }))
        );
      }
      return next;
    });
    setSubmitted(false);
  };

  const totals = useMemo(() => {
    const totalFixedAmount = lineItems.reduce((s, li) => s + li.fixedAmount, 0);
    const totalAlreadyPaid = lineItems.reduce((s, li) => s + li.alreadyPaid, 0);
    const totalRequestingAmount = lineItems.reduce(
      (s, li) => s + (parseFloat(li.requestingAmount) || 0),
      0
    );
    return { totalFixedAmount, totalAlreadyPaid, totalRequestingAmount };
  }, [lineItems]);

  // Required: at least ONE row must have a Requesting Amount filled in.
  // Rows left blank are treated as 0 on submit — you don't need to touch
  // every expense head every time, just the ones you're actually requesting.
  // Additionally: any row that's over budget (already paid exceeds fixed,
  // or this request would push it over) must have a Remark explaining why.
  const canSubmit =
    !!selectedLoad &&
    lineItems.length > 0 &&
    lineItems.some((li) => li.requestingAmount.trim() !== "") &&
    lineItems.every((li) => !getRowExceedState(li).remarkRequired || li.remark.trim() !== "");

  const handleSubmit = async () => {
    if (!selectedLoad || !canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createExpenseRequest({
        loadId: selectedLoad.id,
        lineItems: lineItems.map((li) => ({
          expenseHead: li.expenseHead,
          fixedAmount: li.fixedAmount,
          alreadyPaid: li.alreadyPaid,
          requestingAmount: parseFloat(li.requestingAmount) || 0,
          remark: li.remark,
        })),
      });
      clearDraft(selectedLoad.id);
      setSubmitted(true);
      setPreviousRequests((reqs) => {
        const updated = [created, ...reqs];
        setLastRemarkByHead(computeLastRemarkByHead(updated));
        return updated;
      });
      // Roll this submission's requesting amounts into Already Paid and
      // clear the entry fields, so the same page is ready for the next
      // request against this trip without needing to re-select it.
      setLineItems((items) =>
        items.map((li) => ({
          ...li,
          alreadyPaid: li.alreadyPaid + (parseFloat(li.requestingAmount) || 0),
          requestingAmount: "",
          remark: "",
        }))
      );
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-5">
      <h1 className="mb-1 text-lg font-semibold sm:text-xl">Request Form</h1>
      <p className="mb-6 text-sm text-gray-500">
        Submit an additional expense/payment request against a confirmed external trip.
      </p>

      <div className="mb-6 rounded-lg border border-gray-200 p-4">
        <label className="mb-1 block text-xs font-semibold text-gray-700">
          Select external trip (by vehicle number)
        </label>
        {loadsLoading ? (
          <p className="text-sm text-gray-400">Loading trips...</p>
        ) : loadsError ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {loadsError}
          </div>
        ) : (
          <select
            value={selectedLoadId}
            onChange={(e) => handleSelectLoad(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base outline-none focus:border-gray-500 sm:text-sm"
          >
            <option value="">Select a trip...</option>
            {loads.map((l) => (
              <option key={l.id} value={l.id}>
                #{l.serial} — {l.vehicleNumber} — {l.loadingLocation} → {l.unloadingLocation} (
                {l.loadingDate?.split("T")[0]})
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedLoad && (
        <>
          <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
            <span className="font-semibold">{selectedLoad.vehicleNumber}</span> —{" "}
            {selectedLoad.loadingLocation} → {selectedLoad.unloadingLocation} — {selectedLoad.sku},{" "}
            {selectedLoad.tonnage} tons
          </div>

          {historyLoading ? (
            <p className="text-sm text-gray-400">Loading request history for this trip...</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    {["Expense Head", "Fixed Amount", "Already Paid", "Requesting Amount", "Remark"].map(
                      (h) => (
                        <th key={h} className="whitespace-nowrap border-b border-gray-200 px-2.5 py-2">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((li, i) => {
                    const { alreadyPaidExceeds, requestExceeds, overageAmount, remarkRequired } =
                      getRowExceedState(li);
                    const remarkMissing = remarkRequired && li.remark.trim() === "";

                    return (
                      <tr key={li.expenseHead}>
                        <td className="whitespace-nowrap border-b border-gray-100 px-2.5 py-2 font-medium">
                          {li.expenseHead}
                        </td>
                        <td className="whitespace-nowrap border-b border-gray-100 bg-gray-50 px-2.5 py-2 text-gray-600">
                          ₹{formatINR(li.fixedAmount)}
                        </td>
                        <td
                          className={`whitespace-nowrap border-b border-gray-100 px-2.5 py-2 ${
                            alreadyPaidExceeds ? "bg-red-50 font-semibold text-red-600" : "bg-gray-50 text-gray-600"
                          }`}
                        >
                          ₹{formatINR(li.alreadyPaid)}
                        </td>
                        <td className="border-b border-gray-100 px-2 py-1.5">
                          <input
                            type="number"
                            value={li.requestingAmount}
                            onChange={(e) => updateLineItem(i, "requestingAmount", e.target.value)}
                            placeholder="0"
                            className={`w-24 rounded border px-2 py-1 text-sm outline-none ${
                              requestExceeds
                                ? "border-red-400 text-red-600 focus:border-red-500"
                                : "border-gray-300 focus:border-gray-500"
                            }`}
                          />
                          {requestExceeds && (
                            <div className="mt-0.5 whitespace-nowrap text-[11px] text-red-600">
                              Exceeds by ₹{formatINR(overageAmount)}
                            </div>
                          )}
                        </td>
                        <td className="border-b border-gray-100 px-2 py-1.5">
                          <input
                            type="text"
                            value={li.remark}
                            onChange={(e) => updateLineItem(i, "remark", e.target.value)}
                            placeholder={remarkRequired ? "Required — explain overage" : "Optional"}
                            className={`w-40 rounded border px-2 py-1 text-sm outline-none ${
                              remarkMissing
                                ? "border-red-400 focus:border-red-500"
                                : "border-gray-300 focus:border-gray-500"
                            }`}
                          />
                          {li.remark.trim() === "" && lastRemarkByHead[li.expenseHead] && (
                            <div className="mt-0.5 w-40 whitespace-normal break-words text-[11px] italic text-gray-400">
                              Last: "{lastRemarkByHead[li.expenseHead]}"
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-semibold">
                    <td className="whitespace-nowrap px-2.5 py-2">Total</td>
                    <td className="whitespace-nowrap px-2.5 py-2">₹{formatINR(totals.totalFixedAmount)}</td>
                    <td
                      className={`whitespace-nowrap px-2.5 py-2 ${
                        totals.totalAlreadyPaid > totals.totalFixedAmount ? "text-red-600" : ""
                      }`}
                    >
                      ₹{formatINR(totals.totalAlreadyPaid)}
                    </td>
                    <td className="whitespace-nowrap px-2.5 py-2">
                      ₹{formatINR(totals.totalRequestingAmount)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {submitError && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className={`rounded-md px-5 py-2.5 text-sm font-semibold text-white ${
                canSubmit && !submitting
                  ? "bg-green-600 hover:bg-green-700"
                  : "cursor-not-allowed bg-gray-400"
              }`}
            >
              {submitting ? "Submitting..." : submitted ? "Submitted ✓" : "Submit Request"}
            </button>
            {!canSubmit && (
              <p className="text-xs text-gray-400">
                {lineItems.some((li) => getRowExceedState(li).remarkRequired && li.remark.trim() === "")
                  ? "Add a Remark for any row that's over budget (highlighted in red) to enable submit."
                  : 'Fill in "Requesting Amount" for at least one row to enable submit.'}
              </p>
            )}
          </div>
          <p className="mt-2 text-[11px] text-gray-400">
            Your entries are saved automatically as you type — safe to refresh or come back later.
          </p>

          {previousRequests.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-semibold text-gray-700">
                Previous requests for this trip ({previousRequests.length})
              </h2>
              <div className="flex flex-col gap-2">
                {previousRequests.map((req) => {
                  const touchedItems = req.lineItems.filter((li) => li.requestingAmount !== 0);
                  return (
                    <div key={req.id} className="rounded-lg border border-gray-200 p-3 text-[13px]">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="font-medium text-gray-700">
                          {new Date(req.createdAt).toLocaleString()}
                        </span>
                        <span className="font-semibold text-gray-900">
                          ₹{formatINR(req.totalRequestingAmount)} requested
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {touchedItems.length === 0 ? (
                          <span className="text-gray-400">No line items in this request</span>
                        ) : (
                          touchedItems.map((li) => (
                            <div
                              key={li.expenseHead}
                              className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5"
                            >
                              <span className="text-gray-600">
                                {li.expenseHead} — ₹{formatINR(li.requestingAmount)}
                              </span>
                              {li.remark && (
                                <span className="italic text-gray-500">"{li.remark}"</span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

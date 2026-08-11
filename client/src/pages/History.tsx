import { Fragment, useEffect, useState } from "react";
import type { ConfirmedLoad } from "../types/estimator";
import { getLoads } from "../lib/loadsStore";
import { formatINR } from "../lib/calculations";
import LoadDetailRow from "../components/history/LoadDetailRow";
import LoadCard from "../components/history/LoadCard";

const COLUMNS = ["#", "Vehicle", "Route", "SKU", "Tonnage", "Total KM", "Final amount", "Net margin", "Quotation"];

export default function History() {
  const [loads, setLoads] = useState<ConfirmedLoad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    getLoads()
      .then(setLoads)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load history"))
      .finally(() => setLoading(false));
  }, []);

  const toggleRow = (id: number) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-5">
      <h1 className="mb-4 text-lg font-semibold sm:text-xl">Confirmed loads ({loads.length})</h1>

      {loading && <p className="text-sm text-gray-400">Loading...</p>}
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {!loading && !error && loads.length === 0 && (
        <p className="text-sm text-gray-400">No loads saved yet.</p>
      )}

      {loads.length > 0 && (
        <>
          {/* Mobile: stacked cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {loads.map((l) => (
              <LoadCard key={l.id} load={l} />
            ))}
          </div>

          {/* Desktop/tablet: table */}
          <div className="hidden overflow-x-auto rounded-lg border border-gray-200 sm:block">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="w-6 border-b border-gray-200 px-2.5 py-2" />
                  {COLUMNS.map((h) => (
                    <th key={h} className="border-b border-gray-200 px-2.5 py-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loads.map((l) => {
                  const isOpen = expandedId === l.id;
                  return (
                    <Fragment key={l.id}>
                      <tr onClick={() => toggleRow(l.id)} className="cursor-pointer hover:bg-gray-50">
                        <td className="border-b border-gray-100 px-2.5 py-2 text-gray-400">
                          <span
                            className="inline-block transition-transform"
                            style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                          >
                            ▶
                          </span>
                        </td>
                        <td className="border-b border-gray-100 px-2.5 py-2">{l.serial}</td>
                        <td className="border-b border-gray-100 px-2.5 py-2">{l.vehicleNumber}</td>
                        <td className="border-b border-gray-100 px-2.5 py-2">
                          {l.loadingLocation} → {l.unloadingLocation}
                        </td>
                        <td className="border-b border-gray-100 px-2.5 py-2">{l.sku}</td>
                        <td className="border-b border-gray-100 px-2.5 py-2">{l.tonnage}</td>
                        <td className="border-b border-gray-100 px-2.5 py-2">{formatINR(l.totalKm)}</td>
                        <td className="border-b border-gray-100 px-2.5 py-2">₹{formatINR(l.finalAmount)}</td>
                        <td
                          className={`border-b border-gray-100 px-2.5 py-2 ${
                            l.netMargin < 0 ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          ₹{formatINR(l.netMargin)}
                        </td>
                        <td className="border-b border-gray-100 px-2.5 py-2">₹{formatINR(l.totalQuotation)}</td>
                      </tr>
                      {isOpen && <LoadDetailRow load={l} colSpan={COLUMNS.length + 1} />}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

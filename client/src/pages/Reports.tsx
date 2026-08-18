import { useEffect, useMemo, useState } from "react";
import type { ConfirmedLoad } from "../types/estimator";
import { getLoads } from "../lib/loadsStore";
import { filterByDateRange, loadsToCSV } from "../lib/reportUtils";
import { formatINR } from "../lib/calculations";

export default function Reports() {
  const [loads, setLoads] = useState<ConfirmedLoad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    getLoads()
      .then(setLoads)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load reports"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => filterByDateRange(loads, from, to), [loads, from, to]);

  const totals = useMemo(
    () => ({
      revenue: filtered.reduce((s, l) => s + (l.tripAmount || 0), 0),
      netMargin: filtered.reduce((s, l) => s + (l.netMargin || 0), 0),
    }),
    [filtered]
  );

  const handleExport = () => {
    const csv = loadsToCSV(filtered);
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const suffix = from || to ? `_${from || "start"}_to_${to || "end"}` : "";
    a.href = url;
    a.download = `loads_export${suffix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-5">
      <h1 className="mb-1 text-lg font-semibold sm:text-xl">Reports</h1>
      <p className="mb-6 text-sm text-gray-500">Filter confirmed loads by loading date and export to CSV.</p>

      <div className="mb-5 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-gray-700">From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 block rounded-md border border-gray-300 px-2.5 py-2.5 text-base sm:py-2 sm:text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-gray-700">To</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 block rounded-md border border-gray-300 px-2.5 py-2.5 text-base sm:py-2 sm:text-sm"
          />
        </label>
        <button
          onClick={() => {
            setFrom("");
            setTo("");
          }}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
        >
          Clear
        </button>
        <button
          onClick={handleExport}
          disabled={filtered.length === 0}
          className={`ml-auto rounded-md px-4 py-2 text-sm font-semibold text-white ${
            filtered.length ? "bg-green-600 hover:bg-green-700" : "cursor-not-allowed bg-gray-400"
          }`}
        >
          Export CSV ({filtered.length})
        </button>
      </div>

      {loading && <p className="text-sm text-gray-400">Loading...</p>}
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mb-4 flex gap-6 text-sm">
            <span>
              Total revenue: <strong>₹{formatINR(totals.revenue)}</strong>
            </span>
            <span>
              Total net margin:{" "}
              <strong className={totals.netMargin < 0 ? "text-red-600" : "text-green-600"}>
                ₹{formatINR(totals.netMargin)}
              </strong>
            </span>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400">No loads in this date range.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    {["#", "Vehicle", "Loading date", "Route", "SKU", "Revenue", "Net margin"].map((h) => (
                      <th key={h} className="border-b border-gray-200 px-2.5 py-2">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.id}>
                      <td className="border-b border-gray-100 px-2.5 py-2">{l.serial}</td>
                      <td className="border-b border-gray-100 px-2.5 py-2">{l.vehicleNumber}</td>
                      <td className="border-b border-gray-100 px-2.5 py-2">{l.loadingDate?.split("T")[0]}</td>
                      <td className="border-b border-gray-100 px-2.5 py-2">
                        {l.loadingLocation} → {l.unloadingLocation}
                      </td>
                      <td className="border-b border-gray-100 px-2.5 py-2">{l.sku}</td>
                      <td className="border-b border-gray-100 px-2.5 py-2">₹{formatINR(l.tripAmount)}</td>
                      <td
                        className={`border-b border-gray-100 px-2.5 py-2 ${
                          l.netMargin < 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        ₹{formatINR(l.netMargin)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

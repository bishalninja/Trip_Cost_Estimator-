import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import type { ConfirmedLoad } from "../types/estimator";
import { getLoads } from "../lib/loadsStore";
import { computeDashboardStats } from "../lib/reportUtils";
import { formatINR } from "../lib/calculations";
import StatCard from "../components/dashboard/StatCard";
import Card from "../components/common/Card";

export default function Dashboard() {
  const [loads, setLoads] = useState<ConfirmedLoad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLoads()
      .then(setLoads)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => computeDashboardStats(loads), [loads]);

  if (loading) return <div className="p-5 text-sm text-gray-400">Loading...</div>;
  if (error)
    return (
      <div className="p-5">
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-5">
      <h1 className="mb-6 text-lg font-semibold sm:text-xl">Dashboard</h1>

      {loads.length === 0 ? (
        <p className="text-sm text-gray-400">No loads saved yet — confirm a load from the Estimator page first.</p>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total loads" value={String(stats.totalLoads)} />
            <StatCard label="Total revenue" value={"₹" + formatINR(stats.totalRevenue)} />
            <StatCard
              label="Total net margin"
              value={"₹" + formatINR(stats.totalNetMargin)}
              colorClass={stats.totalNetMargin < 0 ? "text-red-600" : "text-green-600"}
            />
            <StatCard
              label="Avg net margin / load"
              value={"₹" + formatINR(stats.avgNetMargin)}
              colorClass={stats.avgNetMargin < 0 ? "text-red-600" : "text-green-600"}
            />
          </div>

          <Card title="Loads & net margin by day" className="mb-6">
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={stats.trendByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="loads" stroke="#6366f1" name="Loads" />
                  <Line yAxisId="right" type="monotone" dataKey="netMargin" stroke="#16a34a" name="Net margin (₹)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Broker-wise breakdown">
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={stats.byBroker} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="broker" tick={{ fontSize: 11 }} width={140} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#6366f1" name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    {["Broker", "Loads", "Revenue", "Net margin"].map((h) => (
                      <th key={h} className="border-b border-gray-200 px-2.5 py-2">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.byBroker.map((b) => (
                    <tr key={b.broker}>
                      <td className="border-b border-gray-100 px-2.5 py-2">{b.broker}</td>
                      <td className="border-b border-gray-100 px-2.5 py-2">{b.loads}</td>
                      <td className="border-b border-gray-100 px-2.5 py-2">₹{formatINR(b.revenue)}</td>
                      <td
                        className={`border-b border-gray-100 px-2.5 py-2 ${
                          b.netMargin < 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        ₹{formatINR(b.netMargin)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

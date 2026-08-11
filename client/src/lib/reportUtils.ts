import type { ConfirmedLoad } from "../types/estimator";

export function toDateKey(dateStr: string): string {
  // loadingDate is stored as a datetime-local string, e.g. "2026-08-07T22:00"
  if (!dateStr) return "unknown";
  return dateStr.split("T")[0];
}

export interface DashboardStats {
  totalLoads: number;
  avgNetMargin: number;
  totalRevenue: number; // sum of totalQuotation
  totalNetMargin: number;
  trendByDay: { date: string; loads: number; netMargin: number }[];
  byBroker: { broker: string; loads: number; netMargin: number; revenue: number }[];
}

export function computeDashboardStats(loads: ConfirmedLoad[]): DashboardStats {
  const totalLoads = loads.length;
  const totalRevenue = loads.reduce((sum, l) => sum + (l.totalQuotation || 0), 0);
  const totalNetMargin = loads.reduce((sum, l) => sum + (l.netMargin || 0), 0);
  const avgNetMargin = totalLoads ? totalNetMargin / totalLoads : 0;

  const dayMap = new Map<string, { loads: number; netMargin: number }>();
  for (const l of loads) {
    const key = toDateKey(l.loadingDate);
    const entry = dayMap.get(key) || { loads: 0, netMargin: 0 };
    entry.loads += 1;
    entry.netMargin += l.netMargin || 0;
    dayMap.set(key, entry);
  }
  const trendByDay = Array.from(dayMap.entries())
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const brokerMap = new Map<string, { loads: number; netMargin: number; revenue: number }>();
  for (const l of loads) {
    const key = l.brokerDetails || "Unknown";
    const entry = brokerMap.get(key) || { loads: 0, netMargin: 0, revenue: 0 };
    entry.loads += 1;
    entry.netMargin += l.netMargin || 0;
    entry.revenue += l.totalQuotation || 0;
    brokerMap.set(key, entry);
  }
  const byBroker = Array.from(brokerMap.entries())
    .map(([broker, v]) => ({ broker, ...v }))
    .sort((a, b) => b.revenue - a.revenue);

  return { totalLoads, avgNetMargin, totalRevenue, totalNetMargin, trendByDay, byBroker };
}

export function filterByDateRange(
  loads: ConfirmedLoad[],
  from: string,
  to: string
): ConfirmedLoad[] {
  return loads.filter((l) => {
    const key = toDateKey(l.loadingDate);
    if (from && key < from) return false;
    if (to && key > to) return false;
    return true;
  });
}

export function loadsToCSV(loads: ConfirmedLoad[]): string {
  if (loads.length === 0) return "";
  const headers = Object.keys(loads[0]);
  const rows = loads.map((l) =>
    headers
      .map((h) => {
        const val = (l as unknown as Record<string, unknown>)[h];
        const str = val === null || val === undefined ? "" : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}
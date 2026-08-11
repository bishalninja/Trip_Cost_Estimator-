interface StatCardProps {
  label: string;
  value: string;
  colorClass?: string;
}

export default function StatCard({ label, value, colorClass = "text-gray-900" }: StatCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${colorClass}`}>{value}</div>
    </div>
  );
}
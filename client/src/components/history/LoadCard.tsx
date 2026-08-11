import { useState } from "react";
import type { ConfirmedLoad } from "../../types/estimator";
import { formatINR } from "../../lib/calculations";
import LoadDetailCard from "./LoadDetailCard";

interface LoadCardProps {
  load: ConfirmedLoad;
}

export default function LoadCard({ load: l }: LoadCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{l.vehicleNumber}</span>
            <span className="text-xs text-gray-400">#{l.serial}</span>
          </div>
          <div className="mt-0.5 truncate text-xs text-gray-500">
            {l.loadingLocation} → {l.unloadingLocation}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <div
              className={`text-sm font-semibold ${l.netMargin < 0 ? "text-red-600" : "text-green-600"}`}
            >
              ₹{formatINR(l.netMargin)}
            </div>
            <div className="text-[11px] text-gray-400">net margin</div>
          </div>
          <span
            className="inline-block text-gray-400 transition-transform"
            style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
          >
            ▶
          </span>
        </div>
      </button>
      {open && (
        <div className="border-t border-gray-100 px-4 py-3">
          <LoadDetailCard load={l} />
        </div>
      )}
    </div>
  );
}

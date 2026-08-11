import Card from "../common/Card";
import type { CalculationResult } from "../../types/estimator";
import { formatINR } from "../../lib/calculations";

interface ResultPanelProps {
  result: CalculationResult;
  canSave: boolean;
  saving: boolean;
  saved: boolean;
  onReset: () => void;
}

function Row({
  label,
  value,
  strong,
  colorClass,
}: {
  label: string;
  value: string;
  strong?: boolean;
  colorClass?: string;
}) {
  return (
    <div className={`flex justify-between py-1 ${strong ? "text-[15px]" : "text-[13.5px]"}`}>
      <span className="text-gray-600">{label}</span>
      <span className={`${strong ? "font-bold" : "font-medium"} ${colorClass ?? "text-gray-900"}`}>
        {value}
      </span>
    </div>
  );
}

export default function ResultPanel({ result, canSave, saving, saved, onReset }: ResultPanelProps) {
  return (
    <div className="lg:sticky lg:top-5">
      <Card className="bg-gray-50">
        <h3 className="mb-3 text-sm font-semibold">Live calculation</h3>

        <Row label="Total KM" value={formatINR(result.totalKm)} />
        <Row label="Litres (÷3)" value={formatINR(result.litres)} />
        <Row label="Fuel cost" value={"₹" + formatINR(result.fuelCost)} />
        <Row label="Broker commission" value={"₹" + formatINR(result.brokerCommissionAmount)} />
        <Row label="Driver" value={"₹" + formatINR(result.driver)} />
        <Row label="Projected expenses" value={"₹" + formatINR(result.projectedExpenses)} strong />
        <Row label="Per KM cost" value={"₹" + formatINR(result.perKmCost)} />
        <Row label="Margin / trip" value={"₹" + formatINR(result.marginPerTrip)} />
        <Row label="Final amount (exp + margin)" value={"₹" + formatINR(result.finalAmount)} strong />

        <hr className="my-2 border-dashed border-gray-300" />

        <Row label="Broker trip cost (ton×rate)" value={"₹" + formatINR(result.brokerTripCost)} />
        <Row label="Trip amount (broker cost − commission)" value={"₹" + formatINR(result.tripAmount)} strong />
        <Row
          label="Net margin"
          value={"₹" + formatINR(result.netMargin)}
          strong
          colorClass={result.netMargin < 0 ? "text-red-600" : "text-green-600"}
        />

        <hr className="my-2 border-dashed border-gray-300" />

        <Row label="Base closing rate/km" value={"₹" + formatINR(result.baseClosingRate)} />
        <Row label="Total quotation" value={"₹" + formatINR(result.totalQuotation)} strong />
        <Row label="Quotation / ton" value={"₹" + formatINR(result.quotationPerTon)} />

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            disabled={!canSave || saving}
            className={`flex-1 rounded-md px-3 py-3 text-sm font-semibold text-white sm:py-2.5 ${
              canSave && !saving ? "bg-green-600 hover:bg-green-700" : "cursor-not-allowed bg-gray-400"
            }`}
          >
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save as confirmed load"}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-md border border-gray-300 bg-white px-3 py-3 text-sm hover:bg-gray-50 sm:py-2.5"
          >
            Reset
          </button>
        </div>

        {!canSave && (
          <p className="mt-2 text-xs text-gray-400">Fill all required (*) fields to enable save.</p>
        )}
      </Card>
    </div>
  );
}

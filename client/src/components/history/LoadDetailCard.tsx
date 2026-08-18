import type { ConfirmedLoad } from "../../types/estimator";
import { formatINR } from "../../lib/calculations";

interface LoadDetailCardProps {
  load: ConfirmedLoad;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{label}</div>
      <div className="mt-0.5 text-sm text-gray-900">{value || "—"}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 sm:gap-x-8">{children}</div>
    </div>
  );
}

export default function LoadDetailCard({ load }: LoadDetailCardProps) {
  return (
    <div className="space-y-4">
      <Section title="Vehicle & route">
        <Field label="Vehicle number" value={load.vehicleNumber} />
        <Field label="Driver name" value={load.driverName} />
        <Field label="Broker details" value={load.brokerDetails} />
        <Field label="Loading date" value={load.loadingDate?.replace("T", " ")} />
        <Field label="Loading location" value={load.loadingLocation} />
        <Field label="Unloading date" value={load.unloadingDate?.replace("T", " ")} />
        <Field label="Unloading location" value={load.unloadingLocation} />
      </Section>

      <Section title="SKU & trip">
        <Field label="SKU" value={load.sku} />
        <Field label="Tonnage" value={String(load.tonnage)} />
        <Field label="Per ton price" value={"₹" + formatINR(Number(load.perTonPrice))} />
        <Field label="KM" value={String(load.km)} />
        <Field label="External point → mill KM" value={String(load.externalPointMillKm)} />
        <Field label="Total KM" value={formatINR(load.totalKm)} />
      </Section>

      <Section title="Expenses">
        <Field label="Fuel cost" value={"₹" + formatINR(load.fuelCost)} />
        <Field label="Broker commission" value={"₹" + formatINR(Number(load.brokerCommission))} />
        <Field label="Loading cost" value={"₹" + formatINR(Number(load.loadingCost))} />
        <Field label="Unloading cost" value={"₹" + formatINR(Number(load.unloadingCost))} />
        <Field label="RTO" value={"₹" + formatINR(Number(load.rto))} />
        <Field label="Fastag cost" value={"₹" + formatINR(Number(load.fastagCost))} />
        <Field label="Driver cost" value={"₹" + formatINR(load.driver)} />
      </Section>

      <Section title="Calculated result">
        <Field label="Broker trip cost" value={"₹" + formatINR(load.brokerTripCost)} />
        <Field label="Projected expenses" value={"₹" + formatINR(load.projectedExpenses)} />
        <Field label="Per KM cost" value={"₹" + formatINR(load.perKmCost)} />
        <Field label="Trip amount (Receivable)" value={"₹" + formatINR(load.tripAmount)} />
        <Field label="Margin per trip" value={"₹" + formatINR(load.marginPerTrip)} />
        <Field label="Final amount" value={"₹" + formatINR(load.finalAmount)} />
        <Field label="Net margin" value={"₹" + formatINR(load.netMargin)} />
        <Field label="Base closing rate/km" value={"₹" + formatINR(load.baseClosingRate)} />
        <Field label="Total quotation" value={"₹" + formatINR(load.totalQuotation)} />
        <Field label="Quotation / ton" value={"₹" + formatINR(load.quotationPerTon)} />
      </Section>

      <Field label="Saved on" value={new Date(load.timestamp).toLocaleString()} />
      <Field label="Rate version" value={load.rateVersion} />
    </div>
  );
}

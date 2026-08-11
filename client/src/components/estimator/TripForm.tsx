import type { UseFormReturn } from "react-hook-form";
import Card from "../common/Card";
import Input from "../common/Input";
import type { TripFormData } from "../../types/estimator";

interface TripFormProps {
  form: UseFormReturn<TripFormData>;
}

export default function TripForm({ form }: TripFormProps) {
  const { register, formState: { errors } } = form;

  return (
    <>
      <Card title="SKU & trip" className="mb-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="SKU"
            required
            placeholder="Powder bag"
            error={errors.sku}
            {...register("sku", { required: "SKU is required" })}
          />
          <Input
            label="Tonnage"
            required
            type="number"
            step="any"
            placeholder="30"
            error={errors.tonnage}
            {...register("tonnage", { required: "Tonnage is required" })}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Per ton price (₹)"
            required
            type="number"
            step="any"
            placeholder="1900"
            error={errors.perTonPrice}
            {...register("perTonPrice", { required: "Per ton price is required" })}
          />
          <Input
            label="KM"
            required
            type="number"
            step="any"
            placeholder="1000"
            error={errors.km}
            {...register("km", { required: "KM is required" })}
          />
        </div>
        <Input
          label="External point → mill KM (avg 100km)"
          required
          type="number"
          step="any"
          placeholder="50"
          error={errors.externalPointMillKm}
          {...register("externalPointMillKm", { required: "This field is required" })}
        />
      </Card>

      <Card title="Expenses" className="mb-6">
        <p className="mb-3 text-xs text-gray-400">
          Fuel cost is calculated automatically from total KM (see live calculation panel) — no manual entry needed.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Broker commission (₹)" type="number" step="any" placeholder="0" {...register("brokerCommission")} />
          <Input label="Loading cost (₹)" type="number" step="any" placeholder="1500" {...register("loadingCost")} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Unloading cost (₹)" type="number" step="any" placeholder="4500" {...register("unloadingCost")} />
          <Input label="RTO (₹)" type="number" step="any" placeholder="2500" {...register("rto")} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Fastag cost (₹)" type="number" step="any" placeholder="5500" {...register("fastagCost")} />
        </div>
      </Card>
    </>
  );
}

import type { UseFormReturn } from "react-hook-form";
import Card from "../common/Card";
import Input from "../common/Input";
import type { TripFormData } from "../../types/estimator";

interface VehicleFormProps {
  form: UseFormReturn<TripFormData>;
}

export default function VehicleForm({ form }: VehicleFormProps) {
  const { register, formState: { errors } } = form;

  return (
    <Card title="Vehicle & route" className="mb-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Vehicle number"
          required
          placeholder="TN52P8370"
          error={errors.vehicleNumber}
          {...register("vehicleNumber", { required: "Vehicle number is required" })}
        />
        <Input label="Driver name" placeholder="Alam Khan" {...register("driverName")} />
      </div>

      <Input
        label="Broker details (Name, Contact & Location)"
        required
        placeholder="Shivaroadline +91..."
        error={errors.brokerDetails}
        {...register("brokerDetails", { required: "Broker details are required" })}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Loading date"
          required
          type="datetime-local"
          error={errors.loadingDate}
          {...register("loadingDate", { required: "Loading date is required" })}
        />
        <Input
          label="Loading location"
          required
          placeholder="Devanahalli, KA"
          error={errors.loadingLocation}
          {...register("loadingLocation", { required: "Loading location is required" })}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Unloading date"
          required
          type="datetime-local"
          error={errors.unloadingDate}
          {...register("unloadingDate", { required: "Unloading date is required" })}
        />
        <Input
          label="Unloading location"
          required
          placeholder="Pune, MH"
          error={errors.unloadingLocation}
          {...register("unloadingLocation", { required: "Unloading location is required" })}
        />
      </div>
    </Card>
  );
}

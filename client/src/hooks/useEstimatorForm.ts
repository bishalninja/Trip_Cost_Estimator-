import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { emptyTripForm, type TripFormData } from "../types/estimator";
import { calculateTripCost } from "../lib/calculations";

export function useEstimatorForm() {
  const form = useForm<TripFormData>({
    defaultValues: emptyTripForm,
    mode: "onChange",
  });

  const values = form.watch();
  const result = useMemo(() => calculateTripCost(values), [values]);

  return { form, result };
}

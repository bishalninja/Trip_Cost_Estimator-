import { api } from "./axios";
import type { CalculationResult, ConfirmedLoad, TripFormData } from "../types/estimator";

export async function getLoads(): Promise<ConfirmedLoad[]> {
  const { data } = await api.get<ConfirmedLoad[]>("/loads");
  return data;
}

export async function saveLoad(
  form: TripFormData,
  result: CalculationResult
): Promise<ConfirmedLoad> {
  // brokerCommissionAmount is the parsed numeric version of form.brokerCommission,
  // computed for display only — the server's `brokerCommission` column already
  // stores the coerced number, so drop the duplicate key before sending.
  const { brokerCommissionAmount: _brokerCommissionAmount, ...resultToSend } = result;
  const { data } = await api.post<ConfirmedLoad>("/loads", { ...form, ...resultToSend });
  return data;
}

export async function deleteLoad(id: number): Promise<void> {
  await api.delete(`/loads/${id}`);
}

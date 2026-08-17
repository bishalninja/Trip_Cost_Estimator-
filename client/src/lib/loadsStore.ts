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
  // These four "...Amount" fields are just parsed numeric versions of the
  // matching TripFormData string fields (brokerCommission, loadingCost,
  // unloadingCost, rto, fastagCost) — computed for display only. The
  // server's DB columns already store the coerced numbers under the
  // original field names, so drop the duplicate keys before sending or
  // Prisma rejects them as unrecognized fields.
  const {
    brokerCommissionAmount: _brokerCommissionAmount,
    loadingCostAmount: _loadingCostAmount,
    unloadingCostAmount: _unloadingCostAmount,
    rtoAmount: _rtoAmount,
    fastagCostAmount: _fastagCostAmount,
    ...resultToSend
  } = result;
  const { data } = await api.post<ConfirmedLoad>("/loads", { ...form, ...resultToSend });
  return data;
}

export async function deleteLoad(id: number): Promise<void> {
  await api.delete(`/loads/${id}`);
}

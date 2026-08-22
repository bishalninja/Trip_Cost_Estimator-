import { api } from "./axios";
import type { ExpenseRequest, ExpenseRequestPayload } from "../types/expenseRequest";

export async function createExpenseRequest(
  payload: ExpenseRequestPayload
): Promise<ExpenseRequest> {
  const { data } = await api.post<ExpenseRequest>("/expense-requests", payload);
  return data;
}

export async function getExpenseRequestsForLoad(loadId: number): Promise<ExpenseRequest[]> {
  const { data } = await api.get<ExpenseRequest[]>("/expense-requests", { params: { loadId } });
  return data;
}

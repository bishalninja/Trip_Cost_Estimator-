import type { ExpenseRequest } from "../types/expenseRequest";

interface DraftLineItem {
  expenseHead: string;
  requestingAmount: string;
  remark: string;
}

const draftKey = (loadId: number) => `request-form-draft-${loadId}`;

export function saveDraft(loadId: number, lineItems: DraftLineItem[]): void {
  try {
    localStorage.setItem(draftKey(loadId), JSON.stringify(lineItems));
  } catch {
    // localStorage can fail (private browsing, quota) — draft is a nice-to-have, never block on it
  }
}

export function loadDraft(loadId: number): DraftLineItem[] | null {
  try {
    const raw = localStorage.getItem(draftKey(loadId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraft(loadId: number): void {
  try {
    localStorage.removeItem(draftKey(loadId));
  } catch {
    // ignore
  }
}

/**
 * Sums requestingAmount across every previous submitted request for this
 * load, grouped by expenseHead — this becomes the new request's
 * "Already Paid" baseline for each row.
 */
export function computeAlreadyPaidByHead(
  previousRequests: ExpenseRequest[]
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const req of previousRequests) {
    for (const li of req.lineItems) {
      totals[li.expenseHead] = (totals[li.expenseHead] || 0) + (li.requestingAmount || 0);
    }
  }
  return totals;
}

/**
 * Finds the most recent non-empty remark per expense head, looking across
 * every previous submitted request for this load, newest first. Used to
 * show "last time you said..." context inline in the form.
 */
export function computeLastRemarkByHead(
  previousRequests: ExpenseRequest[]
): Record<string, string> {
  // previousRequests is assumed newest-first (that's how the page fetches
  // and prepends them) — first non-empty remark found per head wins.
  const lastRemark: Record<string, string> = {};
  for (const req of previousRequests) {
    for (const li of req.lineItems) {
      if (li.remark && !lastRemark[li.expenseHead]) {
        lastRemark[li.expenseHead] = li.remark;
      }
    }
  }
  return lastRemark;
}

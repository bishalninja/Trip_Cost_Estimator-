export interface ExpenseLineItem {
  expenseHead: string;
  fixedAmount: number; // read-only, pulled from the trip
  alreadyPaid: number; // read-only, auto-computed: sum of requestingAmount across all previous submitted requests for this head
  requestingAmount: string; // user input, kept as string while editing
  remark: string;
}

export interface ExpenseRequestPayload {
  loadId: number;
  lineItems: {
    expenseHead: string;
    fixedAmount: number;
    alreadyPaid: number;
    requestingAmount: number;
    remark: string;
  }[];
}

export interface ExpenseRequest {
  id: number;
  loadId: number;
  lineItems: ExpenseRequestPayload["lineItems"];
  totalFixedAmount: number;
  totalAlreadyPaid: number;
  totalRequestingAmount: number;
  createdAt: string;
}

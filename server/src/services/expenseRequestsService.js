const prisma = require("../lib/prisma");

async function listByLoad(loadId) {
  return prisma.expenseRequest.findMany({
    where: { loadId: Number(loadId) },
    orderBy: { id: "desc" },
  });
}

async function listAll() {
  return prisma.expenseRequest.findMany({
    orderBy: { id: "desc" },
    include: { load: true },
  });
}

async function createExpenseRequest(payload) {
  const { loadId, lineItems } = payload;

  const totalFixedAmount = lineItems.reduce((s, li) => s + (Number(li.fixedAmount) || 0), 0);
  const totalAlreadyPaid = lineItems.reduce((s, li) => s + (Number(li.alreadyPaid) || 0), 0);
  const totalRequestingAmount = lineItems.reduce((s, li) => s + (Number(li.requestingAmount) || 0), 0);

  return prisma.expenseRequest.create({
    data: {
      loadId: Number(loadId),
      lineItems,
      totalFixedAmount,
      totalAlreadyPaid,
      totalRequestingAmount,
    },
  });
}

module.exports = { listByLoad, listAll, createExpenseRequest };

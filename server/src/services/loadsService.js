const prisma = require("../lib/prisma");

const NUMERIC_FIELDS = [
  "tonnage", "perTonPrice", "km", "externalPointMillKm", "brokerCommission",
  "loadingCost", "unloadingCost", "rto", "fastagCost", "totalKm", "litres",
  "fuelCost", "driver", "projectedExpenses", "perKmCost", "marginPerTrip",
  "finalAmount", "brokerTripCost", "tripAmount", "netMargin", "baseClosingRate",
  "totalQuotation", "quotationPerTon",
];

function coerceNumbers(body) {
  const out = { ...body };
  for (const f of NUMERIC_FIELDS) {
    if (out[f] !== undefined && out[f] !== null) out[f] = Number(out[f]) || 0;
  }
  return out;
}

async function listLoads() {
  return prisma.load.findMany({ orderBy: { id: "desc" } });
}

async function getLoadById(id) {
  return prisma.load.findUnique({ where: { id: Number(id) } });
}

async function createLoad(payload) {
  const count = await prisma.load.count();
  const data = coerceNumbers(payload);
  delete data.id;
  delete data.timestamp;
  delete data.status;

  return prisma.load.create({
    data: { ...data, serial: count + 1 },
  });
}

async function deleteLoad(id) {
  return prisma.load.delete({ where: { id: Number(id) } });
}

module.exports = { listLoads, getLoadById, createLoad, deleteLoad };

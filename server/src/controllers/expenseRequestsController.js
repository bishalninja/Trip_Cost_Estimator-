const service = require("../services/expenseRequestsService");

async function getAll(req, res, next) {
  try {
    const { loadId } = req.query;
    const requests = loadId ? await service.listByLoad(loadId) : await service.listAll();
    res.json(requests);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { loadId, lineItems } = req.body || {};
    if (!loadId || !Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({ error: "loadId and a non-empty lineItems array are required" });
    }
    const created = await service.createExpenseRequest({ loadId, lineItems });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, create };

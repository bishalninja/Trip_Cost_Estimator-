const loadsService = require("../services/loadsService");

async function getAll(req, res, next) {
  try {
    const loads = await loadsService.listLoads();
    res.json(loads);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const load = await loadsService.getLoadById(req.params.id);
    if (!load) return res.status(404).json({ error: "Load not found" });
    res.json(load);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const load = await loadsService.createLoad(req.body);
    res.status(201).json(load);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await loadsService.deleteLoad(req.params.id);
    res.status(204).end();
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Load not found" });
    next(err);
  }
}

module.exports = { getAll, getOne, create, remove };

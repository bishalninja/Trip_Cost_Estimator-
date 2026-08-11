const REQUIRED_FIELDS = [
  "vehicleNumber", "brokerDetails", "loadingDate", "loadingLocation",
  "unloadingDate", "unloadingLocation", "sku", "tonnage", "perTonPrice",
  "km", "externalPointMillKm",
];

function validateLoadPayload(req, res, next) {
  const body = req.body || {};
  const missing = REQUIRED_FIELDS.filter((f) => body[f] === undefined || body[f] === "" || body[f] === null);

  if (missing.length) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
  }
  next();
}

module.exports = { validateLoadPayload };

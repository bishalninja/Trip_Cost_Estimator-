const express = require("express");
const controller = require("../controllers/loadsController");
const { validateLoadPayload } = require("../middleware/validateLoad");

const router = express.Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getOne);
router.post("/", validateLoadPayload, controller.create);
router.delete("/:id", controller.remove);

module.exports = router;

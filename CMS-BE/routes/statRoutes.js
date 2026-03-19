const express = require("express");
const {
  getStats,
  createStat,
  updateStat,
  deleteStat,
} = require("../controllers/statController");

const router = express.Router();

router.get("/", getStats);
router.post("/", createStat);
router.put("/:id", updateStat);
router.delete("/:id", deleteStat);

module.exports = router;

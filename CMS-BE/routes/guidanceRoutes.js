const express = require("express");
const router = express.Router();

const {
  submitGuidanceRequest,
  listGuidanceRequests,
  getGuidanceRequest,
  updateGuidanceRequest,
} = require("../controllers/guidanceController");

const { protect, admin } = require("../middleware/authMiddleware");

// Public: used by website "Get Guidance" dialog
router.post("/", submitGuidanceRequest);

// Admin: view/manage guidance requests
router.get("/", protect, admin, listGuidanceRequests);
router.get("/:id", protect, admin, getGuidanceRequest);
router.patch("/:id", protect, admin, updateGuidanceRequest);

module.exports = router;


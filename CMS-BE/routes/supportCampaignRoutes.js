// routes/supportCampaignRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/supportCampaignController");

// GET support campaign data (default)
router.get("/", controller.getSupportCampaign);

// GET donation options
router.get("/donation-options", controller.getDonationOptions);

// GET support campaign by ID
router.get("/:id", controller.getSupportCampaignById);

// GET donation options for specific campaign
router.get("/:id/donation-options", controller.getDonationOptions);

module.exports = router;


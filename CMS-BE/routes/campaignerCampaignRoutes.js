// routes/campaignerCampaignRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/campaignerCampaignController");

// GET all campaigner campaigns
router.get("/", controller.getAllCampaignerCampaigns);

// GET campaigner campaign by ID
router.get("/:id", controller.getCampaignerCampaignById);

module.exports = router;


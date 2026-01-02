const express = require("express");
const router = express.Router();

const {
  getBuildSchoolCampaign,
  getAllCampaigns,
  getCampaignBySlug,
  createCampaign,
  updateCampaign,
  submitDonation,
} = require("../controllers/build-school");

// 🔹 GET build-school campaign (default route - returns build-school campaign)
router.get("/", getBuildSchoolCampaign);

// 🔹 POST create campaign (for seeding/initial setup)
router.post("/create", createCampaign);

// 🔹 PUT update campaign
router.put("/:id", updateCampaign);

// 🔹 POST donation (must be before /:slug to avoid conflict)
router.post("/donate", submitDonation);

// 🔹 GET single campaign by slug (build-school)
router.get("/:slug", getCampaignBySlug);

module.exports = router;

const express = require("express");
const router = express.Router();
const controller = require("../controllers/donateToClauseController");

router.get("/", controller.getAllCampaigns);
router.get("/:id", controller.getCampaignById);
router.get("/:id/donations", controller.getDonationOptions);
router.post("/donate", controller.submitDonation);

module.exports = router;

// controllers/donateToClauseController.js
const CampaignManagement = require("../models/CampaignManagement");

// 🔥 Helper: disable caching (fix 304 Not Modified issue)
const disableCache = (res) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });
};

// --------------------
// Get all campaigns
// GET /api/campaigns
// --------------------
const getAllCampaigns = async (req, res) => {
  try {
    disableCache(res);

    const campaigns = await CampaignManagement.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 });

    const formattedCampaigns = campaigns.map(c => ({
      id: c._id,
      title: c.campaignTitle,
      description: c.shortDescription || c.campaignTitle,
      image: c.heroImage || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80",
      goalAmount: c.goalAmount,
      raisedAmount: c.raisedAmount,
      category: c.category,
      deadline: c.deadline,
      supporters: c.supporters,
      featured: c.featured,
    }));

    return res.status(200).json(formattedCampaigns);
  } catch (error) {
    console.error("Get campaigns error:", error);
    return res.status(500).json({ message: "Failed to fetch campaigns" });
  }
};

// --------------------
// Get campaign by ID
// GET /api/campaigns/:id
// --------------------
const getCampaignById = async (req, res) => {
  try {
    disableCache(res);

    const { id } = req.params;
    const campaign = await CampaignManagement.findById(id);

    if (!campaign || !campaign.isActive) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const formattedCampaign = {
      id: campaign._id,
      title: campaign.campaignTitle,
      description: campaign.shortDescription || campaign.campaignTitle,
      image: campaign.heroImage || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80",
      goalAmount: campaign.goalAmount,
      raisedAmount: campaign.raisedAmount,
      category: campaign.category,
      deadline: campaign.deadline,
      supporters: campaign.supporters,
      featured: campaign.featured,
    };

    return res.status(200).json(formattedCampaign);
  } catch (error) {
    console.error("Get campaign error:", error);
    return res.status(500).json({ message: "Failed to fetch campaign" });
  }
};

// --------------------
// Get donation options
// GET /api/campaigns/:id/donations
// --------------------
const getDonationOptions = async (req, res) => {
  try {
    disableCache(res);

    const donationOptions = [
      { amount: 100, label: "₹100" },
      { amount: 500, label: "₹500" },
      { amount: 1000, label: "₹1000" },
      { amount: 2500, label: "₹2500" },
    ];

    return res.status(200).json(donationOptions);
  } catch (error) {
    console.error("Donation options error:", error);
    return res.status(500).json({ message: "Failed to fetch donation options" });
  }
};

// --------------------
// Submit donation (mock)
// POST /api/campaigns/donate
// --------------------
const submitDonation = async (req, res) => {
  try {
    disableCache(res);

    const { campaignId, amount } = req.body;

    if (!campaignId || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const campaign = await CampaignManagement.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Update real amount
    campaign.raisedAmount += Number(amount);
    campaign.supporters += 1;
    await campaign.save();

    return res.status(200).json({
      message: "Donation successful",
      campaign: {
        id: campaign._id,
        title: campaign.campaignTitle,
        raisedAmount: campaign.raisedAmount,
        supporters: campaign.supporters
      },
    });
  } catch (error) {
    console.error("Submit donation error:", error);
    return res.status(500).json({ message: "Donation failed" });
  }
};

// --------------------
module.exports = {
  getAllCampaigns,
  getCampaignById,
  getDonationOptions,
  submitDonation,
};


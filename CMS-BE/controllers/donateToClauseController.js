// controllers/donateToClauseController.js
const Campaign = require("../models/Campaign");

// controllers/donateToClauseController.js

// 🔥 Helper: disable caching (fix 304 Not Modified issue)
const disableCache = (res) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });
};

// --------------------
// STATIC CAMPAIGN DATA
// --------------------
const campaigns = [
  {
    id: "build-school",
    title: "Build a School in Rural Telangana",
    description:
      "Help us construct a school building for 200+ children in a remote village where kids currently study under trees.",
    image:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80",
    goalAmount: 5000000,
    raisedAmount: 3250000,
    category: "Education",
    deadline: "2025-03-31",
    supporters: 124,
    featured: true,
  },
  {
    id: "nutritious-meals",
    title: "Sponsor 10,000 Nutritious Meals",
    description:
      "Provide millet-based nutritious meals to underprivileged children for the next 3 months across our Aikya Vidya centers.",
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80",
    goalAmount: 600000,
    raisedAmount: 485000,
    category: "Food",
    deadline: "2025-02-28",
    supporters: 256,
    featured: true,
  },
  {
    id: "train-teachers",
    title: "Train 50 Aikya Vidya Teachers",
    description:
      "Empower women from local communities to become certified teachers, providing them livelihood and children quality education.",
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80",
    goalAmount: 400000,
    raisedAmount: 175000,
    category: "Empowerment",
    deadline: "2025-06-30",
    supporters: 67,
    featured: false,
  },
  {
    id: "chenchu-community",
    title: "Support Chenchu Tribal Community",
    description:
      "Provide education kits, health support, and skill training to 100 children from Chenchu tribal communities.",
    image:
      "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1000&q=80",
    goalAmount: 800000,
    raisedAmount: 220000,
    category: "Community",
    deadline: "2025-05-15",
    supporters: 43,
    featured: false,
  },
  {
    id: "health-camps",
    title: "Organize Health Camps in 20 Villages",
    description:
      "Conduct free medical camps providing health checkups, medicines, and basic treatments to underserved communities.",
    image:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1000&q=80",
    goalAmount: 350000,
    raisedAmount: 280000,
    category: "Healthcare",
    deadline: "2025-04-20",
    supporters: 89,
    featured: false,
  },
  {
    id: "setup-libraries",
    title: "Setup Libraries in 10 Centers",
    description:
      "Create mini libraries with 500+ books in each Aikya Vidya center to foster reading habit among children.",
    image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1000&q=80",
    goalAmount: 250000,
    raisedAmount: 95000,
    category: "Education",
    deadline: "2025-07-31",
    supporters: 31,
    featured: false,
  },
];

// --------------------
// Get all campaigns
// GET /api/campaigns
// --------------------
const getAllCampaigns = async (req, res) => {
  try {
    disableCache(res);
    return res.status(200).json(campaigns);
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
    const campaign = campaigns.find((c) => c.id === id);

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    return res.status(200).json(campaign);
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

    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Mock update
    campaign.raisedAmount += Number(amount);
    campaign.supporters += 1;

    return res.status(200).json({
      message: "Donation successful",
      campaign,
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


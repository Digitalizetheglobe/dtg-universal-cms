// controllers/campaignerCampaignController.js
// Controller for campaign-page (list of campaigner campaigns)

// Helper: disable caching
const disableCache = (res) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });
};

// --------------------
// CAMPAIGNER CAMPAIGNS DATA
// --------------------
const campaignerCampaigns = [
  {
    id: "support-compaign",
    fundraiserName: "Priya Sharma",
    fundraiserImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    story: "Help me sponsor education for 50 underprivileged children in my village",
    targetAmount: 150000,
    raisedAmount: 95000,
    supporters: 23,
    category: "Education",
    campaignImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
    location: "Nizamabad, Telangana"
  },
  {
    id: "support-compaign",
    fundraiserName: "Rajesh Kumar",
    fundraiserImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    story: "Raising funds for medical equipment for our local health center",
    targetAmount: 200000,
    raisedAmount: 145000,
    supporters: 34,
    category: "Healthcare",
    campaignImage: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=600&fit=crop",
    location: "Warangal, Telangana"
  },
  {
    id: "support-compaign",
    fundraiserName: "Anita Reddy",
    fundraiserImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    story: "Providing nutritious meals to 100 children for 3 months",
    targetAmount: 80000,
    raisedAmount: 65000,
    supporters: 45,
    category: "Food",
    campaignImage: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=600&fit=crop",
    location: "Hyderabad, Telangana"
  },
  {
    id: "support-compaign",
    fundraiserName: "Vikram Patel",
    fundraiserImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    story: "Building a community library with 1000+ books for rural kids",
    targetAmount: 120000,
    raisedAmount: 45000,
    supporters: 18,
    category: "Education",
    campaignImage: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=600&fit=crop",
    location: "Karimnagar, Telangana"
  },
  {
    id: "support-compaign",
    fundraiserName: "Meera Devi",
    fundraiserImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop",
    story: "Skill training program for 30 women in tailoring and handicrafts",
    targetAmount: 100000,
    raisedAmount: 72000,
    supporters: 28,
    category: "Empowerment",
    campaignImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
    location: "Khammam, Telangana"
  },
  {
    id: "support-compaign",
    fundraiserName: "Arun Singh",
    fundraiserImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    story: "Sports equipment for tribal children to discover their athletic potential",
    targetAmount: 60000,
    raisedAmount: 38000,
    supporters: 21,
    category: "Community",
    campaignImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop",
    location: "Adilabad, Telangana"
  }
];

// --------------------
// Get all campaigner campaigns
// GET /api/campaigner-campaigns
// --------------------
const getAllCampaignerCampaigns = async (req, res) => {
  try {
    disableCache(res);
    return res.status(200).json(campaignerCampaigns);
  } catch (error) {
    console.error("Get campaigner campaigns error:", error);
    return res.status(500).json({ message: "Failed to fetch campaigner campaigns" });
  }
};

// --------------------
// Get campaigner campaign by ID
// GET /api/campaigner-campaigns/:id
// --------------------
const getCampaignerCampaignById = async (req, res) => {
  try {
    disableCache(res);

    const { id } = req.params;
    const campaign = campaignerCampaigns.find((c) => c.id === id);

    if (!campaign) {
      return res.status(404).json({ message: "Campaigner campaign not found" });
    }

    return res.status(200).json(campaign);
  } catch (error) {
    console.error("Get campaigner campaign error:", error);
    return res.status(500).json({ message: "Failed to fetch campaigner campaign" });
  }
};

// --------------------
module.exports = {
  getAllCampaignerCampaigns,
  getCampaignerCampaignById,
};


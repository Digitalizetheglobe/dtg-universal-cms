const CampaignerCampaignManagement = require('../models/CampaignerCampaignManagement');

// Helper: disable caching
const disableCache = (res) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });
};

// --------------------
// Get all campaigner campaigns
// GET /api/campaigner-campaigns
// --------------------
const getAllCampaignerCampaigns = async (req, res) => {
  try {
    disableCache(res);

    const campaigns = await CampaignerCampaignManagement.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 });

    const formattedCampaigns = campaigns.map(campaign => ({
      id: campaign._id,
      fundraiserName: campaign.fundraiserName,
      fundraiserImage: campaign.fundraiserPhoto || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      story: campaign.campaignStory,
      targetAmount: campaign.targetAmount,
      raisedAmount: campaign.raisedAmount,
      supporters: campaign.supportersCount,
      category: campaign.category,
      campaignImage: campaign.campaignImage || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
      location: campaign.location
    }));

    return res.status(200).json(formattedCampaigns);
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
    const campaign = await CampaignerCampaignManagement.findById(id);

    if (!campaign || !campaign.isActive) {
      return res.status(404).json({ message: "Campaigner campaign not found" });
    }

    const formattedCampaign = {
      id: campaign._id,
      fundraiserName: campaign.fundraiserName,
      fundraiserImage: campaign.fundraiserPhoto || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      story: campaign.campaignStory,
      targetAmount: campaign.targetAmount,
      raisedAmount: campaign.raisedAmount,
      supporters: campaign.supportersCount,
      category: campaign.category,
      campaignImage: campaign.campaignImage || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
      location: campaign.location
    };

    return res.status(200).json(formattedCampaign);
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


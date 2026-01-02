const BuildSchoolCampaign = require("../models/BuildSchool");

// 🔥 disable cache (prevents 304 issue)
const disableCache = res => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });
};

// --------------------
// GET build-school campaign (default route)
// GET /api/build-school
// --------------------
exports.getBuildSchoolCampaign = async (req, res) => {
  try {
    disableCache(res);

    const campaign = await BuildSchoolCampaign.findOne({ slug: "build-school" }).lean();

    if (!campaign) {
      return res.status(404).json({ message: "Build school campaign not found" });
    }

    res.status(200).json(campaign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------
// GET all campaigns
// --------------------
exports.getAllCampaigns = async (req, res) => {
  try {
    disableCache(res);

    const campaigns = await BuildSchoolCampaign.find().lean();
    res.status(200).json(campaigns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------
// GET campaign by slug
// /api/campaigns/build-school
// --------------------
exports.getCampaignBySlug = async (req, res) => {
  try {
    disableCache(res);

    const { slug } = req.params;

    const campaign = await BuildSchoolCampaign.findOne({ slug }).lean();

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.status(200).json(campaign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------
// POST create campaign
// POST /api/build-school/create
// --------------------
exports.createCampaign = async (req, res) => {
  try {
    disableCache(res);

    const {
      slug,
      title,
      description,
      image,
      goalAmount,
      raisedAmount,
      supporters,
      category,
      deadline,
      featured,
    } = req.body;

    // Check if campaign with slug already exists
    const existingCampaign = await BuildSchoolCampaign.findOne({ slug: slug || "build-school" });
    if (existingCampaign) {
      return res.status(400).json({ 
        message: "Campaign with this slug already exists",
        campaign: existingCampaign 
      });
    }

    const campaign = new BuildSchoolCampaign({
      slug: slug || "build-school",
      title: title || "Build a School in Rural Telangana",
      description: description || "Give 200+ children a safe place to learn and grow in a permanent school building",
      image: image || "/donation-section/stacked-books.jpg",
      goalAmount: goalAmount || 5000000,
      raisedAmount: raisedAmount || 3250000,
      supporters: supporters || 124,
      category: category || "Education",
      deadline: deadline || new Date("2025-12-31"),
      featured: featured !== undefined ? featured : true,
      campaignImpact: req.body.campaignImpact || {
        classrooms: 6,
        students: "200+",
        teachers: 8,
        duration: "25+ years",
      },
      fundUtilization: req.body.fundUtilization || [
        {
          name: "Construction Labor",
          percentage: 50,
          amount: 2500000,
          description: "Building classrooms, repairing infrastructure, labor costs",
        },
        {
          name: "Educational Materials",
          percentage: 30,
          amount: 1500000,
          description: "Books, stationery, learning kits, teaching aids",
        },
        {
          name: "Food Supplies",
          percentage: 20,
          amount: 1000000,
          description: "Nutritious meals, mid-day snacks, distribution logistics",
        },
      ],
    });

    await campaign.save();

    res.status(201).json({
      message: "Campaign created successfully",
      campaign,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------
// PUT/PATCH update campaign
// PUT /api/build-school/:id or /api/build-school/update
// --------------------
exports.updateCampaign = async (req, res) => {
  try {
    disableCache(res);

    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle deadline string conversion
    if (updateData.deadline && typeof updateData.deadline === 'string') {
      updateData.deadline = new Date(updateData.deadline);
    }

    const campaign = await BuildSchoolCampaign.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.status(200).json({
      message: "Campaign updated successfully",
      campaign,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------
// POST donation
// --------------------
exports.submitDonation = async (req, res) => {
  try {
    disableCache(res);

    const { campaignId, amount } = req.body;

    const campaign = await BuildSchoolCampaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    campaign.raisedAmount += Number(amount);
    campaign.supporters += 1;

    await campaign.save();

    res.status(200).json({
      message: "Donation successful",
      campaign,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

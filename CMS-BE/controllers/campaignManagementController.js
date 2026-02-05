const CampaignManagement = require('../models/CampaignManagement');

// Get all campaigns
const getCampaigns = async (req, res) => {
    try {
        const campaigns = await CampaignManagement.find().sort({ displayOrder: 1, createdAt: -1 });
        res.status(200).json({
            success: true,
            data: campaigns
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Get active campaigns only (for frontend)
const getActiveCampaigns = async (req, res) => {
    try {
        const campaigns = await CampaignManagement.find({
            'basicInfo.isActive': true,
            isActive: true
        }).sort({ displayOrder: 1, createdAt: -1 });
        res.status(200).json({
            success: true,
            data: campaigns
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Get single campaign by ID
const getCampaignById = async (req, res) => {
    try {
        const campaign = await CampaignManagement.findById(req.params.id);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }
        res.status(200).json({
            success: true,
            data: campaign
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Get single campaign by slug
const getCampaignBySlug = async (req, res) => {
    try {
        const campaign = await CampaignManagement.findOne({ 'basicInfo.slug': req.params.slug });
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }
        res.status(200).json({
            success: true,
            data: campaign
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Create campaign
const createCampaign = async (req, res) => {
    try {
        // Generate slug if not provided
        if (req.body.basicInfo && req.body.basicInfo.title && !req.body.basicInfo.slug) {
            req.body.basicInfo.slug = req.body.basicInfo.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }

        const campaign = await CampaignManagement.create(req.body);
        res.status(201).json({
            success: true,
            data: campaign,
            message: 'Campaign created successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Bad Request',
            error: error.message
        });
    }
};

// Update campaign
const updateCampaign = async (req, res) => {
    try {
        const campaign = await CampaignManagement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }
        res.status(200).json({
            success: true,
            data: campaign,
            message: 'Campaign updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Bad Request',
            error: error.message
        });
    }
};

// Toggle campaign status
const toggleCampaignStatus = async (req, res) => {
    try {
        const campaign = await CampaignManagement.findById(req.params.id);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Toggle the isActive status
        const newStatus = req.body.isActive !== undefined ? req.body.isActive : !campaign.basicInfo.isActive;

        campaign.basicInfo.isActive = newStatus;
        campaign.isActive = newStatus;
        await campaign.save();

        res.status(200).json({
            success: true,
            data: campaign,
            message: `Campaign ${newStatus ? 'activated' : 'deactivated'} successfully`
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Bad Request',
            error: error.message
        });
    }
};

// Delete campaign
const deleteCampaign = async (req, res) => {
    try {
        const campaign = await CampaignManagement.findByIdAndDelete(req.params.id);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }
        res.status(200).json({
            success: true,
            data: {},
            message: 'Campaign deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Add donor to campaign
const addDonor = async (req, res) => {
    try {
        const campaign = await CampaignManagement.findById(req.params.id);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        const { name, amount, isAnonymous } = req.body;

        // Add to recent donors
        campaign.donorWall.recentDonors.unshift({
            name: isAnonymous ? 'Anonymous' : name,
            amount,
            date: new Date(),
            isAnonymous
        });

        // Keep only last 50 donors
        if (campaign.donorWall.recentDonors.length > 50) {
            campaign.donorWall.recentDonors = campaign.donorWall.recentDonors.slice(0, 50);
        }

        // Update raised amount
        campaign.funds.raisedAmount = (campaign.funds.raisedAmount || 0) + amount;

        // Increment total donors count
        campaign.funds.totalDonors = (campaign.funds.totalDonors || 0) + 1;

        await campaign.save();

        res.status(200).json({
            success: true,
            data: campaign,
            message: 'Donation recorded successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Bad Request',
            error: error.message
        });
    }
};

module.exports = {
    getCampaigns,
    getActiveCampaigns,
    getCampaignById,
    getCampaignBySlug,
    createCampaign,
    updateCampaign,
    toggleCampaignStatus,
    deleteCampaign,
    addDonor
};

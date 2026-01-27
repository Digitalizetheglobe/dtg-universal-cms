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

// Get single campaign
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

// Create campaign
const createCampaign = async (req, res) => {
    try {
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

// Toggle featured status
const toggleFeatured = async (req, res) => {
    try {
        const campaign = await CampaignManagement.findById(req.params.id);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }
        campaign.featured = !campaign.featured;
        await campaign.save();
        res.status(200).json({
            success: true,
            data: campaign,
            message: `Campaign ${campaign.featured ? 'featured' : 'unfeatured'} successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

module.exports = {
    getCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    toggleFeatured
};


const CampaignerCampaignManagement = require('../models/CampaignerCampaignManagement');

// Get all campaigner campaigns
const getCampaignerCampaigns = async (req, res) => {
    try {
        const campaigns = await CampaignerCampaignManagement.find().sort({ displayOrder: 1, createdAt: -1 });
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

// Get single campaigner campaign
const getCampaignerCampaignById = async (req, res) => {
    try {
        const campaign = await CampaignerCampaignManagement.findById(req.params.id);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaigner campaign not found'
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

// Create campaigner campaign
const createCampaignerCampaign = async (req, res) => {
    try {
        const campaign = await CampaignerCampaignManagement.create(req.body);
        res.status(201).json({
            success: true,
            data: campaign,
            message: 'Campaigner campaign created successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Bad Request',
            error: error.message
        });
    }
};

// Update campaigner campaign
const updateCampaignerCampaign = async (req, res) => {
    try {
        const campaign = await CampaignerCampaignManagement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaigner campaign not found'
            });
        }
        res.status(200).json({
            success: true,
            data: campaign,
            message: 'Campaigner campaign updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Bad Request',
            error: error.message
        });
    }
};

// Delete campaigner campaign
const deleteCampaignerCampaign = async (req, res) => {
    try {
        const campaign = await CampaignerCampaignManagement.findByIdAndDelete(req.params.id);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaigner campaign not found'
            });
        }
        res.status(200).json({
            success: true,
            data: {},
            message: 'Campaigner campaign deleted successfully'
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
    getCampaignerCampaigns,
    getCampaignerCampaignById,
    createCampaignerCampaign,
    updateCampaignerCampaign,
    deleteCampaignerCampaign
};


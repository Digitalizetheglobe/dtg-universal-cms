const DonationKitManagement = require('../models/DonationKitManagement');

// Get all kits
const getKits = async (req, res) => {
    try {
        const kits = await DonationKitManagement.find().sort({ displayOrder: 1, createdAt: -1 });
        res.status(200).json({
            success: true,
            data: kits
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Get single kit
const getKitById = async (req, res) => {
    try {
        const kit = await DonationKitManagement.findById(req.params.id);
        if (!kit) {
            return res.status(404).json({
                success: false,
                message: 'Kit not found'
            });
        }
        res.status(200).json({
            success: true,
            data: kit
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Create kit
const createKit = async (req, res) => {
    try {
        const kit = await DonationKitManagement.create(req.body);
        res.status(201).json({
            success: true,
            data: kit,
            message: 'Kit created successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Bad Request',
            error: error.message
        });
    }
};

// Update kit
const updateKit = async (req, res) => {
    try {
        const kit = await DonationKitManagement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!kit) {
            return res.status(404).json({
                success: false,
                message: 'Kit not found'
            });
        }
        res.status(200).json({
            success: true,
            data: kit,
            message: 'Kit updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Bad Request',
            error: error.message
        });
    }
};

// Delete kit
const deleteKit = async (req, res) => {
    try {
        const kit = await DonationKitManagement.findByIdAndDelete(req.params.id);
        if (!kit) {
            return res.status(404).json({
                success: false,
                message: 'Kit not found'
            });
        }
        res.status(200).json({
            success: true,
            data: {},
            message: 'Kit deleted successfully'
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
    getKits,
    getKitById,
    createKit,
    updateKit,
    deleteKit
};

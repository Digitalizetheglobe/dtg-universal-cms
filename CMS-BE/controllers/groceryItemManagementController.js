const GroceryItemManagement = require('../models/GroceryItemManagement');

// Get all grocery items
const getGroceryItems = async (req, res) => {
    try {
        const items = await GroceryItemManagement.find().sort({ displayOrder: 1, createdAt: -1 });
        res.status(200).json({
            success: true,
            data: items
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Get single grocery item
const getGroceryItemById = async (req, res) => {
    try {
        const item = await GroceryItemManagement.findById(req.params.id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Grocery item not found'
            });
        }
        res.status(200).json({
            success: true,
            data: item
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Create grocery item
const createGroceryItem = async (req, res) => {
    try {
        const item = await GroceryItemManagement.create(req.body);
        res.status(201).json({
            success: true,
            data: item,
            message: 'Grocery item created successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Bad Request',
            error: error.message
        });
    }
};

// Update grocery item
const updateGroceryItem = async (req, res) => {
    try {
        const item = await GroceryItemManagement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Grocery item not found'
            });
        }
        res.status(200).json({
            success: true,
            data: item,
            message: 'Grocery item updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Bad Request',
            error: error.message
        });
    }
};

// Delete grocery item
const deleteGroceryItem = async (req, res) => {
    try {
        const item = await GroceryItemManagement.findByIdAndDelete(req.params.id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Grocery item not found'
            });
        }
        res.status(200).json({
            success: true,
            data: {},
            message: 'Grocery item deleted successfully'
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
    getGroceryItems,
    getGroceryItemById,
    createGroceryItem,
    updateGroceryItem,
    deleteGroceryItem
};


const DonationKit = require('../models/DonationKitManagement');

// Get all donation kits (public endpoint)
const getDonationKits = async (req, res) => {
  try {
    const { active } = req.query;

    // Build query
    const query = {};
    if (active === 'true' || active === undefined) {
      query.isActive = true;
    }

    const kits = await DonationKit.find(query)
      .sort({ displayOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: kits,
      total: kits.length
    });
  } catch (error) {
    console.error('Error fetching donation kits:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get donation kit by ID
const getDonationKitById = async (req, res) => {
  try {
    const kit = await DonationKit.findById(req.params.id);

    if (!kit) {
      return res.status(404).json({
        success: false,
        message: 'Donation kit not found'
      });
    }

    res.status(200).json({
      success: true,
      data: kit
    });
  } catch (error) {
    console.error('Error fetching donation kit:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get donation kit by slug
const getDonationKitBySlug = async (req, res) => {
  try {
    const kit = await DonationKit.findOne({
      slug: req.params.slug,
      isActive: true
    });

    if (!kit) {
      return res.status(404).json({
        success: false,
        message: 'Donation kit not found'
      });
    }

    res.status(200).json({
      success: true,
      data: kit
    });
  } catch (error) {
    console.error('Error fetching donation kit by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create new donation kit
const createDonationKit = async (req, res) => {
  try {
    const { title, price, img, description, included, highlight, displayOrder, isActive } = req.body;

    // Validate required fields
    if (!title || !price || !img || !description || !highlight) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, price, img, description, and highlight are required'
      });
    }

    const kit = new DonationKit({
      title,
      price,
      img,
      description,
      included: included || [],
      highlight,
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    const savedKit = await kit.save();

    res.status(201).json({
      success: true,
      data: savedKit,
      message: 'Donation kit created successfully'
    });
  } catch (error) {
    console.error('Error creating donation kit:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A donation kit with this slug already exists'
      });
    }

    res.status(400).json({
      success: false,
      message: 'Bad Request',
      error: error.message
    });
  }
};

// Update donation kit
const updateDonationKit = async (req, res) => {
  try {
    const { title, price, img, description, included, highlight, displayOrder, isActive, slug } = req.body;

    const updatedKit = await DonationKit.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title }),
        ...(price !== undefined && { price }),
        ...(img && { img }),
        ...(description && { description }),
        ...(included !== undefined && { included }),
        ...(highlight && { highlight }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(isActive !== undefined && { isActive }),
        ...(slug && { slug })
      },
      { new: true, runValidators: true }
    );

    if (!updatedKit) {
      return res.status(404).json({
        success: false,
        message: 'Donation kit not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedKit,
      message: 'Donation kit updated successfully'
    });
  } catch (error) {
    console.error('Error updating donation kit:', error);
    res.status(400).json({
      success: false,
      message: 'Bad Request',
      error: error.message
    });
  }
};

// Delete donation kit
const deleteDonationKit = async (req, res) => {
  try {
    const deletedKit = await DonationKit.findByIdAndDelete(req.params.id);

    if (!deletedKit) {
      return res.status(404).json({
        success: false,
        message: 'Donation kit not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Donation kit deleted successfully',
      data: deletedKit
    });
  } catch (error) {
    console.error('Error deleting donation kit:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Bulk create donation kits
const bulkCreateDonationKits = async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Request body must be an array of donation kits'
      });
    }

    const kits = await DonationKit.insertMany(req.body, { ordered: false });

    res.status(201).json({
      success: true,
      data: kits,
      message: `${kits.length} donation kit(s) created successfully`,
      total: kits.length
    });
  } catch (error) {
    console.error('Error bulk creating donation kits:', error);
    res.status(400).json({
      success: false,
      message: 'Bad Request',
      error: error.message
    });
  }
};

module.exports = {
  getDonationKits,
  getDonationKitById,
  getDonationKitBySlug,
  createDonationKit,
  updateDonationKit,
  deleteDonationKit,
  bulkCreateDonationKits
};


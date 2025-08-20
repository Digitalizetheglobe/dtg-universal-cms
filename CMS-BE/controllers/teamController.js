const Team = require('../models/Team');
const fs = require('fs');
const path = require('path');

// Get all team members
exports.getAllTeamMembers = async (req, res) => {
  try {
    const teamMembers = await Team.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: teamMembers.length,
      data: teamMembers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get active team members only
exports.getActiveTeamMembers = async (req, res) => {
  try {
    const teamMembers = await Team.find({ isActive: true }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: teamMembers.length,
      data: teamMembers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get team member by ID
exports.getTeamMemberById = async (req, res) => {
  try {
    const teamMember = await Team.findById(req.params.id);
    
    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: teamMember
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new team member
exports.createTeamMember = async (req, res) => {
  try {
    const { fullName, designation, linkedinUrl, isActive } = req.body;
    
    // Handle file upload
    let photo = 'default-photo.jpg'; // Default photo for testing
    if (req.file) {
      photo = req.file.filename;
    }
    
    const newTeamMember = new Team({
      photo,
      fullName,
      designation,
      linkedinUrl,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user ? req.user._id : null
    });
    
    const savedTeamMember = await newTeamMember.save();
    
    res.status(201).json({
      success: true,
      data: savedTeamMember
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update team member
exports.updateTeamMember = async (req, res) => {
  try {
    const { fullName, designation, linkedinUrl, isActive } = req.body;
    
    // Find existing team member
    const existingMember = await Team.findById(req.params.id);
    if (!existingMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }
    
    // Handle file upload
    let photo = existingMember.photo;
    if (req.file) {
      // Delete old photo if exists
      if (existingMember.photo) {
        const oldPhotoPath = path.join(__dirname, '../uploads/team', existingMember.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      photo = req.file.filename;
    }
    
    const updatedTeamMember = await Team.findByIdAndUpdate(
      req.params.id,
      {
        photo,
        fullName,
        designation,
        linkedinUrl,
        isActive,
        updatedBy: req.user ? req.user._id : null
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedTeamMember
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete team member
exports.deleteTeamMember = async (req, res) => {
  try {
    const teamMember = await Team.findById(req.params.id);
    
    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }
    
    // Delete photo file
    if (teamMember.photo) {
      const photoPath = path.join(__dirname, '../uploads/team', teamMember.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }
    
    await Team.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Toggle active status
exports.toggleActiveStatus = async (req, res) => {
  try {
    const teamMember = await Team.findById(req.params.id);
    
    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }
    
    teamMember.isActive = !teamMember.isActive;
    teamMember.updatedBy = req.user ? req.user._id : null;
    
    const updatedTeamMember = await teamMember.save();
    
    res.status(200).json({
      success: true,
      data: updatedTeamMember
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

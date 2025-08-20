const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');

// Create a new announcement
router.post('/', createAnnouncement);

// Get all announcements
router.get('/', getAnnouncements);

// Get single announcement
router.get('/:id', getAnnouncementById);

// Update announcement
router.put('/:id', updateAnnouncement);

// Delete announcement
router.delete('/:id', deleteAnnouncement);

module.exports = router;

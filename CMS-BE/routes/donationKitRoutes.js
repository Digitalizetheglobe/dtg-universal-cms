const express = require('express');
const router = express.Router();
const {
  getDonationKits,
  getDonationKitById,
  getDonationKitBySlug,
  createDonationKit,
  updateDonationKit,
  deleteDonationKit,
  bulkCreateDonationKits
} = require('../controllers/donationKitController');

// Public routes (no authentication required)
// Get all donation kits
router.get('/', getDonationKits);

// Get donation kit by slug
router.get('/slug/:slug', getDonationKitBySlug);

// Get donation kit by ID
router.get('/:id', getDonationKitById);

// Admin routes (can add authentication middleware here if needed)
// Create new donation kit
router.post('/', createDonationKit);

// Bulk create donation kits
router.post('/bulk', bulkCreateDonationKits);

// Update donation kit
router.put('/:id', updateDonationKit);

// Delete donation kit
router.delete('/:id', deleteDonationKit);

module.exports = router;


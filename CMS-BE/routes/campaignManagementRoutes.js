const express = require('express');
const router = express.Router();
const {
    getCampaigns,
    getActiveCampaigns,
    getCampaignById,
    getCampaignBySlug,
    createCampaign,
    updateCampaign,
    toggleCampaignStatus,
    deleteCampaign,
    addDonor
} = require('../controllers/campaignManagementController');

// Get all campaigns (for CMS)
router.get('/', getCampaigns);

// Get active campaigns only (for frontend website)
router.get('/active', getActiveCampaigns);

// Get campaign by slug (for frontend website)
router.get('/slug/:slug', getCampaignBySlug);

// Get single campaign by ID
router.get('/:id', getCampaignById);

// Create new campaign
router.post('/', createCampaign);

// Update campaign
router.put('/:id', updateCampaign);

// Toggle campaign status (active/inactive)
router.patch('/:id/toggle-status', toggleCampaignStatus);

// Add donor to campaign
router.post('/:id/donor', addDonor);

// Delete campaign
router.delete('/:id', deleteCampaign);

module.exports = router;

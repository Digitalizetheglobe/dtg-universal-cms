const express = require('express');
const router = express.Router();
const {
    getCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    toggleFeatured
} = require('../controllers/campaignManagementController');

router.get('/', getCampaigns);
router.get('/:id', getCampaignById);
router.post('/', createCampaign);
router.put('/:id', updateCampaign);
router.delete('/:id', deleteCampaign);
router.patch('/:id/featured', toggleFeatured);

module.exports = router;


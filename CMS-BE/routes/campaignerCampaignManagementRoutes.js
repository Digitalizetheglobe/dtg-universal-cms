const express = require('express');
const router = express.Router();
const {
    getCampaignerCampaigns,
    getCampaignerCampaignById,
    createCampaignerCampaign,
    updateCampaignerCampaign,
    deleteCampaignerCampaign
} = require('../controllers/campaignerCampaignManagementController');

router.get('/', getCampaignerCampaigns);
router.get('/:id', getCampaignerCampaignById);
router.post('/', createCampaignerCampaign);
router.put('/:id', updateCampaignerCampaign);
router.delete('/:id', deleteCampaignerCampaign);

module.exports = router;


const express = require('express');
const router = express.Router();
const donorWallController = require('../controllers/donorWallController');

// Routes
router.post('/', donorWallController.createDonor);
router.get('/', donorWallController.getAllDonors);
router.get('/stats', donorWallController.getDonorStats);
router.get('/tier/:tier', donorWallController.getDonorsByTier);
router.get('/campaign/:campaign', donorWallController.getDonorsByCampaign);
router.get('/:id', donorWallController.getDonorById);
router.put('/:id', donorWallController.updateDonor);
router.put('/:id/toggle-visibility', donorWallController.toggleVisibility);
router.delete('/:id', donorWallController.deleteDonor);

module.exports = router;

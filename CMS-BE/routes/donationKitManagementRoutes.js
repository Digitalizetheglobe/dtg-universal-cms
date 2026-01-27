const express = require('express');
const router = express.Router();
const {
    getKits,
    getKitById,
    createKit,
    updateKit,
    deleteKit
} = require('../controllers/donationKitManagementController');

router.get('/', getKits);
router.get('/:id', getKitById);
router.post('/', createKit);
router.put('/:id', updateKit);
router.delete('/:id', deleteKit);

module.exports = router;

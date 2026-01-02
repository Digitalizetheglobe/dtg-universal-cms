const express = require('express');
const router = express.Router();
const { getGeneralSupport } = require('../controllers/generalSupportController');

// Public route (no authentication required)
// Get general support page data
router.get('/', getGeneralSupport);

module.exports = router;


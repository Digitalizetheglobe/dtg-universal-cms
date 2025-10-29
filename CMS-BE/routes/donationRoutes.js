const express = require('express');
const router = express.Router();
const {
  createDonationOrder,
  verifyDonationPayment,
  getAllDonations,
  getDonationById,
  getDonationStats,
  updateDonationNotes,
  syncDonationsFromRazorpay,
  forceSyncAllPayments,
  testRazorpayConnection,
  submitDonationForm,
  verifyPayment,
  getDonationByOrderId,
  getSevaStats,
  testEmailService,
  sendReceiptEmail,
  createPayUOrder,
  payuSuccess,
  payuFailure,
  verifyPayUPayment
} = require('../controllers/donationController');

// Public routes (for donation processing)
router.post('/create-order', createDonationOrder);
router.post('/verify-payment', verifyDonationPayment);

// New public routes for donation form
router.post('/submit-form', submitDonationForm);
router.post('/verify-payment-form', verifyPayment);
router.get('/order/:orderId', getDonationByOrderId);

// PayU payment routes - MUST be before catch-all routes
router.post('/create-payu-order', createPayUOrder);
router.post('/verify-payu-payment', verifyPayUPayment);

// PayU sends POST requests to success/failure URLs (form-encoded data)
// IMPORTANT: These routes must come BEFORE the catch-all /:id route
// Handle both POST (actual PayU callback) and GET (for testing)
router.post('/payu-success', payuSuccess);
router.get('/payu-success', payuSuccess);
router.post('/payu-failure', payuFailure);
router.get('/payu-failure', payuFailure);

// Admin routes (protected - you may want to add auth middleware)
router.get('/', getAllDonations);
router.get('/stats', getDonationStats);
router.get('/seva-stats', getSevaStats);
router.get('/test-connection', testRazorpayConnection);
router.get('/test-email', testEmailService);
router.get('/:id', getDonationById);
router.patch('/:id/notes', updateDonationNotes);
router.post('/sync-razorpay', syncDonationsFromRazorpay);
router.post('/force-sync-razorpay', forceSyncAllPayments);
router.post('/:id/send-receipt', sendReceiptEmail);

module.exports = router;

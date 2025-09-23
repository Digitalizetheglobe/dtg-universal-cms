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
  sendReceiptEmail
} = require('../controllers/donationController');

// Public routes (for donation processing)
router.post('/create-order', createDonationOrder);
router.post('/verify-payment', verifyDonationPayment);

// New public routes for donation form
router.post('/submit-form', submitDonationForm);
router.post('/verify-payment-form', verifyPayment);
router.get('/order/:orderId', getDonationByOrderId);

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

const express = require('express');
const router = express.Router();
const {
  createCard,
  getAllCards,
  getCardsByCategory,
  getCardById,
  updateCard,
  deleteCard,
  getCardsGroupedByCategory
} = require('../controllers/donationAmountController');
const { protect } = require('../middleware/authMiddleware');

// Get all cards grouped by category (for frontend display)
router.get('/grouped/by-category', getCardsGroupedByCategory);

// Get cards by category
router.get('/category/:category', getCardsByCategory);

// Get all cards (optional query: ?category=giftFuture)
router.get('/', getAllCards);

// Get single card by ID
router.get('/:id', getCardById);

// Create a new card (requires authentication)
router.post('/', protect, createCard);

// Update a card (requires authentication)
router.put('/:id', protect, updateCard);

// Delete a card (requires authentication)
router.delete('/:id', protect, deleteCard);

module.exports = router;

const DonationAmountCard = require('../models/DonationAmount');

// @desc    Create a new donation amount card
// @route   POST /api/donation-amounts
// @access  Private
exports.createCard = async (req, res) => {
  try {
    const { category, text, yearText, amount } = req.body;

    // Validate category
    if (!['giftFuture', 'giftLearning', 'food'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be giftFuture, giftLearning, or food'
      });
    }

    // Validate required fields
    if (!text || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Text and amount are required'
      });
    }

    // Validate yearText for gift categories
    if ((category === 'giftFuture' || category === 'giftLearning') && !yearText) {
      return res.status(400).json({
        success: false,
        message: 'Year text is required for gift categories'
      });
    }

    const cardData = {
      category,
      text,
      amount: parseFloat(amount)
    };

    // Add yearText only for gift categories
    if (category === 'giftFuture' || category === 'giftLearning') {
      cardData.yearText = yearText;
    }

    const newCard = new DonationAmountCard(cardData);
    await newCard.save();

    res.status(201).json({
      success: true,
      message: 'Donation card created successfully',
      data: newCard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all cards, optionally filtered by category
// @route   GET /api/donation-amounts?category=giftFuture
// @access  Public
exports.getAllCards = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};

    // Filter by category if provided
    if (category && ['giftFuture', 'giftLearning', 'food'].includes(category)) {
      query.category = category;
    }

    const cards = await DonationAmountCard.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: cards,
      count: cards.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get cards by category
// @route   GET /api/donation-amounts/category/:category
// @access  Public
exports.getCardsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!['giftFuture', 'giftLearning', 'food'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be giftFuture, giftLearning, or food'
      });
    }

    const cards = await DonationAmountCard.find({ category }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: cards,
      count: cards.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get a single card by ID
// @route   GET /api/donation-amounts/:id
// @access  Public
exports.getCardById = async (req, res) => {
  try {
    const card = await DonationAmountCard.findById(req.params.id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    res.status(200).json({
      success: true,
      data: card
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update a donation amount card
// @route   PUT /api/donation-amounts/:id
// @access  Private
exports.updateCard = async (req, res) => {
  try {
    const { text, yearText, amount } = req.body;
    const card = await DonationAmountCard.findById(req.params.id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Update fields if provided
    if (text !== undefined) card.text = text;
    if (amount !== undefined) card.amount = parseFloat(amount);

    // Update yearText only for gift categories
    if ((card.category === 'giftFuture' || card.category === 'giftLearning') && yearText !== undefined) {
      card.yearText = yearText;
    }

    await card.save();

    res.status(200).json({
      success: true,
      message: 'Card updated successfully',
      data: card
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete a donation amount card
// @route   DELETE /api/donation-amounts/:id
// @access  Private
exports.deleteCard = async (req, res) => {
  try {
    const card = await DonationAmountCard.findByIdAndDelete(req.params.id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Card deleted successfully',
      data: card
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all cards grouped by category
// @route   GET /api/donation-amounts/grouped/by-category
// @access  Public
// exports.getCardsGroupedByCategory = async (req, res) => {
//   try {
//     const allCards = await DonationAmountCard.find().sort({ createdAt: -1 });

//     const grouped = {
//       giftFuture: [],
//       giftLearning: [],
//       food: []
//     };

//     allCards.forEach(card => {
//       grouped[card.category].push(card);
//     });

//     res.status(200).json({
//       success: true,
//       data: grouped
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };
// @desc    Get all cards grouped by category
// @route   GET /api/donation-amounts/grouped/by-category
// @access  Public
exports.getCardsGroupedByCategory = async (req, res) => {
  try {
    const allCards = await DonationAmountCard.find().sort({ createdAt: -1 });

    const grouped = {
      giftFuture: [],
      giftLearning: [],
      food: []
    };

    allCards.forEach(card => {
      if (grouped[card.category]) {
        grouped[card.category].push(card);
      }
    });

    res.status(200).json({
      success: true,
      data: grouped
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

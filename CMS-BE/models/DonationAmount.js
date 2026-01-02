const mongoose = require('mongoose');

const donationAmountCardSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['giftFuture', 'giftLearning', 'food']
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  yearText: {
    type: String,
    default: '',
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Index for faster queries by category
donationAmountCardSchema.index({ category: 1 });

module.exports = mongoose.model('DonationAmountCard', donationAmountCardSchema);

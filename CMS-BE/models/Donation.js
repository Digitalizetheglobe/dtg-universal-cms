const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  // Seva Details
  sevaName: {
    type: String,
    required: true,
    trim: true
  },
  sevaType: {
    type: String,
    required: true,
    trim: true
  },
  sevaAmount: {
    type: Number,
    required: true,
    min: 1
  },

  // Donor Information
  donorName: {
    type: String,
    required: true,
    trim: true
  },
  donorEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  donorPhone: {
    type: String,
    required: true,
    trim: true
  },
  donorType: {
    type: String,
    enum: ['Indian Citizen', 'Foreign Citizen'],
    required: true
  },

  // Payment Details
  razorpayPaymentId: {
    type: String,
    sparse: true // This allows multiple null values
  },
  razorpayOrderId: {
    type: String,
    sparse: true // This allows multiple null values
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  currency: {
    type: String,
    default: 'INR'
  },

  // Additional Details
  description: {
    type: String,
    trim: true
  },
  receipt: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  campaign: {
    type: String,
    trim: true
  },

  // Metadata
  metadata: {
    paymentMethod: String,
    bank: String,
    cardId: String,
    wallet: String,
    vpa: String,
    email: String,
    contact: String,
    status: String
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
// Remove the unique constraint from razorpayPaymentId and razorpayOrderId
donationSchema.index({ razorpayPaymentId: 1 }, { sparse: true });
donationSchema.index({ razorpayOrderId: 1 }, { sparse: true });
donationSchema.index({ donorEmail: 1 });
donationSchema.index({ paymentStatus: 1 });
donationSchema.index({ createdAt: -1 });
donationSchema.index({ sevaType: 1 });
donationSchema.index({ donorType: 1 });

module.exports = mongoose.model('Donation', donationSchema);

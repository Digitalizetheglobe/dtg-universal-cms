const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  amount: { type: Number, required: true },
  monthly: { type: Boolean, default: false },
  donorName: { type: String },
  donorEmail: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);

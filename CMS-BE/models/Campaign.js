// const mongoose = require('mongoose');

// const campaignSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   category: { type: String },
//   image: { type: String },
//   goalAmount: { type: Number, required: true },
//   raisedAmount: { type: Number, default: 0 },
//   supporters: { type: Number, default: 0 },
//   deadline: { type: Date },
//   donationOptions: [
//     {
//       amount: Number,
//       description: String
//     }
//   ]
// }, { timestamps: true });

// module.exports = mongoose.model('Campaign', campaignSchema);
const mongoose = require("mongoose");

const donationOptionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  description: { type: String, default: "" }
}, { _id: false }); // _id: false so each option doesn’t get its own Mongo _id

const campaignSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  title: { type: String, required: true, trim: true },
  category: { type: String, default: "General" },
  image: { type: String, required: true },
  goalAmount: { type: Number, required: true },
  raisedAmount: { type: Number, default: 0 },
  supporters: { type: Number, default: 0 },
  deadline: { 
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: "Deadline must be a future date."
    }
  },
  donationOptions: {
    type: [donationOptionSchema],
    default: [
      { amount: 100, description: "Small contribution" },
      { amount: 500, description: "Medium contribution" },
      { amount: 1000, description: "Large contribution" }
    ]
  },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Campaign", campaignSchema);

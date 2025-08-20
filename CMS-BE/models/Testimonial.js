const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    rating: { type: Number, required: true },
    testimonialText: { type: String, required: true },
    date: { type: Date, default: Date.now },
    companyName: { type: String },
    otherFields: { type: Object }, // Flexible object for additional fields
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

module.exports = mongoose.model('Testimonial', TestimonialSchema);

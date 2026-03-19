const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    rating: { type: Number,  },
    testimonialText: { type: String, required: true },
    date: { type: Date, default: Date.now },
    location: { type: String, required: true },
    photo: { type: String },
    companyName: { type: String },
    otherFields: { type: Object, default: {} },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

module.exports = mongoose.model('Testimonial', TestimonialSchema);

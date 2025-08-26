const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    rating: { type: Number,  },
    testimonialText: { type: String, required: true },
    date: { type: Date, default: Date.now },
    location: { type: String, required: true },

     // Flexible object for additional fields
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

module.exports = mongoose.model('Testimonial', TestimonialSchema);

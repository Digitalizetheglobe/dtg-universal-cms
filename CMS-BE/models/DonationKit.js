const mongoose = require('mongoose');

const DonationKitSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true 
    },
    price: { 
      type: Number, 
      required: true,
      min: 0 
    },
    img: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    included: [{ 
      type: String 
    }],
    highlight: { 
      type: String, 
      required: true 
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  { timestamps: true }
);

// Generate slug from title before saving
DonationKitSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

module.exports = mongoose.model('DonationKit', DonationKitSchema);


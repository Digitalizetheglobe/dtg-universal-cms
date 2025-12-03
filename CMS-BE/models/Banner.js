const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    bannerImage: {
      type: String,
      required: true, // stores filename like "banner.jpg"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);

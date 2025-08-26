const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  description: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  uploadImage: { type: String, required: true },
  coverImage1: { type: String },
  coverImage2: { type: String },
  
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);

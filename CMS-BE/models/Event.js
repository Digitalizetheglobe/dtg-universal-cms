const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  month: { type: String, required: true },
  date: { type: String, required: true },
  country: { type: String, required: true },
  eventExpo: { type: String, required: true },
  venue: { type: String, required: true }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

module.exports = mongoose.model('Event', eventSchema);
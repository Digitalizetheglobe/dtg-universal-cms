const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  departments: [{
    type: String,
    required: true
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  showOnFrontend: {
    type: Boolean,
    default: true
  },
  announcementImage: {
    type: String,
    default: ''
  },
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

module.exports = mongoose.model('Announcement', announcementSchema);

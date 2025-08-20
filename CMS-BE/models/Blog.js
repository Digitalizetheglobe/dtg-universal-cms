const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  uploadImage: { type: String },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  coverImage: { type: String, required: false },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: false },
  tags: [String],
  categories: [String],
  publishedAt: { type: Date },
  isPublished: { type: Boolean, default: false },
  metaTitle: { type: String },
  metaDescription: { type: String },
  ogTitle: { type: String },
  ogDescription: { type: String },
  ogImage: { type: String },
  readTime: { type: Number },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
}, {
  timestamps: true // Adds createdAt and updatedAt
});

module.exports = mongoose.model('Blog', blogSchema);
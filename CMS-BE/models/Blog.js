const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    uploadImage: { type: String, required: true },
    coverImage1: { type: String }, // optional
    coverImage2: { type: String }, // optional
    author: { type: String }, // optional or required based on your app
    tags: { type: [String], default: [] },
    categories: { type: [String], default: [] },
    publishedAt: { type: Date },
    isPublished: { type: Boolean, default: false },
    metaTitle: { type: String },
    metaDescription: { type: String },
    ogTitle: { type: String },
    ogDescription: { type: String },
    ogImage: { type: String },
    readTime: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Blog', blogSchema);

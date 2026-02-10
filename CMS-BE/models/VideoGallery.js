const mongoose = require('mongoose');

const videoGallerySchema = new mongoose.Schema({
    videoTitle: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    category: {
        type: String,
        required: true,
        enum: ['Events', 'Campaigns', 'Festivals', 'Community Service', 'Temple Activities', 'Other']
    },
    videoUrl: {
        type: String,
        required: true,
        trim: true
    },
    thumbnailUrl: {
        type: String,
        trim: true,
        default: ''
    },
    duration: {
        type: String,
        trim: true,
        default: ''
    },
    publishDate: {
        type: Date,
        default: Date.now
    },
    featured: {
        type: Boolean,
        default: false
    },
    viewCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Index for faster queries
videoGallerySchema.index({ category: 1, publishDate: -1 });
videoGallerySchema.index({ featured: 1, publishDate: -1 });

module.exports = mongoose.model('VideoGallery', videoGallerySchema);

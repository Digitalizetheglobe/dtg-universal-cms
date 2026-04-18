const mongoose = require('mongoose');

const homeGallerySchema = new mongoose.Schema({
    imageTitle: {
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
        enum: ['Hero Banner', 'Featured Services', 'Client Testimonials', 'Events', 'Other']
    },
    imageUrl: {
        type: String,
        required: true
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

homeGallerySchema.index({ category: 1, publishDate: -1 });
homeGallerySchema.index({ featured: 1, publishDate: -1 });

module.exports = mongoose.model('HomeGallery', homeGallerySchema);

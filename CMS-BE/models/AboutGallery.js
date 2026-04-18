const mongoose = require('mongoose');

const aboutGallerySchema = new mongoose.Schema({
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
        enum: ['History', 'Our Team', 'Vision & Mission', 'Milestones', 'Other']
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

aboutGallerySchema.index({ category: 1, publishDate: -1 });
aboutGallerySchema.index({ featured: 1, publishDate: -1 });

module.exports = mongoose.model('AboutGallery', aboutGallerySchema);

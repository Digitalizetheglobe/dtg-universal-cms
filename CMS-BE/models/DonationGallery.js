const mongoose = require('mongoose');

const donationGallerySchema = new mongoose.Schema({
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
        enum: ['Food Donation', 'Education Support', 'Temple Services', 'Other']
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

donationGallerySchema.index({ category: 1, publishDate: -1 });
donationGallerySchema.index({ featured: 1, publishDate: -1 });

module.exports = mongoose.model('DonationGallery', donationGallerySchema);

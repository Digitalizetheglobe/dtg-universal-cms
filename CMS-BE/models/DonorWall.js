const mongoose = require('mongoose');

const donorWallSchema = new mongoose.Schema({
    // Donor Information
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },

    // Donation Details
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    donationDate: {
        type: Date,
        default: Date.now
    },
    campaign: {
        type: String,
        trim: true,
        default: 'General Donation'
    },

    // Tier/Category
    tier: {
        type: String,
        enum: ['Platinum', 'Gold', 'Silver', 'Bronze', 'Supporter'],
        default: 'Supporter'
    },

    // Visibility Settings
    isVisible: {
        type: Boolean,
        default: true
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    showAmount: {
        type: Boolean,
        default: true
    },

    // Donor Message
    message: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ''
    },

    // Avatar/Profile
    avatarColor: {
        type: String,
        default: '#FF6B6B'
    },
    avatarInitials: {
        type: String,
        trim: true
    },

    // Status
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'active'
    },

    // Additional Info
    address: {
        type: String,
        trim: true,
        default: ''
    },
    panNumber: {
        type: String,
        trim: true,
        default: ''
    },

    // Metadata
    notes: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

// Indexes for better query performance
donorWallSchema.index({ donationDate: -1 });
donorWallSchema.index({ tier: 1, amount: -1 });
donorWallSchema.index({ isVisible: 1, status: 1 });
donorWallSchema.index({ campaign: 1 });

// Virtual for display name
donorWallSchema.virtual('displayName').get(function () {
    return this.isAnonymous ? 'Anonymous Donor' : this.fullName;
});

// Pre-save hook to generate avatar initials
donorWallSchema.pre('save', function (next) {
    if (!this.avatarInitials && this.fullName) {
        const names = this.fullName.trim().split(' ');
        if (names.length >= 2) {
            this.avatarInitials = (names[0][0] + names[names.length - 1][0]).toUpperCase();
        } else {
            this.avatarInitials = names[0].substring(0, 2).toUpperCase();
        }
    }
    next();
});

// Method to auto-assign tier based on amount
donorWallSchema.methods.assignTier = function () {
    if (this.amount >= 100000) {
        this.tier = 'Platinum';
    } else if (this.amount >= 50000) {
        this.tier = 'Gold';
    } else if (this.amount >= 25000) {
        this.tier = 'Silver';
    } else if (this.amount >= 10000) {
        this.tier = 'Bronze';
    } else {
        this.tier = 'Supporter';
    }
};

module.exports = mongoose.model('DonorWall', donorWallSchema);

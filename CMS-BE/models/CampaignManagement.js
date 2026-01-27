const mongoose = require('mongoose');

const CampaignManagementSchema = new mongoose.Schema(
    {
        campaignTitle: {
            type: String,
            required: true,
            trim: true
        },
        subtitle: {
            type: String,
            default: '',
            trim: true
        },
        shortDescription: {
            type: String,
            default: '',
            trim: true
        },
        category: {
            type: String,
            required: true,
            trim: true
        },
        location: {
            type: String,
            default: '',
            trim: true
        },
        goalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        raisedAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        supporters: {
            type: Number,
            default: 0,
            min: 0
        },
        deadline: {
            type: Date,
            required: true
        },
        featured: {
            type: Boolean,
            default: false
        },
        heroImage: {
            type: String,
            default: ''
        },
        isActive: {
            type: Boolean,
            default: true
        },
        displayOrder: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('CampaignManagement', CampaignManagementSchema);


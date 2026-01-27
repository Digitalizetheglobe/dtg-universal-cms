const mongoose = require('mongoose');

const CampaignerCampaignManagementSchema = new mongoose.Schema(
    {
        fundraiserName: {
            type: String,
            required: true,
            trim: true
        },
        fundraiserPhoto: {
            type: String,
            default: ''
        },
        location: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            required: true,
            trim: true
        },
        campaignStory: {
            type: String,
            required: true,
            trim: true
        },
        campaignImage: {
            type: String,
            default: ''
        },
        targetAmount: {
            type: Number,
            required: true,
            min: 0
        },
        raisedAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        supportersCount: {
            type: Number,
            default: 0,
            min: 0
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

module.exports = mongoose.model('CampaignerCampaignManagement', CampaignerCampaignManagementSchema);


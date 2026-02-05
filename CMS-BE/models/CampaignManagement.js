const mongoose = require('mongoose');

// Sub-schemas for nested objects


const TestimonialSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    designation: { type: String, trim: true },
    quote: { type: String, trim: true },
    image: { type: String, default: '' }
}, { _id: false });

const GalleryItemSchema = new mongoose.Schema({
    url: { type: String, trim: true },
    caption: { type: String, trim: true },
    category: { type: String, default: 'General' }
}, { _id: false });

const VideoSchema = new mongoose.Schema({
    title: { type: String, trim: true },
    url: { type: String, trim: true },
    thumbnail: { type: String, default: '' }
}, { _id: false });

const DonorSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    amount: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    isAnonymous: { type: Boolean, default: false }
}, { _id: false });

const SocialLinksSchema = new mongoose.Schema({
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' }
}, { _id: false });

// Main Campaign Management Schema
const CampaignManagementSchema = new mongoose.Schema(
    {
        // Basic Info Tab
        basicInfo: {
            title: {
                type: String,
                required: true,
                trim: true
            },
            subtitle: {
                type: String,
                trim: true
            },
            slug: {
                type: String,
                trim: true,
                unique: true,
                sparse: true
            },
            category: {
                type: String,
                required: true,
                trim: true
            },
            location: {
                type: String,
                trim: true
            },
            shortDescription: {
                type: String,
                trim: true
            },
            coverImage: {
                type: String,
                default: ''
            },
            bannerImage: {
                type: String,
                default: ''
            },
            deadline: {
                type: Date
            },
            isFeatured: {
                type: Boolean,
                default: false
            },
            isActive: {
                type: Boolean,
                default: true
            }
        },

        // Story Tab
        story: {
            fullStory: {
                type: String,
                trim: true
            },
            mission: {
                type: String,
                trim: true
            },
            vision: {
                type: String,
                trim: true
            }
        },

        // Impact Tab
        impact: {
            impactStatistics: [
                {
                    value: { type: String, trim: true },
                    label: { type: String, trim: true },
                    description: { type: String, trim: true }
                }
            ],
            donationImpacts: [
                {
                    amount: { type: String, trim: true },
                    description: { type: String, trim: true }
                }
            ]
        },

        // Funds Tab
        funds: {
            targetAmount: {
                type: Number,
                default: 0,
                min: 0
            },
            raisedAmount: {
                type: Number,
                default: 0,
                min: 0
            },
            minimumDonation: {
                type: Number,
                default: 100,
                min: 0
            },
            suggestedAmounts: {
                type: [Number],
                default: [500, 1000, 2500, 5000]
            },
            fundUtilization: [
                {
                    label: { type: String, trim: true },
                    percentage: { type: String, trim: true },
                    amount: { type: String, trim: true },
                    description: { type: String, trim: true }
                }
            ],
            currency: {
                type: String,
                default: 'INR'
            },
            totalDonors: {
                type: Number,
                default: 0,
                min: 0
            }
        },

        // Testimonials Tab
        testimonials: [TestimonialSchema],

        // Gallery Tab
        gallery: [GalleryItemSchema],
        albums: {
            type: [String],
            default: ['General']
        },

        // Videos Tab
        videos: [VideoSchema],

        // Donor Wall Tab
        donorWall: {
            showDonorWall: {
                type: Boolean,
                default: true
            },
            showDonorNames: {
                type: Boolean,
                default: true
            },
            showDonationAmounts: {
                type: Boolean,
                default: true
            },
            minAmountToDisplay: {
                type: Number,
                default: 0
            },
            recentDonors: [DonorSchema]
        },

        // Contact Tab
        contact: {
            email: {
                type: String,
                trim: true
            },
            phone: {
                type: String,
                trim: true
            },
            address: {
                type: String,
                trim: true
            },
            socialLinks: SocialLinksSchema
        },

        // Meta fields
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

// Generate slug from title before saving
CampaignManagementSchema.pre('save', function (next) {
    if (this.basicInfo && this.basicInfo.title && !this.basicInfo.slug) {
        this.basicInfo.slug = this.basicInfo.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

module.exports = mongoose.model('CampaignManagement', CampaignManagementSchema);

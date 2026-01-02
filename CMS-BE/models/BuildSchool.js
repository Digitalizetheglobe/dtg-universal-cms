const mongoose = require("mongoose");

const CampaignSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true, // build-school
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    goalAmount: {
      type: Number,
      required: true,
    },

    raisedAmount: {
      type: Number,
      default: 0,
    },

    supporters: {
      type: Number,
      default: 0,
    },

    category: {
      type: String,
      default: "General",
    },

    deadline: {
      type: Date,
      required: true,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    // Campaign Impact
    campaignImpact: {
      classrooms: { type: Number, default: 6 },
      students: { type: String, default: "200+" },
      teachers: { type: Number, default: 8 },
      duration: { type: String, default: "25+ years" },
    },

    // Fund Utilization Breakdown
    fundUtilization: [
      {
        name: { type: String, required: true },
        percentage: { type: Number, required: true },
        amount: { type: Number, required: true },
        description: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

// Use a unique model name to avoid conflict with Campaign.js
module.exports = mongoose.models.BuildSchoolCampaign || mongoose.model("BuildSchoolCampaign", CampaignSchema);

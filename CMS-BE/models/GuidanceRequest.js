const mongoose = require("mongoose");

const guidanceRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 320,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    question: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      default: "new",
      trim: true,
      maxlength: 50,
    },
    adminNotes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },
  },
  { timestamps: true }
);

guidanceRequestSchema.index({ createdAt: -1 });
guidanceRequestSchema.index({ email: 1 });
guidanceRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("GuidanceRequest", guidanceRequestSchema);


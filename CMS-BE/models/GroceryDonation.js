const mongoose = require("mongoose");

const groceryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: String, required: true },
  price: { type: Number, required: true },
  icon: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const groceryDonationSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    items: {
      type: [groceryItemSchema],
      required: true,
      validate: {
        validator: function(items) {
          return items && items.length > 0;
        },
        message: "At least one item must be selected",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    processingFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    paymentId: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ["online", "offline", "other"],
      default: "online",
    },
  },
  { timestamps: true }
);

// Index for faster queries
groceryDonationSchema.index({ email: 1, createdAt: -1 });
groceryDonationSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model("GroceryDonation", groceryDonationSchema);


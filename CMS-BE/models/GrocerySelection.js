const mongoose = require("mongoose");

const grocerySelectionItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    icon: {
      type: String,
      required: true,
      default: "🛒",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const grocerySelectionSchema = new mongoose.Schema(
  {
    items: {
      type: [grocerySelectionItemSchema],
      required: true,
      validate: {
        validator: function (items) {
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
    // Optional simple expiry to avoid storing old untouched selections forever
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 1000 * 60 * 60), // 1 hour
      index: { expires: "2h" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GrocerySelection", grocerySelectionSchema);



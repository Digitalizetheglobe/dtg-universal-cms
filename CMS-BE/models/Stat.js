const mongoose = require("mongoose");

const statSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: [true, "Please add a number value"],
    },
    label: {
      type: String,
      required: [true, "Please add a label"],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Stat", statSchema);

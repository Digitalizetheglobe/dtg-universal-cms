const express = require("express");
const router = express.Router();

const {
  getGroceryItems,
  getGroceryItemById,
  createGroceryItem,
  updateGroceryItem,
  deleteGroceryItem,
  submitGroceryDonation,
  getGroceryDonations,
  getGroceryDonationById,
  updateDonationStatus,
  createGrocerySelection,
  getGrocerySelectionById,
} = require("../controllers/groceryController");

// Public routes - Grocery Items
router.get("/items", getGroceryItems);
router.get("/items/:id", getGroceryItemById);

// Public routes - Grocery Selections
router.post("/selections", createGrocerySelection);
router.get("/selections/:id", getGrocerySelectionById);

// Public route - Submit donation
router.post("/donate", submitGroceryDonation);

// Admin routes - Grocery Items Management
router.post("/items", createGroceryItem);
router.put("/items/:id", updateGroceryItem);
router.delete("/items/:id", deleteGroceryItem);

// Admin routes - Donations Management
router.get("/donations", getGroceryDonations);
router.get("/donations/:id", getGroceryDonationById);
router.put("/donations/:id/status", updateDonationStatus);

module.exports = router;


const GroceryItem = require("../models/GroceryItemManagement");
const GroceryDonation = require("../models/GroceryDonation");
const GrocerySelection = require("../models/GrocerySelection");

// Disable cache to prevent 304 issues
const disableCache = (res) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });
};

// --------------------
// GET all grocery items
// GET /api/grocery/items
// --------------------
exports.getGroceryItems = async (req, res) => {
  try {
    disableCache(res);

    const items = await GroceryItem.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// --------------------
// GET single grocery item by ID
// GET /api/grocery/items/:id
// --------------------
exports.getGroceryItemById = async (req, res) => {
  try {
    disableCache(res);

    const { id } = req.params;
    const item = await GroceryItem.findById(id).lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Grocery item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// --------------------
// POST create grocery item (Admin)
// POST /api/grocery/items
// --------------------
exports.createGroceryItem = async (req, res) => {
  try {
    disableCache(res);

    const { name, amount, price, icon, description, isActive, order } = req.body;

    const item = new GroceryItem({
      name,
      amount,
      price,
      icon: icon || "🛒",
      description,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    });

    await item.save();

    res.status(201).json({
      success: true,
      message: "Grocery item created successfully",
      data: item,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// --------------------
// PUT update grocery item (Admin)
// PUT /api/grocery/items/:id
// --------------------
exports.updateGroceryItem = async (req, res) => {
  try {
    disableCache(res);

    const { id } = req.params;
    const updateData = { ...req.body };

    const item = await GroceryItem.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Grocery item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Grocery item updated successfully",
      data: item,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// --------------------
// DELETE grocery item (Admin)
// DELETE /api/grocery/items/:id
// --------------------
exports.deleteGroceryItem = async (req, res) => {
  try {
    disableCache(res);

    const { id } = req.params;
    const item = await GroceryItem.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Grocery item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Grocery item deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// --------------------
// POST submit grocery donation
// POST /api/grocery/donate
// --------------------
exports.submitGroceryDonation = async (req, res) => {
  try {
    disableCache(res);

    const {
      firstName,
      lastName,
      email,
      phone,
      message,
      items,
      subtotal,
      processingFee,
      totalAmount,
      paymentStatus,
      paymentId,
      paymentMethod,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (firstName, lastName, email, phone)",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one item to donate",
      });
    }

    // Calculate amounts if not provided
    let calculatedSubtotal = subtotal;
    let calculatedProcessingFee = processingFee;
    let calculatedTotal = totalAmount;

    if (!calculatedSubtotal) {
      calculatedSubtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    }

    if (calculatedProcessingFee === undefined) {
      calculatedProcessingFee = Math.round(calculatedSubtotal * 0.02);
    }

    if (!calculatedTotal) {
      calculatedTotal = calculatedSubtotal + calculatedProcessingFee;
    }

    // Create donation record
    const donation = new GroceryDonation({
      firstName,
      lastName,
      email,
      phone,
      message: message || "",
      items,
      subtotal: calculatedSubtotal,
      processingFee: calculatedProcessingFee,
      totalAmount: calculatedTotal,
      paymentStatus: paymentStatus || "pending",
      paymentId: paymentId || "",
      paymentMethod: paymentMethod || "online",
    });

    await donation.save();

    res.status(201).json({
      success: true,
      message: "Grocery donation submitted successfully",
      data: donation,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// --------------------
// POST create grocery selection (temporary)
// POST /api/grocery/selections
// --------------------
exports.createGrocerySelection = async (req, res) => {
  try {
    disableCache(res);

    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one item to donate",
      });
    }

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const processingFee = Math.round(subtotal * 0.02);
    const totalAmount = subtotal + processingFee;

    const selection = new GrocerySelection({
      items,
      subtotal,
      processingFee,
      totalAmount,
    });

    await selection.save();

    res.status(201).json({
      success: true,
      message: "Grocery selection created successfully",
      data: {
        id: selection._id,
        items: selection.items,
        subtotal: selection.subtotal,
        processingFee: selection.processingFee,
        totalAmount: selection.totalAmount,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// --------------------
// GET grocery selection by ID
// GET /api/grocery/selections/:id
// --------------------
exports.getGrocerySelectionById = async (req, res) => {
  try {
    disableCache(res);

    const { id } = req.params;
    const selection = await GrocerySelection.findById(id).lean();

    if (!selection) {
      return res.status(404).json({
        success: false,
        message: "Grocery selection not found or expired",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: selection._id,
        items: selection.items,
        subtotal: selection.subtotal,
        processingFee: selection.processingFee,
        totalAmount: selection.totalAmount,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// --------------------
// GET all grocery donations (Admin)
// GET /api/grocery/donations
// --------------------
exports.getGroceryDonations = async (req, res) => {
  try {
    disableCache(res);

    const { page = 1, limit = 10, paymentStatus } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const donations = await GroceryDonation.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await GroceryDonation.countDocuments(query);

    res.status(200).json({
      success: true,
      data: donations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// --------------------
// GET single grocery donation by ID (Admin)
// GET /api/grocery/donations/:id
// --------------------
exports.getGroceryDonationById = async (req, res) => {
  try {
    disableCache(res);

    const { id } = req.params;
    const donation = await GroceryDonation.findById(id).lean();

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Grocery donation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: donation,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// --------------------
// PUT update donation payment status (Admin)
// PUT /api/grocery/donations/:id/status
// --------------------
exports.updateDonationStatus = async (req, res) => {
  try {
    disableCache(res);

    const { id } = req.params;
    const { paymentStatus, paymentId } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: "Payment status is required",
      });
    }

    const updateData = { paymentStatus };
    if (paymentId) {
      updateData.paymentId = paymentId;
    }

    const donation = await GroceryDonation.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Grocery donation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Donation status updated successfully",
      data: donation,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


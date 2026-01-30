const GuidanceRequest = require("../models/GuidanceRequest");

// @desc    Create a guidance request (Get Guidance form)
// @route   POST /api/guidance
// @access  Public
exports.submitGuidanceRequest = async (req, res) => {
  try {
    const { name, email, phone, city, question } = req.body || {};

    const cleaned = {
      name: typeof name === "string" ? name.trim() : "",
      email: typeof email === "string" ? email.trim().toLowerCase() : "",
      phone: typeof phone === "string" ? phone.trim() : "",
      city: typeof city === "string" ? city.trim() : "",
      question: typeof question === "string" ? question.trim() : "",
    };

    if (!cleaned.name || !cleaned.email || !cleaned.phone || !cleaned.city) {
      return res.status(400).json({
        success: false,
        error: "Please fill all required fields.",
      });
    }

    // Basic validation (mirrors the donation-kit page)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleaned.email)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid email address.",
      });
    }

    // 10 digits, starts 6–9
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(cleaned.phone)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid phone number.",
      });
    }

    const created = await GuidanceRequest.create(cleaned);

    return res.status(201).json({
      success: true,
      message: "Thank you! Our team will contact you within 24 hours.",
      data: {
        _id: created._id,
        createdAt: created.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Something went wrong. Please try again.",
      details: error.message,
    });
  }
};

// @desc    List guidance requests (admin)
// @route   GET /api/guidance
// @access  Private/Admin
exports.listGuidanceRequests = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const searchRaw = (req.query.search || "").toString().trim();
    const statusRaw = (req.query.status || "").toString().trim();

    const filter = {};
    if (statusRaw) filter.status = statusRaw;

    if (searchRaw) {
      const search = new RegExp(searchRaw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { name: search },
        { email: search },
        { phone: search },
        { city: search },
        { question: search },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      GuidanceRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      GuidanceRequest.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        items,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch guidance requests.",
      details: error.message,
    });
  }
};

// @desc    Get a single guidance request (admin)
// @route   GET /api/guidance/:id
// @access  Private/Admin
exports.getGuidanceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await GuidanceRequest.findById(id).lean();
    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Guidance request not found.",
      });
    }
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch guidance request.",
      details: error.message,
    });
  }
};

// @desc    Update guidance request status / notes (admin)
// @route   PATCH /api/guidance/:id
// @access  Private/Admin
exports.updateGuidanceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body || {};

    const update = {};
    if (typeof status === "string" && status.trim()) update.status = status.trim();
    if (typeof adminNotes === "string") update.adminNotes = adminNotes.trim();

    if (!Object.keys(update).length) {
      return res.status(400).json({
        success: false,
        error: "Nothing to update.",
      });
    }

    const updated = await GuidanceRequest.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "Guidance request not found.",
      });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to update guidance request.",
      details: error.message,
    });
  }
};


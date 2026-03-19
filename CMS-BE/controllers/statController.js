const Stat = require("../models/Stat");

// @desc    Get all stats
// @route   GET /api/stats
// @access  Public
exports.getStats = async (req, res) => {
  try {
    const stats = await Stat.find().sort("order");
    res.status(200).json({
      success: true,
      count: stats.length,
      data: stats,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Create a new stat
// @route   POST /api/stats
// @access  Private
exports.createStat = async (req, res) => {
  try {
    const stat = await Stat.create(req.body);
    res.status(201).json({
      success: true,
      data: stat,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc    Update a stat
// @route   PUT /api/stats/:id
// @access  Private
exports.updateStat = async (req, res) => {
  try {
    let stat = await Stat.findById(req.params.id);

    if (!stat) {
      return res.status(404).json({
        success: false,
        error: "Stat not found",
      });
    }

    stat = await Stat.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: stat,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc    Delete a stat
// @route   DELETE /api/stats/:id
// @access  Private
exports.deleteStat = async (req, res) => {
  try {
    const stat = await Stat.findById(req.params.id);

    if (!stat) {
      return res.status(404).json({
        success: false,
        error: "Stat not found",
      });
    }

    await stat.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

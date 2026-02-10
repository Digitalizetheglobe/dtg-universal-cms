const DonorWall = require('../models/DonorWall');

// Create new donor entry
exports.createDonor = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            amount,
            donationDate,
            campaign,
            tier,
            isVisible,
            isAnonymous,
            showAmount,
            message,
            avatarColor,
            address,
            panNumber,
            notes
        } = req.body;

        // Validate required fields
        if (!fullName || !email || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Full name, email, and amount are required'
            });
        }

        // Create new donor entry
        const donor = new DonorWall({
            fullName,
            email,
            phone,
            amount,
            donationDate: donationDate || Date.now(),
            campaign,
            tier,
            isVisible: isVisible !== undefined ? isVisible : true,
            isAnonymous: isAnonymous || false,
            showAmount: showAmount !== undefined ? showAmount : true,
            message,
            avatarColor: avatarColor || getRandomColor(),
            address,
            panNumber,
            notes
        });

        // Auto-assign tier if not provided
        if (!tier) {
            donor.assignTier();
        }

        await donor.save();

        res.status(201).json({
            success: true,
            message: 'Donor added successfully',
            data: donor
        });
    } catch (error) {
        console.error('Error creating donor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add donor',
            error: error.message
        });
    }
};

// Get all donors with filtering and pagination
exports.getAllDonors = async (req, res) => {
    try {
        const {
            tier,
            campaign,
            isVisible,
            status,
            search,
            page = 1,
            limit = 20,
            sortBy = 'donationDate',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};
        if (tier) filter.tier = tier;
        if (campaign) filter.campaign = campaign;
        if (isVisible !== undefined) filter.isVisible = isVisible === 'true';
        if (status) filter.status = status;

        // Search by name or email
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Get donors with pagination
        const donors = await DonorWall.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await DonorWall.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: donors,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching donors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch donors',
            error: error.message
        });
    }
};

// Get single donor by ID
exports.getDonorById = async (req, res) => {
    try {
        const donor = await DonorWall.findById(req.params.id);

        if (!donor) {
            return res.status(404).json({
                success: false,
                message: 'Donor not found'
            });
        }

        res.status(200).json({
            success: true,
            data: donor
        });
    } catch (error) {
        console.error('Error fetching donor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch donor',
            error: error.message
        });
    }
};

// Update donor
exports.updateDonor = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            amount,
            donationDate,
            campaign,
            tier,
            isVisible,
            isAnonymous,
            showAmount,
            message,
            avatarColor,
            address,
            panNumber,
            notes,
            status
        } = req.body;

        const donor = await DonorWall.findById(req.params.id);

        if (!donor) {
            return res.status(404).json({
                success: false,
                message: 'Donor not found'
            });
        }

        // Update fields
        if (fullName) donor.fullName = fullName;
        if (email) donor.email = email;
        if (phone !== undefined) donor.phone = phone;
        if (amount) {
            donor.amount = amount;
            // Re-assign tier if amount changed
            donor.assignTier();
        }
        if (donationDate) donor.donationDate = donationDate;
        if (campaign !== undefined) donor.campaign = campaign;
        if (tier) donor.tier = tier;
        if (isVisible !== undefined) donor.isVisible = isVisible;
        if (isAnonymous !== undefined) donor.isAnonymous = isAnonymous;
        if (showAmount !== undefined) donor.showAmount = showAmount;
        if (message !== undefined) donor.message = message;
        if (avatarColor) donor.avatarColor = avatarColor;
        if (address !== undefined) donor.address = address;
        if (panNumber !== undefined) donor.panNumber = panNumber;
        if (notes !== undefined) donor.notes = notes;
        if (status) donor.status = status;

        await donor.save();

        res.status(200).json({
            success: true,
            message: 'Donor updated successfully',
            data: donor
        });
    } catch (error) {
        console.error('Error updating donor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update donor',
            error: error.message
        });
    }
};

// Delete donor
exports.deleteDonor = async (req, res) => {
    try {
        const donor = await DonorWall.findById(req.params.id);

        if (!donor) {
            return res.status(404).json({
                success: false,
                message: 'Donor not found'
            });
        }

        await DonorWall.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Donor deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting donor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete donor',
            error: error.message
        });
    }
};

// Get donor statistics
exports.getDonorStats = async (req, res) => {
    try {
        const totalDonors = await DonorWall.countDocuments({ status: 'active' });
        const visibleDonors = await DonorWall.countDocuments({ isVisible: true, status: 'active' });
        const hiddenDonors = await DonorWall.countDocuments({ isVisible: false, status: 'active' });

        const totalRaised = await DonorWall.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const tierCounts = await DonorWall.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$tier', count: { $sum: 1 } } }
        ]);

        const campaigns = await DonorWall.distinct('campaign', { status: 'active' });

        res.status(200).json({
            success: true,
            data: {
                totalDonors,
                visibleDonors,
                hiddenDonors,
                totalRaised: totalRaised.length > 0 ? totalRaised[0].total : 0,
                tierCounts: tierCounts.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                totalCampaigns: campaigns.length
            }
        });
    } catch (error) {
        console.error('Error fetching donor stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch donor statistics',
            error: error.message
        });
    }
};

// Get donors by tier
exports.getDonorsByTier = async (req, res) => {
    try {
        const { tier } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const donors = await DonorWall.find({ tier, status: 'active', isVisible: true })
            .sort({ amount: -1, donationDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await DonorWall.countDocuments({ tier, status: 'active', isVisible: true });

        res.status(200).json({
            success: true,
            data: donors,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching donors by tier:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch donors',
            error: error.message
        });
    }
};

// Get donors by campaign
exports.getDonorsByCampaign = async (req, res) => {
    try {
        const { campaign } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const donors = await DonorWall.find({ campaign, status: 'active', isVisible: true })
            .sort({ donationDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await DonorWall.countDocuments({ campaign, status: 'active', isVisible: true });

        res.status(200).json({
            success: true,
            data: donors,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching donors by campaign:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch donors',
            error: error.message
        });
    }
};

// Toggle donor visibility
exports.toggleVisibility = async (req, res) => {
    try {
        const donor = await DonorWall.findById(req.params.id);

        if (!donor) {
            return res.status(404).json({
                success: false,
                message: 'Donor not found'
            });
        }

        donor.isVisible = !donor.isVisible;
        await donor.save();

        res.status(200).json({
            success: true,
            message: `Donor ${donor.isVisible ? 'shown' : 'hidden'} successfully`,
            data: donor
        });
    } catch (error) {
        console.error('Error toggling visibility:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle visibility',
            error: error.message
        });
    }
};

// Helper function to generate random avatar color
function getRandomColor() {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
        '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

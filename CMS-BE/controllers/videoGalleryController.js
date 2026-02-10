const VideoGallery = require('../models/VideoGallery');

// Create new video
exports.createVideo = async (req, res) => {
    try {
        const { videoTitle, description, category, videoUrl, thumbnailUrl, duration, publishDate, featured } = req.body;

        // Validate required fields
        if (!videoTitle || !category || !videoUrl) {
            return res.status(400).json({
                success: false,
                message: 'Video title, category, and video URL are required'
            });
        }

        // Create new video entry
        const video = new VideoGallery({
            videoTitle,
            description,
            category,
            videoUrl,
            thumbnailUrl,
            duration,
            publishDate: publishDate || Date.now(),
            featured: featured === 'true' || featured === true
        });

        await video.save();

        res.status(201).json({
            success: true,
            message: 'Video added successfully',
            data: video
        });
    } catch (error) {
        console.error('Error creating video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add video',
            error: error.message
        });
    }
};

// Get all videos with filtering and pagination
exports.getAllVideos = async (req, res) => {
    try {
        const { category, featured, status, page = 1, limit = 12 } = req.query;

        // Build filter object
        const filter = {};
        if (category) filter.category = category;
        if (featured !== undefined) filter.featured = featured === 'true';
        if (status) filter.status = status;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get videos with pagination
        const videos = await VideoGallery.find(filter)
            .sort({ featured: -1, publishDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await VideoGallery.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: videos,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch videos',
            error: error.message
        });
    }
};

// Get single video by ID
exports.getVideoById = async (req, res) => {
    try {
        const video = await VideoGallery.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Increment view count
        video.viewCount += 1;
        await video.save();

        res.status(200).json({
            success: true,
            data: video
        });
    } catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch video',
            error: error.message
        });
    }
};

// Update video
exports.updateVideo = async (req, res) => {
    try {
        const { videoTitle, description, category, videoUrl, thumbnailUrl, duration, publishDate, featured, status } = req.body;

        const video = await VideoGallery.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Update fields
        if (videoTitle) video.videoTitle = videoTitle;
        if (description !== undefined) video.description = description;
        if (category) video.category = category;
        if (videoUrl) video.videoUrl = videoUrl;
        if (thumbnailUrl !== undefined) video.thumbnailUrl = thumbnailUrl;
        if (duration !== undefined) video.duration = duration;
        if (publishDate) video.publishDate = publishDate;
        if (featured !== undefined) video.featured = featured === 'true' || featured === true;
        if (status) video.status = status;

        await video.save();

        res.status(200).json({
            success: true,
            message: 'Video updated successfully',
            data: video
        });
    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update video',
            error: error.message
        });
    }
};

// Delete video
exports.deleteVideo = async (req, res) => {
    try {
        const video = await VideoGallery.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        await VideoGallery.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Video deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete video',
            error: error.message
        });
    }
};

// Get featured videos
exports.getFeaturedVideos = async (req, res) => {
    try {
        const videos = await VideoGallery.find({ featured: true, status: 'active' })
            .sort({ publishDate: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: videos
        });
    } catch (error) {
        console.error('Error fetching featured videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured videos',
            error: error.message
        });
    }
};

// Get videos by category
exports.getVideosByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 12 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const videos = await VideoGallery.find({ category, status: 'active' })
            .sort({ publishDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await VideoGallery.countDocuments({ category, status: 'active' });

        res.status(200).json({
            success: true,
            data: videos,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching videos by category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch videos',
            error: error.message
        });
    }
};

// Get video statistics
exports.getVideoStats = async (req, res) => {
    try {
        const totalVideos = await VideoGallery.countDocuments({ status: 'active' });
        const featuredVideos = await VideoGallery.countDocuments({ featured: true, status: 'active' });
        const totalViews = await VideoGallery.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: null, total: { $sum: '$viewCount' } } }
        ]);
        const categories = await VideoGallery.distinct('category', { status: 'active' });

        res.status(200).json({
            success: true,
            data: {
                totalVideos,
                featuredVideos,
                totalViews: totalViews.length > 0 ? totalViews[0].total : 0,
                totalCategories: categories.length
            }
        });
    } catch (error) {
        console.error('Error fetching video stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch video statistics',
            error: error.message
        });
    }
};

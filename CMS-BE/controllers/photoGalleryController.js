const PhotoGallery = require('../models/PhotoGallery');
const path = require('path');
const fs = require('fs').promises;

// Create new photo
exports.createPhoto = async (req, res) => {
    try {
        const { imageTitle, description, category, publishDate, featured } = req.body;

        // Validate required fields
        if (!imageTitle || !category) {
            return res.status(400).json({
                success: false,
                message: 'Image title and category are required'
            });
        }

        // Check if image file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Image file is required'
            });
        }

        // Create image URL
        const imageUrl = `/uploads/photos/${req.file.filename}`;

        // Create new photo entry
        const photo = new PhotoGallery({
            imageTitle,
            description,
            category,
            imageUrl,
            publishDate: publishDate || Date.now(),
            featured: featured === 'true' || featured === true
        });

        await photo.save();

        res.status(201).json({
            success: true,
            message: 'Photo uploaded successfully',
            data: photo
        });
    } catch (error) {
        console.error('Error creating photo:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload photo',
            error: error.message
        });
    }
};

// Get all photos with filtering and pagination
exports.getAllPhotos = async (req, res) => {
    try {
        const { category, featured, status, page = 1, limit = 12 } = req.query;

        // Build filter object
        const filter = {};
        if (category) filter.category = category;
        if (featured !== undefined) filter.featured = featured === 'true';
        if (status) filter.status = status;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get photos with pagination
        const photos = await PhotoGallery.find(filter)
            .sort({ featured: -1, publishDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await PhotoGallery.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: photos,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch photos',
            error: error.message
        });
    }
};

// Get single photo by ID
exports.getPhotoById = async (req, res) => {
    try {
        const photo = await PhotoGallery.findById(req.params.id);

        if (!photo) {
            return res.status(404).json({
                success: false,
                message: 'Photo not found'
            });
        }

        // Increment view count
        photo.viewCount += 1;
        await photo.save();

        res.status(200).json({
            success: true,
            data: photo
        });
    } catch (error) {
        console.error('Error fetching photo:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch photo',
            error: error.message
        });
    }
};

// Update photo
exports.updatePhoto = async (req, res) => {
    try {
        const { imageTitle, description, category, publishDate, featured, status } = req.body;

        const photo = await PhotoGallery.findById(req.params.id);

        if (!photo) {
            return res.status(404).json({
                success: false,
                message: 'Photo not found'
            });
        }

        // Update fields
        if (imageTitle) photo.imageTitle = imageTitle;
        if (description !== undefined) photo.description = description;
        if (category) photo.category = category;
        if (publishDate) photo.publishDate = publishDate;
        if (featured !== undefined) photo.featured = featured === 'true' || featured === true;
        if (status) photo.status = status;

        // Update image if new file uploaded
        if (req.file) {
            // Delete old image file
            const oldImagePath = path.join(__dirname, '..', 'public', photo.imageUrl);
            try {
                await fs.unlink(oldImagePath);
            } catch (err) {
                console.error('Error deleting old image:', err);
            }

            photo.imageUrl = `/uploads/photos/${req.file.filename}`;
        }

        await photo.save();

        res.status(200).json({
            success: true,
            message: 'Photo updated successfully',
            data: photo
        });
    } catch (error) {
        console.error('Error updating photo:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update photo',
            error: error.message
        });
    }
};

// Delete photo
exports.deletePhoto = async (req, res) => {
    try {
        const photo = await PhotoGallery.findById(req.params.id);

        if (!photo) {
            return res.status(404).json({
                success: false,
                message: 'Photo not found'
            });
        }

        // Delete image file
        const imagePath = path.join(__dirname, '..', 'public', photo.imageUrl);
        try {
            await fs.unlink(imagePath);
        } catch (err) {
            console.error('Error deleting image file:', err);
        }

        await PhotoGallery.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Photo deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting photo:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete photo',
            error: error.message
        });
    }
};

// Get featured photos
exports.getFeaturedPhotos = async (req, res) => {
    try {
        const photos = await PhotoGallery.find({ featured: true, status: 'active' })
            .sort({ publishDate: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: photos
        });
    } catch (error) {
        console.error('Error fetching featured photos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured photos',
            error: error.message
        });
    }
};

// Get photos by category
exports.getPhotosByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 12 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const photos = await PhotoGallery.find({ category, status: 'active' })
            .sort({ publishDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await PhotoGallery.countDocuments({ category, status: 'active' });

        res.status(200).json({
            success: true,
            data: photos,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching photos by category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch photos',
            error: error.message
        });
    }
};

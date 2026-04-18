const DonationGallery = require('../models/DonationGallery');
const path = require('path');
const fs = require('fs').promises;
const { getBaseUrl } = require('../utils/urlHelper');

// Ensure imageUrl is always a full http/https URL
function toFullImageUrl(url, req) {
    if (!url || (typeof url === 'string' && /^https?:\/\//i.test(url))) return url;
    const base = process.env.BASE_URL || getBaseUrl(req);
    return base + (url.startsWith('/') ? url : '/' + url);
}

// Get relative path from imageUrl (for filesystem operations)
function getRelativePath(imageUrl) {
    if (!imageUrl) return null;
    try {
        if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
            const u = new URL(imageUrl);
            return u.pathname;
        }
        return imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl;
    } catch {
        return imageUrl;
    }
}

// Normalize entry so imageUrl is always full URL
function normalizeEntry(entry, req) {
    if (!entry) return entry;
    const p = entry.toObject ? entry.toObject() : { ...entry };
    if (p.imageUrl) p.imageUrl = toFullImageUrl(p.imageUrl, req);
    return p;
}

function normalizeEntries(entries, req) {
    return Array.isArray(entries) ? entries.map((p) => normalizeEntry(p, req)) : [];
}

// Create new entry
exports.createDonationGallery = async (req, res) => {
    try {
        const { imageTitle, description, category, publishDate, featured } = req.body;

        if (!imageTitle || !category) {
            return res.status(400).json({
                success: false,
                message: 'Image title and category are required'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Image file is required'
            });
        }

        const baseUrl = process.env.BASE_URL || getBaseUrl(req);
        const imageUrl = `${baseUrl}/uploads/donation-gallery/${req.file.filename}`;

        const entry = new DonationGallery({
            imageTitle,
            description,
            category,
            imageUrl,
            publishDate: publishDate || Date.now(),
            featured: featured === 'true' || featured === true
        });

        await entry.save();

        res.status(201).json({
            success: true,
            message: 'Donation Gallery item uploaded successfully',
            data: normalizeEntry(entry, req)
        });
    } catch (error) {
        console.error('Error creating donation gallery item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload donation gallery item',
            error: error.message
        });
    }
};

// Get all entries
exports.getAllDonationGallery = async (req, res) => {
    try {
        const { category, featured, status } = req.query;

        const filter = {};
        if (category) filter.category = category;
        if (featured !== undefined) filter.featured = featured === 'true';
        if (status) filter.status = status;

        const entries = await DonationGallery.find(filter)
            .sort({ featured: -1, publishDate: -1 });

        res.status(200).json({
            success: true,
            data: normalizeEntries(entries, req)
        });
    } catch (error) {
        console.error('Error fetching donation gallery items:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch donation gallery items',
            error: error.message
        });
    }
};

// Get single entry
exports.getDonationGalleryById = async (req, res) => {
    try {
        const entry = await DonationGallery.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        entry.viewCount += 1;
        await entry.save();

        res.status(200).json({
            success: true,
            data: normalizeEntry(entry, req)
        });
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch item',
            error: error.message
        });
    }
};

// Update entry
exports.updateDonationGallery = async (req, res) => {
    try {
        const { imageTitle, description, category, publishDate, featured, status } = req.body;

        const entry = await DonationGallery.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        if (imageTitle) entry.imageTitle = imageTitle;
        if (description !== undefined) entry.description = description;
        if (category) entry.category = category;
        if (publishDate) entry.publishDate = publishDate;
        if (featured !== undefined) entry.featured = featured === 'true' || featured === true;
        if (status) entry.status = status;

        if (req.file) {
            const baseUrl = process.env.BASE_URL || getBaseUrl(req);
            entry.imageUrl = `${baseUrl}/uploads/donation-gallery/${req.file.filename}`;
        }

        await entry.save();

        res.status(200).json({
            success: true,
            message: 'Item updated successfully',
            data: normalizeEntry(entry, req)
        });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update item',
            error: error.message
        });
    }
};

// Delete entry
exports.deleteDonationGallery = async (req, res) => {
    try {
        const entry = await DonationGallery.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        await DonationGallery.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete item',
            error: error.message
        });
    }
};

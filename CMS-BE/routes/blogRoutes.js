const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// Get all blogs
router.get('/', blogController.getBlogs);

// Get blog by slug
router.get('/slug/:slug', blogController.getBlogBySlug);

// Get blog by ID
router.get('/:id', blogController.getBlogById);

// Create new blog
router.post('/', blogController.createBlog);

// Update blog
router.put('/:id', blogController.updateBlog);

// Delete blog
router.delete('/:id', blogController.deleteBlog);

// Increment blog views
router.patch('/:id/views', blogController.incrementViews);

// Toggle like blog
router.patch('/:id/like', blogController.toggleLike);

module.exports = router;
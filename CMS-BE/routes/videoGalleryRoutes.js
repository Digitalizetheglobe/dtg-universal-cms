const express = require('express');
const router = express.Router();
const videoGalleryController = require('../controllers/videoGalleryController');

// Routes
router.post('/', videoGalleryController.createVideo);
router.get('/', videoGalleryController.getAllVideos);
router.get('/stats', videoGalleryController.getVideoStats);
router.get('/featured', videoGalleryController.getFeaturedVideos);
router.get('/category/:category', videoGalleryController.getVideosByCategory);
router.get('/:id', videoGalleryController.getVideoById);
router.put('/:id', videoGalleryController.updateVideo);
router.delete('/:id', videoGalleryController.deleteVideo);

module.exports = router;

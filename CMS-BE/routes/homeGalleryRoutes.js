const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const homeGalleryController = require('../controllers/homeGalleryController');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../public/uploads/home-gallery');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'home-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/', upload.single('image'), homeGalleryController.createHomeGallery);
router.get('/', homeGalleryController.getAllHomeGallery);
router.get('/:id', homeGalleryController.getHomeGalleryById);
router.put('/:id', upload.single('image'), homeGalleryController.updateHomeGallery);
router.delete('/:id', homeGalleryController.deleteHomeGallery);

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const aboutGalleryController = require('../controllers/aboutGalleryController');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../public/uploads/about-gallery');
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
        cb(null, 'about-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/', upload.single('image'), aboutGalleryController.createAboutGallery);
router.get('/', aboutGalleryController.getAllAboutGallery);
router.get('/:id', aboutGalleryController.getAboutGalleryById);
router.put('/:id', upload.single('image'), aboutGalleryController.updateAboutGallery);
router.delete('/:id', aboutGalleryController.deleteAboutGallery);

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const photoGalleryController = require('../controllers/photoGalleryController');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../public/uploads/photos');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Routes
router.post('/', upload.single('image'), photoGalleryController.createPhoto);
router.get('/', photoGalleryController.getAllPhotos);
router.get('/featured', photoGalleryController.getFeaturedPhotos);
router.get('/category/:category', photoGalleryController.getPhotosByCategory);
router.get('/:id', photoGalleryController.getPhotoById);
router.put('/:id', upload.single('image'), photoGalleryController.updatePhoto);
router.delete('/:id', photoGalleryController.deletePhoto);

module.exports = router;

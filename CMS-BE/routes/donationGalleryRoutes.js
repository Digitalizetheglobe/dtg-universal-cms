const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const donationGalleryController = require('../controllers/donationGalleryController');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../public/uploads/donation-gallery');
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
        cb(null, 'don-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/', upload.single('image'), donationGalleryController.createDonationGallery);
router.get('/', donationGalleryController.getAllDonationGallery);
router.get('/:id', donationGalleryController.getDonationGalleryById);
router.put('/:id', upload.single('image'), donationGalleryController.updateDonationGallery);
router.delete('/:id', donationGalleryController.deleteDonationGallery);

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const homeBannerController = require('../controllers/homeBannerController');

const path = require('path');
const fs = require('fs');

// Set storage for multer
const uploadDir = path.join(__dirname, '../uploads/');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, 'home-banner.jpg') // always overwrite
});

const upload = multer({ storage });

// Routes
router.get('/get', homeBannerController.getHomeBanner);
router.post('/upload', upload.single('banner'), homeBannerController.uploadHomeBanner);
router.delete('/delete', homeBannerController.deleteHomeBanner);

module.exports = router;

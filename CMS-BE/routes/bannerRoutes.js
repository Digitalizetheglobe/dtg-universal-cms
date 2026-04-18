const express = require('express');
const router = express.Router();
const multer = require('multer');
const bannerController = require('../controllers/bannerController');

const path = require('path');
const fs = require('fs');

// Set storage for multer
const uploadDir = path.join(__dirname, '../uploads/');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, 'banner.jpg') // always overwrite
});

const upload = multer({ storage });

// Routes
router.get('/get', bannerController.getBanner);
router.post('/upload', upload.single('banner'), bannerController.uploadBanner);
router.delete('/delete', bannerController.deleteBanner);

module.exports = router;

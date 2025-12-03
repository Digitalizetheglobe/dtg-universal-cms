const express = require('express');
const router = express.Router();
const multer = require('multer');
const bannerController = require('../controllers/bannerController');

// Set storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, 'banner.jpg') // always overwrite
});

const upload = multer({ storage });

// Routes
router.get('/get', bannerController.getBanner);
router.post('/upload', upload.single('banner'), bannerController.uploadBanner);
router.delete('/delete', bannerController.deleteBanner);

module.exports = router;

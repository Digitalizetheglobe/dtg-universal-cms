const express = require('express');
const {
  getTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require('../controllers/testimonialController');

const router = express.Router();

const multer = require('multer');
const path = require('path');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/testimonials/');
const fs = require('fs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
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

// Route to get all testimonials
router.get('/', getTestimonials);

// Route to add a new testimonial
router.post('/', upload.single('photo'), addTestimonial);

// Route to update an existing testimonial
router.put('/:id', upload.single('photo'), updateTestimonial);

// Route to delete a testimonial
router.delete('/:id', deleteTestimonial);

module.exports = router;
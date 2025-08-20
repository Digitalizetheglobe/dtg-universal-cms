const express = require('express');
const {
  getTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require('../controllers/testimonialController');

const router = express.Router();

// Route to get all testimonials
router.get('/', getTestimonials);

// Route to add a new testimonial
router.post('/', addTestimonial);

// Route to update an existing testimonial
router.put('/:id', updateTestimonial);

// Route to delete a testimonial
router.delete('/:id', deleteTestimonial);

module.exports = router;
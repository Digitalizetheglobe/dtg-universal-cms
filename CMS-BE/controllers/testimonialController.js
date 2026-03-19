const Testimonial = require('../models/Testimonial');
const fs = require('fs');
const path = require('path');

const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.status(200).json(testimonials);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const addTestimonial = async (req, res) => {
  try {
    const { fullName, rating, testimonialText, date, location, companyName, otherFields } = req.body;
    
    // Log for debugging
    console.log('Adding testimonial, body:', req.body);
    console.log('Uploaded file:', req.file);

    // Handle file upload
    let photo = '';
    if (req.file) {
      photo = req.file.filename;
    }

    // Parse otherFields safely
    let parsedOtherFields = {};
    if (otherFields) {
      try {
        parsedOtherFields = typeof otherFields === 'string' ? JSON.parse(otherFields) : otherFields;
      } catch (e) {
        console.error('Error parsing otherFields in addTestimonial:', e);
      }
    }

    const testimonial = new Testimonial({
      fullName,
      rating: rating ? Number(rating) : 5,
      testimonialText,
      date: date || new Date(),
      location,
      photo,
      companyName,
      otherFields: parsedOtherFields
    });

    const savedTestimonial = await testimonial.save();
    res.status(201).json(savedTestimonial);
  } catch (error) {
    console.error('Add testimonial error:', error);
    res.status(400).json({ message: 'Bad Request', error: error.message });
  }
};

const updateTestimonial = async (req, res) => {
  try {
    const id = req.params.id;
    const existingTestimonial = await Testimonial.findById(id);
    
    if (!existingTestimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    const { fullName, rating, testimonialText, date, location, companyName, otherFields } = req.body;
    
    // Handle file upload
    let photo = existingTestimonial.photo;
    if (req.file) {
      // Delete old photo if exists
      if (existingTestimonial.photo) {
        const oldPhotoPath = path.join(__dirname, '../uploads/testimonials', existingTestimonial.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      photo = req.file.filename;
    }

    // Build update object only with provided fields
    const updatedData = {};
    if (fullName !== undefined) updatedData.fullName = fullName;
    if (rating !== undefined) updatedData.rating = Number(rating);
    if (testimonialText !== undefined) updatedData.testimonialText = testimonialText;
    if (date !== undefined) updatedData.date = date;
    if (location !== undefined) updatedData.location = location;
    if (photo !== undefined) updatedData.photo = photo;
    if (companyName !== undefined) updatedData.companyName = companyName;
    
    if (otherFields !== undefined) {
      try {
        updatedData.otherFields = typeof otherFields === 'string' ? JSON.parse(otherFields) : otherFields;
      } catch (e) {
        console.error('Error parsing otherFields:', e);
      }
    }

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedTestimonial);
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(400).json({ message: 'Bad Request', error: error.message });
  }
};

const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    // Delete photo file if exists
    if (testimonial.photo) {
      const photoPath = path.join(__dirname, '../uploads/testimonials', testimonial.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await Testimonial.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
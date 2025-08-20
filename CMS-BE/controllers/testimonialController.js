const Testimonial = require('../models/Testimonial');

const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find();
    console.log(testimonials); // Debugging
    res.status(200).json(testimonials);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

const addTestimonial = async (req, res) => {
  try {
    // Check if the request body is an array
    if (Array.isArray(req.body)) {
      // Save multiple testimonials
      const testimonials = await Testimonial.insertMany(req.body);
      res.status(201).json(testimonials);
    } else {
      // Save a single testimonial
    const { fullName, rating, testimonialText, date, companyName, otherFields } = req.body;

    const testimonial = new Testimonial({
      fullName,
      rating,
      testimonialText,
        date: date || new Date(),
      companyName,
      otherFields,
    });

    const savedTestimonial = await testimonial.save();
    res.status(201).json(savedTestimonial);
  }
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

const updateTestimonial = async (req, res) => {
  try {
    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedTestimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
  }

    res.status(200).json(updatedTestimonial);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

const deleteTestimonial = async (req, res) => {
  try {
    const deletedTestimonial = await Testimonial.findByIdAndDelete(req.params.id);

    if (!deletedTestimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.status(200).json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

module.exports = {
  getTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
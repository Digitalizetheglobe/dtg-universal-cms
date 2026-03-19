const { sendContactFormEmail } = require('../utils/emailService');

// @desc    Submit contact form - always sends email
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res) => {
  try {
    const { data } = req.body;
    const { name, phone, email, message, terms } = data || {};

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and phone are required.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
      });
    }

    const recipientEmail =
      process.env.CONTACT_RECIPIENT_EMAIL || 'aikyavidya@hkmhyderabad.org';
    const result = await sendContactFormEmail(
      { name, phone, email, message, terms },
      recipientEmail
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send your message. Please try again or contact us directly.',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been sent. We will get back to you soon.',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
    });
  }
};

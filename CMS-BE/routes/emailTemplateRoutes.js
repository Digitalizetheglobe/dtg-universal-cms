///routes/emailTemplateRoutes.js
const express = require('express');
const router = express.Router();
// const { protect, admin } = require('../middleware/authMiddleware');
const emailTemplateController = require('../controllers/emailTemplateController');

// Create a new email template
router.post('/',  emailTemplateController.createEmailTemplate);

// Get all email templates
router.get('/', emailTemplateController.getAllEmailTemplates);

// Get a single email template by ID
router.get('/:id', emailTemplateController.getEmailTemplateById);

// Update an email template
router.put('/:id', emailTemplateController.updateEmailTemplate);

// Delete an email template
router.delete('/:id', emailTemplateController.deleteEmailTemplate);

module.exports = router;

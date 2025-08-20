const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/forms/page/:page', formController.getFormByPage);
router.post('/forms/:formId/submit', formController.submitForm);

// Temporarily making this route public (removed protect and admin middleware)
router.post('/forms', formController.createForm);
// /api/forms/forms
// Protected routes (admin only)
router.get('/forms',  formController.getAllForms);

router.get('/forms/:id', formController.getFormById);
router.put('/forms/:id', formController.updateForm);
router.delete('/forms/:id',  formController.deleteForm);
router.get('/forms/:formId/submissions',  formController.getFormSubmissions);
router.get('/submissions/:id',  formController.getSubmissionById);
router.delete('/submissions/:id', formController.deleteSubmission);

module.exports = router;

///api/forms/forms/:id
// api/forms/forms/:id/submissions
// api/forms/forms/:formId/submissions/:id
// api/forms/forms/:formId/submissions/:id/delete
// api/forms/forms/:formId/submissions/:id/update
// api/forms/forms/:formId/submissions/:id/submit
// api/forms/forms/:formId/submissions/:id/submit/delete
// api/forms/forms/:formId/submissions/:id/submit/update
// api/forms/forms/:formId/submissions/:id/submit/submit
// api/forms/forms/:formId/submissions/:id/submit/submit/delete
// api/forms/forms/:formId/submissions/:id/submit/submit/update
// api/forms/forms/:formId/submissions/:id/submit/submit/submit
// api/forms/forms/:formId/submissions/:id/submit/submit/submit/delete
// api/forms/forms/:formId/submissions/:id/submit/submit/submit/update
// api/forms/forms/:formId/submissions/:id/submit/submit/submit/submit
///api/forms/forms/:formId/submissions
//api/submissions/submissions/:id
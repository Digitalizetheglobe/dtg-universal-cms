const { DynamicForm, FormSubmission } = require('../models/DynamicForm');
const { validateFormData } = require('../utils/formValidator');
const EmailTemplate = require('../models/EmailTemplate');
const nodemailer = require('nodemailer');

// Form Management Controllers
exports.createForm = async (req, res) => {
  try {
    const newForm = new DynamicForm({
      ...req.body,
      createdBy: req.user ? req.user._id : null
    });
    
    const savedForm = await newForm.save();
    res.status(201).json({
      success: true,
      data: savedForm
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllForms = async (req, res) => {
  try {
    const forms = await DynamicForm.find();
    
    // Get submissions for each form
    const formsWithSubmissions = await Promise.all(
      forms.map(async (form) => {
        const submissions = await FormSubmission.find({ formId: form._id })
          .select('data submittedBy createdAt ipAddress userAgent')
          .sort({ createdAt: -1 }); // Sort by newest first
        
        return {
          ...form.toObject(),
          submissions: submissions,
          submissionCount: submissions.length
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: forms.length,
      data: formsWithSubmissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getFormById = async (req, res) => {
  try {
    const form = await DynamicForm.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: form
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getFormByPage = async (req, res) => {
  try {
    const form = await DynamicForm.findOne({ 
      page: req.params.page,
      isActive: true 
    });
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'No active form found for this page'
      });
    }
    
    res.status(200).json({
      success: true,
      data: form
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateForm = async (req, res) => {
  try {
    const updatedForm = await DynamicForm.findByIdAndUpdate(
      req.params.id, 
      {
        ...req.body,
        updatedBy: req.user ? req.user._id : null
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedForm) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedForm
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteForm = async (req, res) => {
  try {
    const form = await DynamicForm.findByIdAndDelete(req.params.id);
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }
    
    // Also delete all submissions for this form
    await FormSubmission.deleteMany({ formId: req.params.id });
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Form Submission Controllers
exports.submitForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const { data } = req.body;

    // Find the form
    const form = await DynamicForm.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Save the submission
    const submission = await FormSubmission.create({
      formId,
      data,
      submittedBy: req.user ? req.user._id : null,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Check if email notifications are enabled
    if (form.emailSettings.sendEmailOnSubmission) {
      const emailTemplate = await EmailTemplate.findById(form.emailSettings.emailTemplateId);
      if (emailTemplate) {
        // Replace placeholders in the email body with submission data
        let emailBody = emailTemplate.body;
        for (const key in data) {
          emailBody = emailBody.replace(`{{${key}}}`, data[key]);
        }

        // Send the email
        const transporter = nodemailer.createTransport({
          service: 'gmail', // Use your email service
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: form.emailSettings.recipientEmails.join(','),
          subject: emailTemplate.subject,
          html: emailBody
        });
      }
    }

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFormSubmissions = async (req, res) => {
  try {
    const submissions = await FormSubmission.find({ 
      formId: req.params.formId 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await FormSubmission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteSubmission = async (req, res) => {
  try {
    const submission = await FormSubmission.findByIdAndDelete(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
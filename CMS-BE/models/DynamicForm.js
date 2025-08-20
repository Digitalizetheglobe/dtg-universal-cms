const mongoose = require('mongoose');

// Schema for form fields
const formFieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'email', 'number', 'textarea', 'select', 'checkbox', 'radio', 'date', 'file']
  },
  placeholder: { type: String },
  defaultValue: { type: mongoose.Schema.Types.Mixed },
  options: [{ 
    label: String, 
    value: mongoose.Schema.Types.Mixed 
  }],
  validation: {
    required: { type: Boolean, default: false },
    pattern: { type: String },
    minLength: { type: Number },
    maxLength: { type: Number },
    min: { type: Number },
    max: { type: Number },
    customMessage: { type: String }
  },
  conditional: {
    dependsOn: { type: String }, // Field name this field depends on
    showWhen: { type: mongoose.Schema.Types.Mixed }, // Value that triggers showing this field
    hideWhen: { type: mongoose.Schema.Types.Mixed }  // Value that triggers hiding this field
  },
  order: { type: Number, default: 0 }, // For ordering fields
  isActive: { type: Boolean, default: true }
});

// Main form schema
const dynamicFormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  page: { type: String, required: true }, // e.g., 'contact', 'feedback', 'registration'
  fields: [formFieldSchema],
  emailSettings: {
    sendEmailOnSubmission: { type: Boolean, default: false }, // Enable/Disable email
    emailTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailTemplate' }, // Reference to email template
    recipientEmails: [{ type: String }], // List of email addresses to send responses
  },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Schema for form submissions
const formSubmissionSchema = new mongoose.Schema({
  formId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'DynamicForm',
    required: true
  },
  data: { type: mongoose.Schema.Types.Mixed, required: true }, // Submitted form data
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

const DynamicForm = mongoose.model('DynamicForm', dynamicFormSchema);
const FormSubmission = mongoose.model('FormSubmission', formSubmissionSchema);

module.exports = { DynamicForm, FormSubmission };
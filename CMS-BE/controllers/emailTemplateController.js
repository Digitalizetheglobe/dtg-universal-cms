///controllers/emailTemplateController.js
const EmailTemplate = require('../models/EmailTemplate');

exports.createEmailTemplate = async (req, res) => {
  try {
    const { name, subject, body } = req.body;
    const emailTemplate = await EmailTemplate.create({
      name,
      subject,
      body,
      createdBy: req.user._id
    });
    res.status(201).json(emailTemplate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllEmailTemplates = async (req, res) => {
  try {
    const emailTemplates = await EmailTemplate.find();
    res.status(200).json(emailTemplates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmailTemplateById = async (req, res) => {
  try {
    const emailTemplate = await EmailTemplate.findById(req.params.id);
    if (!emailTemplate) {
      return res.status(404).json({ message: 'Email template not found' });
    }
    res.status(200).json(emailTemplate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEmailTemplate = async (req, res) => {
  try {
    const { name, subject, body } = req.body;
    const emailTemplate = await EmailTemplate.findByIdAndUpdate(
      req.params.id,
      { name, subject, body, updatedBy: req.user._id },
      { new: true }
    );
    if (!emailTemplate) {
      return res.status(404).json({ message: 'Email template not found' });
    }
    res.status(200).json(emailTemplate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEmailTemplate = async (req, res) => {
  try {
    const emailTemplate = await EmailTemplate.findByIdAndDelete(req.params.id);
    if (!emailTemplate) {
      return res.status(404).json({ message: 'Email template not found' });
    }
    res.status(200).json({ message: 'Email template deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

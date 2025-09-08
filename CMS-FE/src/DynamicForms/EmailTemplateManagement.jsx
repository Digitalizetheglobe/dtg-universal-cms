import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';

const EmailTemplateManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testTemplateId, setTestTemplateId] = useState('');
  const [form, setForm] = useState({ name: '', subject: '', body: '' });

  // Fetch all email templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://dtg-universal-cms.onrender.com/api/email-templates');
        if (!response.ok) throw new Error('Failed to fetch templates');
        const data = await response.json();
        setTemplates(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  // Open dialog for creating or editing a template
  const openDialog = (template = null) => {
    setEditTemplate(template);
    setForm(template || { name: '', subject: '', body: '' });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditTemplate(null);
    setForm({ name: '', subject: '', body: '' });
  };

  // Save a new or updated template
  const saveTemplate = async () => {
    try {
      const method = editTemplate ? 'PUT' : 'POST';
      const url = editTemplate
        ? `https://dtg-universal-cms.onrender.com/api/email-templates/${editTemplate._id}`
        : 'https://dtg-universal-cms.onrender.com/api/email-templates';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('Failed to save template');
      const savedTemplate = await response.json();
      setTemplates((prev) =>
        editTemplate
          ? prev.map((t) => (t._id === savedTemplate._id ? savedTemplate : t))
          : [...prev, savedTemplate]
      );
      closeDialog();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete a template
  const deleteTemplate = async (id) => {
    try {
      const response = await fetch(`https://dtg-universal-cms.onrender.com/api/email-templates/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete template');
      setTemplates((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Open test email dialog
  const openTestDialog = (templateId) => {
    setTestTemplateId(templateId);
    setTestDialogOpen(true);
  };

  const closeTestDialog = () => {
    setTestDialogOpen(false);
    setTestEmail('');
    setTestTemplateId('');
  };

  // Send a test email
  const sendTestEmail = async () => {
    try {
      const response = await fetch('https://dtg-universal-cms.onrender.com/api/email-templates/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: testTemplateId,
          recipientEmail: testEmail,
          sampleData: { fieldName: 'Sample Value' },
        }),
      });
      if (!response.ok) throw new Error('Failed to send test email');
      alert('Test email sent successfully');
      closeTestDialog();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Email Template Management
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => openDialog()}
      >
        Create New Template
      </Button>

      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template._id}>
                <TableCell>{template.name}</TableCell>
                <TableCell>{template.subject}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => openDialog(template)}
                    title="Edit"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => deleteTemplate(template._id)}
                    title="Delete"
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => openTestDialog(template._id)}
                    title="Send Test Email"
                  >
                    <SendIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Template Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>
          {editTemplate ? 'Edit Template' : 'Create New Template'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Subject"
            fullWidth
            margin="normal"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
          <TextField
            label="Body"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={saveTemplate} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Email Dialog */}
      <Dialog open={testDialogOpen} onClose={closeTestDialog}>
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <TextField
            label="Recipient Email"
            fullWidth
            margin="normal"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeTestDialog}>Cancel</Button>
          <Button onClick={sendTestEmail} variant="contained">
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailTemplateManagement;
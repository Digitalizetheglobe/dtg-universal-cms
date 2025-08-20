import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Card, CardContent, Grid, 
  IconButton, Chip, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, CircularProgress, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FormBuilder from '../../../components/DynamicForms/FormBuilder';
import FormSubmissions from '../../../components/DynamicForms/FormSubmissions';

const FormsManagementPage = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [currentForm, setCurrentForm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [currentFormId, setCurrentFormId] = useState(null);

  // Fetch all forms
  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/forms');
        if (!response.ok) {
          throw new Error('Failed to load forms');
        }
        
        const data = await response.json();
        setForms(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchForms();
  }, []);

  // Create new form
  const handleCreateForm = () => {
    setCurrentForm(null);
    setShowFormBuilder(true);
  };

  // Edit existing form
  const handleEditForm = (form) => {
    setCurrentForm(form);
    setShowFormBuilder(true);
  };

  // Save form (create or update)
  const handleSaveForm = async (formData) => {
    setIsSaving(true);
    setError(null);
    
    try {
      let response;
      
      if (currentForm) {
        // Update existing form
        response = await fetch(`/api/forms/${currentForm._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      } else {
        // Create new form
        response = await fetch('/api/forms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      }
      
      if (!response.ok) {
        throw new Error('Failed to save form');
      }
      
      const data = await response.json();
      
      // Update forms list
      if (currentForm) {
        setForms(forms.map(f => f._id === currentForm._id ? data.data : f));
      } else {
        setForms([...forms, data.data]);
      }
      
      // Close form builder
      setShowFormBuilder(false);
      setCurrentForm(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete form
  const openDeleteDialog = (form) => {
    setFormToDelete(form);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setFormToDelete(null);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/forms/${formToDelete._id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete form');
      }
      
      // Remove from list
      setForms(forms.filter(f => f._id !== formToDelete._id));
      closeDeleteDialog();
    } catch (err) {
      setError(err.message);
      closeDeleteDialog();
    }
  };

  // View submissions
  const handleViewSubmissions = (formId) => {
    setCurrentFormId(formId);
    setShowSubmissions(true);
  };

  if (loading && forms.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {showFormBuilder ? (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4">
              {currentForm ? 'Edit Form' : 'Create New Form'}
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => setShowFormBuilder(false)}
            >
              Cancel
            </Button>
          </Box>
          
          <FormBuilder 
            initialForm={currentForm} 
            onSave={handleSaveForm}
            isLoading={isSaving}
          />
        </Box>
      ) : showSubmissions ? (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4">Form Submissions</Typography>
            <Button 
              variant="outlined" 
              onClick={() => setShowSubmissions(false)}
            >
              Back to Forms
            </Button>
          </Box>
          
          <FormSubmissions formId={currentFormId} />
        </Box>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4">Forms Management</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleCreateForm}
            >
              Create Form
            </Button>
          </Box>
          
          {forms.length === 0 ? (
            <Alert severity="info">
              No forms created yet. Click "Create Form" to add your first form.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {forms.map((form) => (
                <Grid item xs={12} md={6} lg={4} key={form._id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" gutterBottom>
                          {form.title}
                        </Typography>
                        <Chip 
                          label={form.isActive ? 'Active' : 'Inactive'} 
                          color={form.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Page: {form.page}
                      </Typography>
                      
                      <Typography variant="body2" gutterBottom>
                        {form.fields.length} fields
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewSubmissions(form._id)}
                          title="View Submissions"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditForm(form)}
                          title="Edit Form"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => openDeleteDialog(form)}
                          title="Delete Form"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the form "{formToDelete?.title}"? 
            This will also delete all submissions for this form. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormsManagementPage;
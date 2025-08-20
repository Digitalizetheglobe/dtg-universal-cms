import React, { useState } from 'react';
import { 
  Box, Typography, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, useMediaQuery, useTheme
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DynamicForm from './DynamicForm';

const FormPreview = ({ form }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Mock submit function that just logs the data
  const handleSubmit = (formData) => {
    console.log('Preview form submission:', formData);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<VisibilityIcon />}
        onClick={handleClickOpen}
      >
        Preview Form
      </Button>
      
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Form Preview: {form.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              This is a preview of how your form will appear to users. Form submissions in preview mode are not saved.
            </Typography>
            
            <DynamicForm
              initialFormData={form}
              onSubmit={handleSubmit}
              isSubmitting={false}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close Preview</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FormPreview;
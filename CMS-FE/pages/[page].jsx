import React, { useState } from 'react';
import { Container, Box, CircularProgress, Alert, Typography } from '@mui/material';
import DynamicForm from '../components/DynamicForms/DynamicForm';

const DynamicFormPage = ({ page, formData, error: serverError }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(serverError);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/forms/${formData.formId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: formData.data })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit form');
      }
      
      // Form submitted successfully
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // If there's no form data and no error, it means we're still loading
  if (!formData && !error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // If there's an error, show it
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Typography variant="body1">
          The form you're looking for is not available. Please check the URL or contact the administrator.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <DynamicForm 
        formId={formData._id}
        initialFormData={formData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Container>
  );
};

// This gets called on every request
export async function getServerSideProps(context) {
  const { page } = context.params;
  
  try {
    // Fetch form data from API
    const apiUrl = `${process.env.API_BASE_URL || 'https://api.harekrishnavidya.org'}/api/forms/page/${page}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Form not found for page: ${page}`);
    }
    
    const { data } = await response.json();
    
    return {
      props: {
        page,
        formData: data,
        error: null
      }
    };
  } catch (error) {
    console.error('Error fetching form:', error);
    
    return {
      props: {
        page,
        formData: null,
        error: error.message
      }
    };
  }
}

export default DynamicFormPage;
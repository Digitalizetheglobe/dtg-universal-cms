import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, FormControl, FormHelperText,
  InputLabel, Select, MenuItem, FormControlLabel, Checkbox,
  Radio, RadioGroup, Button, Grid, CircularProgress, Alert
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const DynamicForm = ({ formId, page, initialFormData, onSubmit, isSubmitting }) => {
  const [formConfig, setFormConfig] = useState(initialFormData || null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(!initialFormData);
  const [error, setError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch form configuration if not provided
  useEffect(() => {
    const fetchFormConfig = async () => {
      if (initialFormData) {
        setFormConfig(initialFormData);
        initializeFormData(initialFormData);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        let response;
        
        if (formId) {
          response = await fetch(`https://dtg-universal-cms.onrender.com/api/forms/${formId}`);
        } else if (page) {
          response = await fetch(`https://dtg-universal-cms.onrender.com/api/forms/page/${page}`);
        } else {
          throw new Error('Either formId or page must be provided');
        }
        
        if (!response.ok) {
          throw new Error('Failed to load form configuration');
        }
        
        const data = await response.json();
        setFormConfig(data.data);
        initializeFormData(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFormConfig();
  }, [formId, page, initialFormData]);

  // Initialize form data with default values
  const initializeFormData = (config) => {
    const initialData = {};
    config.fields.forEach(field => {
      if (field.defaultValue !== undefined && field.defaultValue !== null) {
        initialData[field.name] = field.defaultValue;
      }
    });
    
    setFormData(initialData);
  };

  // Handle field change
  const handleChange = (e, fieldName = null) => {
    const name = fieldName || e.target.name;
    let value;
    
    if (e && e.target) {
      if (e.target.type === 'checkbox') {
        value = e.target.checked;
      } else {
        value = e.target.value;
      }
    } else {
      // For date picker and other custom components
      value = e;
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if any
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Check if a field should be shown based on conditional logic
  const shouldShowField = (field) => {
    if (!field.conditional || !field.conditional.dependsOn) {
      return true;
    }
    
    const dependentField = field.conditional.dependsOn;
    const dependentValue = formData[dependentField];
    
    if (field.conditional.showWhen !== undefined) {
      return dependentValue === field.conditional.showWhen;
    }
    
    if (field.conditional.hideWhen !== undefined) {
      return dependentValue !== field.conditional.hideWhen;
    }
    
    return true;
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    if (!formConfig || !formConfig.fields) return true;
    
    formConfig.fields.forEach(field => {
      // Skip validation for inactive or hidden fields
      if (!field.isActive || !shouldShowField(field)) {
        return;
      }
      
      const value = formData[field.name];
      const validation = field.validation || {};
      
      // Required validation
      if (validation.required && (value === undefined || value === null || value === '')) {
        newErrors[field.name] = validation.customMessage || `${field.label} is required`;
        isValid = false;
        return;
      }
      
      // Skip other validations if field is empty and not required
      if (value === undefined || value === null || value === '') {
        return;
      }
      
      // String validations
      if (typeof value === 'string') {
        // Pattern validation
        if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
          newErrors[field.name] = validation.customMessage || `${field.label} format is invalid`;
          isValid = false;
        }
        
        // Length validations
        if (validation.minLength && value.length < validation.minLength) {
          newErrors[field.name] = validation.customMessage || 
            `${field.label} must be at least ${validation.minLength} characters`;
          isValid = false;
        }
        
        if (validation.maxLength && value.length > validation.maxLength) {
          newErrors[field.name] = validation.customMessage || 
            `${field.label} must be no more than ${validation.maxLength} characters`;
          isValid = false;
        }
      }
      
      // Number validations
      if (typeof value === 'number') {
        if (validation.min !== undefined && value < validation.min) {
          newErrors[field.name] = validation.customMessage || 
            `${field.label} must be at least ${validation.min}`;
          isValid = false;
        }
        
        if (validation.max !== undefined && value > validation.max) {
          newErrors[field.name] = validation.customMessage || 
            `${field.label} must be no more than ${validation.max}`;
          isValid = false;
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setSubmitSuccess(false);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Submit form data
    try {
      await onSubmit({
        formId: formConfig._id,
        data: formData
      });
      
      // Reset form after successful submission
      const initialData = {};
      formConfig.fields.forEach(field => {
        if (field.defaultValue !== undefined && field.defaultValue !== null) {
          initialData[field.name] = field.defaultValue;
        }
      });
      
      setFormData(initialData);
      setSubmitSuccess(true);
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    }
  };

  // Render field based on type
  const renderField = (field) => {
    if (!field.isActive || !shouldShowField(field)) {
      return null;
    }
    
    const fieldProps = {
      name: field.name,
      value: formData[field.name] !== undefined ? formData[field.name] : '',
      onChange: (e) => handleChange(e, field.name),
      error: !!errors[field.name],
      helperText: errors[field.name] || '',
      fullWidth: true,
      margin: "normal",
      required: field.validation?.required,
      placeholder: field.placeholder || '',
      disabled: isSubmitting
    };
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <TextField
            {...fieldProps}
            label={field.label}
            type={field.type}
          />
        );
        
      case 'textarea':
        return (
          <TextField
            {...fieldProps}
            label={field.label}
            multiline
            rows={4}
          />
        );
        
      case 'select':
        return (
          <FormControl 
            fullWidth 
            margin="normal" 
            error={!!errors[field.name]}
            required={field.validation?.required}
          >
            <InputLabel>{field.label}</InputLabel>
            <Select
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              label={field.label}
              disabled={isSubmitting}
            >
              <MenuItem value="">
                <em>Select an option</em>
              </MenuItem>
              {(field.options || []).map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errors[field.name] && (
              <FormHelperText>{errors[field.name]}</FormHelperText>
            )}
          </FormControl>
        );
        
      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                name={field.name}
                checked={!!formData[field.name]}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            }
            label={field.label}
          />
        );
        
      case 'radio':
        return (
          <FormControl 
            component="fieldset" 
            margin="normal"
            error={!!errors[field.name]}
            required={field.validation?.required}
          >
            <Typography component="legend">{field.label}</Typography>
            <RadioGroup
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
            >
              {(field.options || []).map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio disabled={isSubmitting} />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
            {errors[field.name] && (
              <FormHelperText>{errors[field.name]}</FormHelperText>
            )}
          </FormControl>
        );
        
      case 'date':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={field.label}
              value={formData[field.name] || null}
              onChange={(date) => handleChange(date, field.name)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                  error={!!errors[field.name]}
                  helperText={errors[field.name] || ''}
                  required={field.validation?.required}
                  disabled={isSubmitting}
                />
              )}
            />
          </LocalizationProvider>
        );
        
      case 'file':
        return (
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body1" component="div" gutterBottom>
              {field.label} {field.validation?.required && '*'}
            </Typography>
            <input
              type="file"
              name={field.name}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors[field.name] && (
              <FormHelperText error>{errors[field.name]}</FormHelperText>
            )}
          </Box>
        );
        
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!formConfig) {
    return (
      <Alert severity="warning" sx={{ my: 2 }}>
        Form not found
      </Alert>
    );
  }

  return (
    <Box>
      {submitSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Form submitted successfully!
        </Alert>
      )}
      
      <Typography variant="h5" gutterBottom>
        {formConfig.title}
      </Typography>
      
      {formConfig.description && (
        <Typography variant="body1" paragraph>
          {formConfig.description}
        </Typography>
      )}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {formConfig.fields.map((field) => (
            <Grid item xs={12} key={field.name}>
              {renderField(field)}
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ mt: 3 }}>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default DynamicForm;
import React, { useState, useEffect } from 'react';
import { 
  Button, Box, Card, Typography, TextField, FormControl, 
  InputLabel, Select, MenuItem, FormControlLabel, Checkbox,
  IconButton, Divider, Grid, Switch, Accordion, AccordionSummary,
  AccordionDetails, Tabs, Tab
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const FieldEditor = ({ field, formFields, onSave, onCancel }) => {
  const [fieldData, setFieldData] = useState({ ...field });
  const [tabValue, setTabValue] = useState(0);

  // Field types available
  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email Input' },
    { value: 'number', label: 'Number Input' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'select', label: 'Dropdown Select' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'date', label: 'Date Picker' },
    { value: 'file', label: 'File Upload' }
  ];

  // Handle basic field changes
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFieldData({
      ...fieldData,
      [name]: value
    });
  };

  // Handle validation changes
  const handleValidationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFieldData({
      ...fieldData,
      validation: {
        ...fieldData.validation,
        [name]: type === 'checkbox' ? checked : value
      }
    });
  };

  // Handle conditional logic changes
  const handleConditionalChange = (e) => {
    const { name, value } = e.target;
    setFieldData({
      ...fieldData,
      conditional: {
        ...fieldData.conditional,
        [name]: value
      }
    });
  };

  // Handle active toggle
  const handleActiveToggle = (e) => {
    setFieldData({
      ...fieldData,
      isActive: e.target.checked
    });
  };

  // Handle options for select, checkbox, radio
  const addOption = () => {
    setFieldData({
      ...fieldData,
      options: [...(fieldData.options || []), { label: '', value: '' }]
    });
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...(fieldData.options || [])];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value
    };
    setFieldData({
      ...fieldData,
      options: newOptions
    });
  };

  const removeOption = (index) => {
    const newOptions = [...(fieldData.options || [])];
    newOptions.splice(index, 1);
    setFieldData({
      ...fieldData,
      options: newOptions
    });
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Save field
  const handleSave = () => {
    // Make sure name is valid (no spaces, special chars)
    const cleanName = fieldData.name.trim().replace(/\s+/g, '_').toLowerCase();
    onSave({
      ...fieldData,
      name: cleanName
    });
  };

  // Generate field name from label if not set
  useEffect(() => {
    if (!fieldData.name && fieldData.label) {
      const generatedName = fieldData.label
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      
      setFieldData({
        ...fieldData,
        name: generatedName
      });
    }
  }, [fieldData.label]);

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {field.name ? 'Edit Field' : 'Add New Field'}
      </Typography>
      
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Basic Settings" />
        <Tab label="Validation" />
        <Tab label="Conditional Logic" />
      </Tabs>

      {/* Basic Settings Tab */}
      {tabValue === 0 && (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Field Label"
                name="label"
                value={fieldData.label}
                onChange={handleFieldChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Field Name"
                name="name"
                value={fieldData.name}
                onChange={handleFieldChange}
                required
                margin="normal"
                helperText="Unique identifier for this field (auto-generated from label)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Field Type</InputLabel>
                <Select
                  name="type"
                  value={fieldData.type}
                  onChange={handleFieldChange}
                  label="Field Type"
                >
                  {fieldTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Placeholder"
                name="placeholder"
                value={fieldData.placeholder || ''}
                onChange={handleFieldChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Default Value"
                name="defaultValue"
                value={fieldData.defaultValue || ''}
                onChange={handleFieldChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={fieldData.isActive}
                    onChange={handleActiveToggle}
                    color="primary"
                  />
                }
                label="Field Active"
              />
            </Grid>
          </Grid>

          {/* Options for select, checkbox, radio */}
          {['select', 'checkbox', 'radio'].includes(fieldData.type) && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">Options</Typography>
                <Button 
                  startIcon={<AddIcon />} 
                  onClick={addOption}
                  size="small"
                >
                  Add Option
                </Button>
              </Box>
              
              {(fieldData.options || []).map((option, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 1, gap: 1 }}>
                  <TextField
                    label="Label"
                    value={option.label}
                    onChange={(e) => updateOption(index, 'label', e.target.value)}
                    size="small"
                    sx={{ flexGrow: 1 }}
                  />
                  <TextField
                    label="Value"
                    value={option.value}
                    onChange={(e) => updateOption(index, 'value', e.target.value)}
                    size="small"
                    sx={{ flexGrow: 1 }}
                  />
                  <IconButton onClick={() => removeOption(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              
              {(fieldData.options || []).length === 0 && (
                <Typography color="text.secondary">
                  No options added yet. Click "Add Option" to create options.
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Validation Tab */}
      {tabValue === 1 && (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={fieldData.validation?.required || false}
                    onChange={handleValidationChange}
                    name="required"
                  />
                }
                label="Required Field"
              />
            </Grid>
            
            {['text', 'textarea', 'email'].includes(fieldData.type) && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Minimum Length"
                    name="minLength"
                    type="number"
                    value={fieldData.validation?.minLength || ''}
                    onChange={handleValidationChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Maximum Length"
                    name="maxLength"
                    type="number"
                    value={fieldData.validation?.maxLength || ''}
                    onChange={handleValidationChange}
                    margin="normal"
                  />
                </Grid>
              </>
            )}
            
            {['number'].includes(fieldData.type) && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Minimum Value"
                    name="min"
                    type="number"
                    value={fieldData.validation?.min || ''}
                    onChange={handleValidationChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Maximum Value"
                    name="max"
                    type="number"
                    value={fieldData.validation?.max || ''}
                    onChange={handleValidationChange}
                    margin="normal"
                  />
                </Grid>
              </>
            )}
            
            {['text', 'email'].includes(fieldData.type) && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Pattern (Regex)"
                  name="pattern"
                  value={fieldData.validation?.pattern || ''}
                  onChange={handleValidationChange}
                  margin="normal"
                  helperText="Regular expression pattern for validation"
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Custom Error Message"
                name="customMessage"
                value={fieldData.validation?.customMessage || ''}
                onChange={handleValidationChange}
                margin="normal"
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Conditional Logic Tab */}
      {tabValue === 2 && (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Depends On Field</InputLabel>
                <Select
                  name="dependsOn"
                  value={fieldData.conditional?.dependsOn || ''}
                  onChange={handleConditionalChange}
                  label="Depends On Field"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {formFields
                    .filter(f => f.name !== fieldData.name)
                    .map((field) => (
                      <MenuItem key={field.name} value={field.name}>
                        {field.label}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            
            {fieldData.conditional?.dependsOn && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Show When Value Is"
                    name="showWhen"
                    value={fieldData.conditional?.showWhen || ''}
                    onChange={handleConditionalChange}
                    margin="normal"
                    helperText="Show this field when the dependent field has this value"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Hide When Value Is"
                    name="hideWhen"
                    value={fieldData.conditional?.hideWhen || ''}
                    onChange={handleConditionalChange}
                    margin="normal"
                    helperText="Hide this field when the dependent field has this value"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={!fieldData.label || !fieldData.name}
        >
          Save Field
        </Button>
      </Box>
    </Card>
  );
};

export default FieldEditor;
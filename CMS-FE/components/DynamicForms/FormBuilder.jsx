import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Button, Box, Card, Typography, TextField, FormControl, 
  InputLabel, Select, MenuItem, FormControlLabel, Checkbox,
  IconButton, Divider, Grid, Switch
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FieldEditor from './FieldEditor';
import FormPreview from './FormPreview';

const FormBuilder = ({ initialForm, onSave, isLoading }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    page: '',
    fields: [],
    isActive: true,
    ...initialForm
  });
  
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(-1);

  // Handle form basic info changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  // Handle active toggle
  const handleActiveToggle = (e) => {
    setForm({
      ...form,
      isActive: e.target.checked
    });
  };

  // Add new field
  const addNewField = () => {
    setCurrentField({
      name: '',
      label: '',
      type: 'text',
      placeholder: '',
      defaultValue: '',
      options: [],
      validation: {
        required: false
      },
      conditional: {},
      order: form.fields.length,
      isActive: true
    });
    setCurrentFieldIndex(-1);
    setShowFieldEditor(true);
  };

  // Edit existing field
  const editField = (index) => {
    setCurrentField({ ...form.fields[index] });
    setCurrentFieldIndex(index);
    setShowFieldEditor(true);
  };

  // Save field (new or edited)
  const saveField = (field) => {
    const newFields = [...form.fields];
    
    if (currentFieldIndex === -1) {
      // Add new field
      newFields.push(field);
    } else {
      // Update existing field
      newFields[currentFieldIndex] = field;
    }
    
    // Update form with new fields
    setForm({
      ...form,
      fields: newFields
    });
    
    setShowFieldEditor(false);
  };

  // Delete field
  const deleteField = (index) => {
    const newFields = [...form.fields];
    newFields.splice(index, 1);
    
    // Update order for remaining fields
    const updatedFields = newFields.map((field, idx) => ({
      ...field,
      order: idx
    }));
    
    setForm({
      ...form,
      fields: updatedFields
    });
  };

  // Handle drag and drop reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(form.fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update order for all fields
    const updatedFields = items.map((field, idx) => ({
      ...field,
      order: idx
    }));
    
    setForm({
      ...form,
      fields: updatedFields
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Box>
      {showFieldEditor ? (
        <FieldEditor 
          field={currentField} 
          formFields={form.fields}
          onSave={saveField} 
          onCancel={() => setShowFieldEditor(false)} 
        />
      ) : (
        <form onSubmit={handleSubmit}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>Form Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Form Title"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Page Identifier"
                  name="page"
                  value={form.page}
                  onChange={handleFormChange}
                  required
                  margin="normal"
                  helperText="Unique identifier for this form (e.g., contact, feedback)"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  multiline
                  rows={2}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.isActive}
                      onChange={handleActiveToggle}
                      color="primary"
                    />
                  }
                  label="Form Active"
                />
              </Grid>
            </Grid>
          </Card>

          <Card sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5">Form Fields</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={addNewField}
              >
                Add Field
              </Button>
            </Box>

            {form.fields.length === 0 ? (
              <Typography color="text.secondary" align="center" py={4}>
                No fields added yet. Click "Add Field" to create your first form field.
              </Typography>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="fields">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {form.fields.map((field, index) => (
                        <Draggable key={field.name} draggableId={field.name} index={index}>
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{ p: 2, mb: 2, bgcolor: field.isActive ? 'background.paper' : 'action.disabledBackground' }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                  <Typography variant="subtitle1">{field.label}</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {field.type} {field.validation?.required && '(Required)'} 
                                    {field.conditional?.dependsOn && ` - Conditional on ${field.conditional.dependsOn}`}
                                  </Typography>
                                </Box>
                                <Box>
                                  <IconButton size="small" onClick={() => editField(index)}>
                                    <i className="fas fa-edit"></i>
                                  </IconButton>
                                  <IconButton size="small" onClick={() => deleteField(index)}>
                                    <DeleteIcon />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
            {form.title && form.fields.length > 0 && (
              <FormPreview form={form} />
            )}
            <Button 
              variant="contained" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Form'}
            </Button>
          </Box>
        </form>
      )}
    </Box>
  );
};

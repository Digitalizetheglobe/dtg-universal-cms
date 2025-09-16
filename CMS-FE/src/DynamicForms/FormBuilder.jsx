import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import FieldEditor from '../components/DynamicForms/FieldEditor';
import FormPreview from '../components/DynamicForms/FormPreview';

// Icons - using correct MUI icon names
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const FormBuilder = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    page: '',
    fields: [],
    isActive: true
  });
  
  const [loading, setLoading] = useState(formId ? true : false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState(0);

  // Fetch form data if editing
  useEffect(() => {
    const fetchForm = async () => {
      if (!formId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`https://api.harekrishnavidya.org/api/forms/forms/${formId}`);
        if (!response.ok) {
          throw new Error('Failed to load form data');
        }
        
        const data = await response.json();
        setForm(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchForm();
  }, [formId]);

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

  // Handle tab change
  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  // Save form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!form.title) {
      setError('Form title is required');
      return;
    }
    
    if (!form.page) {
      setError('Page identifier is required');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      let response;
      
      if (formId) {
        // Update existing form
        response = await fetch(`https://api.harekrishnavidya.org/api/forms/forms/${formId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(form)
        });
      } else {
        // Create new form
        response = await fetch('https://api.harekrishnavidya.org/api/forms/forms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(form)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save form');
      }
      
      // Navigate back to forms dashboard
      navigate('/form-management');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate('/form-management')}
            className="flex items-center mr-4 text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowBackIcon className="mr-1" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            {formId ? 'Edit Form' : 'Create New Form'}
          </h1>
        </div>
        
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
            <p className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </p>
          </div>
        )}
        
        {showFieldEditor ? (
          <div className="bg-white rounded-xl shadow-xl p-6 border border-indigo-100">
            <FieldEditor 
              field={currentField} 
              formFields={form.fields}
              onSave={saveField} 
              onCancel={() => setShowFieldEditor(false)} 
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Tabs */}
            <div className="flex mb-6 bg-white rounded-lg shadow-md p-1 border border-indigo-100 w-fit">
              <button
                type="button"
                onClick={() => handleTabChange(0)}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === 0 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Form Details
              </button>
              <button
                type="button"
                onClick={() => handleTabChange(1)}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === 1 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Form Fields
              </button>
            </div>
            
            {/* Form Details Tab */}
            {activeTab === 0 && (
              <div className="bg-white rounded-xl shadow-xl p-8 mb-6 border border-indigo-100">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">Form Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Form Title</label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Enter form title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Page Identifier</label>
                    <input
                      type="text"
                      name="page"
                      value={form.page}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="e.g., contact, feedback"
                    />
                    <p className="text-xs text-slate-500">Unique identifier for this form</p>
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Description</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleFormChange}
                      rows="3"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Describe the purpose of this form"
                    ></textarea>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={form.isActive}
                        onChange={handleActiveToggle}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-600"></div>
                      <span className="ml-3 text-sm font-medium text-slate-700">Form Active</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {/* Form Fields Tab */}
            {activeTab === 1 && (
              <div className="bg-white rounded-xl shadow-xl p-8 mb-6 border border-indigo-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Form Fields</h2>
                  <button 
                    type="button"
                    onClick={addNewField}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg shadow-md transition-all transform hover:scale-105"
                  >
                    <AddIcon className="mr-1" fontSize="small" />
                    Add Field
                  </button>
                </div>

                {form.fields.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                    <div className="text-slate-400 mb-3">
                      <AddIcon fontSize="large" />
                    </div>
                    <p className="text-slate-500 text-center">
                      No fields added yet. Click "Add Field" to create your first form field.
                    </p>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="fields">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                          {form.fields.map((field, index) => (
                            <Draggable key={field.name} draggableId={field.name} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`p-4 rounded-lg border ${
                                    field.isActive 
                                      ? 'bg-white border-indigo-100 shadow-sm' 
                                      : 'bg-slate-50 border-slate-200'
                                  } transition-all hover:shadow-md`}
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                      <div 
                                        {...provided.dragHandleProps}
                                        className="text-slate-400 hover:text-indigo-500 cursor-grab mr-3"
                                      >
                                        <DragIndicatorIcon />
                                      </div>
                                      <div>
                                        <h3 className="font-medium text-slate-800">{field.label}</h3>
                                        <div className="flex items-center mt-1">
                                          <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600 mr-2">
                                            {field.type}
                                          </span>
                                          {field.validation?.required && (
                                            <span className="text-xs px-2 py-1 bg-indigo-100 rounded-full text-indigo-700 mr-2">
                                              Required
                                            </span>
                                          )}
                                          {field.conditional?.dependsOn && (
                                            <span className="text-xs px-2 py-1 bg-purple-100 rounded-full text-purple-700">
                                              Conditional
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex">
                                      <button
                                        type="button"
                                        onClick={() => editField(index)}
                                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                      >
                                        <EditIcon fontSize="small" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => deleteField(index)}
                                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end items-center gap-4 mt-6">
              {form.title && form.fields.length > 0 && (
                <FormPreview form={form} />
              )}
              <button 
                type="submit" 
                disabled={saving}
                className={`flex items-center px-6 py-3 rounded-lg font-medium shadow-lg transition-all ${
                  saving 
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105'
                }`}
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon className="mr-2" />
                    Save Form
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;
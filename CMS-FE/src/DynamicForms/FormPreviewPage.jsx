import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgress } from '@mui/material';
import { ArrowBack, CheckCircle, ErrorOutline, InfoOutlined } from '@mui/icons-material';
import FormApiGuide from './FormApiGuide';
import { Code as CodeIcon } from '@mui/icons-material';

const FormPreviewPage = () => {
  const { formId, page } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreview] = useState(!!formId);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showApiGuide, setShowApiGuide] = useState(false);

  // Fetch form data
  useEffect(() => {
    const fetchFormData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let response;
        
        if (formId) {
          response = await fetch(`https://api.harekrishnavidya.org/api/forms/forms/${formId}`);
        } else if (page) {
          response = await fetch(`https://api.harekrishnavidya.org/api/forms/page/${page}`);
        } else {
          throw new Error('Either formId or page must be provided');
        }
        
        if (!response.ok) {
          throw new Error('Failed to load form');
        }
        
        const data = await response.json();
        setFormData(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFormData();
  }, [formId, page]);

  // Handle form submission
  const handleSubmit = async (formValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Prepare the data object as required by the API
      const submissionData = {
        data: formValues
      };

      const response = await fetch(`https://api.harekrishnavidya.org/api/forms/forms/${formId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit form');
      }
      
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <CircularProgress className="text-indigo-600" size={60} />
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
                <div className="flex items-center">
              {isPreview && (
                <button
                  onClick={() => navigate('/form-management')}
                  className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors mr-6"
                >
                  <ArrowBack className="mr-2" />
                  <span className="font-medium">Back to Forms</span>
                </button>
          )}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {isPreview ? 'Form Preview' : formData?.title || 'Form'}
                </h1>
                {formData?.description && (
                  <p className="mt-1 text-gray-500">{formData.description}</p>
          )}
              </div>
    </div>
            
            {/* API Guide Button */}
            {isPreview && formId && (
              <button
                onClick={() => setShowApiGuide(true)}
                className="flex items-center px-3 py-2 border border-indigo-300 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                title="View API Integration Guide"
              >
                <CodeIcon className="mr-2" />
                <span className="font-medium">API Guide</span>
              </button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence>
          {isPreview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <InfoOutlined className="h-5 w-5 text-blue-400" />
      </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Preview Mode</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        This is a preview of how your form will appear to users. 
                        Form submissions in preview mode are not saved to the database.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ErrorOutline className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error submitting form</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-x-0 top-4 z-50 flex justify-center"
            >
              <div className="rounded-md bg-green-50 p-4 shadow-lg ring-1 ring-green-100 max-w-md">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <p className="text-sm font-medium text-green-800">
                    {isPreview ? 'Form submission simulated successfully!' : 'Form submitted successfully!'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow overflow-hidden sm:rounded-lg"
        >
          {formData ? (
            <FormRenderer 
              formConfig={formData}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              isPreview={isPreview}
            />
          ) : (
            <div className="px-6 py-12 text-center">
              <ErrorOutline className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Form not found</h3>
              <p className="mt-1 text-gray-500">The requested form could not be loaded.</p>
              <div className="mt-6">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go back
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* API Guide Modal */}
      <AnimatePresence>
        {showApiGuide && (
          <FormApiGuide 
            formData={formData} 
            onClose={() => setShowApiGuide(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// FormRenderer component that handles the actual form fields
const FormRenderer = ({ formConfig, onSubmit, isSubmitting, isPreview }) => {
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});

  // Initialize form values
  useEffect(() => {
    const initialValues = {};
    formConfig.fields?.forEach(field => {
      initialValues[field.name] = field.defaultValue || '';
    });
    setFormValues(initialValues);
  }, [formConfig]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    formConfig.fields?.forEach(field => {
      if (field.required && !formValues[field.name]) {
        newErrors[field.name] = 'This field is required';
        isValid = false;
      }
      
      // Add more validation rules as needed
      if (field.type === 'email' && formValues[field.name] && !/^\S+@\S+\.\S+$/.test(formValues[field.name])) {
        newErrors[field.name] = 'Please enter a valid email address';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formValues);
      // Reset form after successful submission if not in preview mode
      if (!isPreview) {
        const resetValues = {};
        formConfig.fields?.forEach(field => {
          resetValues[field.name] = field.defaultValue || '';
        });
        setFormValues(resetValues);
      }
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900">{formConfig.title}</h2>
        {formConfig.description && (
          <p className="mt-1 text-sm text-gray-500">{formConfig.description}</p>
        )}
      </div>
      
      <div className="px-4 py-5 sm:p-6 space-y-6">
        {formConfig.fields?.map((field) => (
          <div key={field.name} className="space-y-1">
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </label>
            
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                rows={3}
                value={formValues[field.name] || ''}
                onChange={handleChange}
                className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border ${errors[field.name] ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                placeholder={field.placeholder}
                disabled={isSubmitting}
              />
            ) : (
              <input
                type={field.type || 'text'}
                id={field.name}
                name={field.name}
                value={formValues[field.name] || ''}
                onChange={handleChange}
                className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border ${errors[field.name] ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                placeholder={field.placeholder}
                disabled={isSubmitting}
              />
            )}
            
            {errors[field.name] && (
              <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
            )}
            
            {field.helpText && (
              <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
            )}
          </div>
        ))}
      </div>
      
      <div className="px-4 py-4 sm:px-6 bg-gray-50 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </form>
  );
};

export default FormPreviewPage;
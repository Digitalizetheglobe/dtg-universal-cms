import React from 'react';
import { motion } from 'framer-motion';
import { Close as CloseIcon, ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { Tooltip } from '@mui/material';

const FormApiGuide = ({ formData, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  
  // Generate example JSON body based on form fields
  const generateExampleBody = () => {
    if (!formData || !formData.fields) return '{}';
    
    const exampleData = {};
    formData.fields.forEach(field => {
      // Set appropriate example values based on field type
      switch (field.type) {
        case 'email':
          exampleData[field.name] = 'example@email.com';
          break;
        case 'number':
          exampleData[field.name] = 42;
          break;
        case 'date':
          exampleData[field.name] = '2025-01-01';
          break;
        case 'textarea':
          exampleData[field.name] = 'This is an example text response';
          break;
        default:
          exampleData[field.name] = `Example ${field.label}`;
      }
    });
    
    return JSON.stringify({ data: exampleData }, null, 2);
  };

  const apiEndpoint = `/api/forms/forms/${formData?._id}/submit`;
  const jsonBody = generateExampleBody();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              API Integration Guide: {formData?.title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <CloseIcon />
            </button>
          </div>
          
          <div className="bg-white px-4 pt-5 pb-6 sm:p-6 sm:pb-6">
            <div className="space-y-6">
              {/* API Endpoint Section */}
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">API Endpoint</h4>
                <div className="bg-gray-50 rounded-md p-4 flex justify-between items-center">
                  <code className="text-sm text-indigo-600 font-mono">
                    POST {apiEndpoint}
                  </code>
                  <Tooltip title={copied ? "Copied!" : "Copy to clipboard"} placement="top">
                    <button 
                      onClick={() => copyToClipboard(`POST ${apiEndpoint}`)}
                      className="text-gray-500 hover:text-indigo-600 focus:outline-none"
                    >
                      <ContentCopyIcon fontSize="small" />
                    </button>
                  </Tooltip>
                </div>
              </div>
              
              {/* Headers Section */}
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">Headers</h4>
                <div className="bg-gray-50 rounded-md p-4 flex justify-between items-center">
                  <code className="text-sm text-indigo-600 font-mono">
                    Content-Type: application/json
                  </code>
                  <Tooltip title={copied ? "Copied!" : "Copy to clipboard"} placement="top">
                    <button 
                      onClick={() => copyToClipboard('Content-Type: application/json')}
                      className="text-gray-500 hover:text-indigo-600 focus:outline-none"
                    >
                      <ContentCopyIcon fontSize="small" />
                    </button>
                  </Tooltip>
                </div>
              </div>
              
              {/* Request Body Section */}
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">Request Body</h4>
                <div className="relative">
                  <div className="bg-gray-50 rounded-md p-4 overflow-auto max-h-60">
                    <pre className="text-sm text-indigo-600 font-mono whitespace-pre">
                      {jsonBody}
                    </pre>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Tooltip title={copied ? "Copied!" : "Copy to clipboard"} placement="top">
                      <button 
                        onClick={() => copyToClipboard(jsonBody)}
                        className="bg-white p-1 rounded-md shadow-sm text-gray-500 hover:text-indigo-600 focus:outline-none"
                      >
                        <ContentCopyIcon fontSize="small" />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
              
              {/* Code Example Section */}
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">JavaScript Example</h4>
                <div className="relative">
                  <div className="bg-gray-50 rounded-md p-4 overflow-auto max-h-60">
                    <pre className="text-sm text-indigo-600 font-mono whitespace-pre">
{`// Example using fetch API
async function submitForm(formData) {
  try {
    const response = await fetch('${apiEndpoint}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: formData })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Form submission failed');
    }
    
    const result = await response.json();
    console.log('Form submitted successfully:', result);
    return result;
  } catch (error) {
    console.error('Error submitting form:', error);
    throw error;
  }
}`}
                    </pre>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Tooltip title={copied ? "Copied!" : "Copy to clipboard"} placement="top">
                      <button 
                        onClick={() => copyToClipboard(`// Example using fetch API
async function submitForm(formData) {
  try {
    const response = await fetch('${apiEndpoint}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: formData })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Form submission failed');
    }
    
    const result = await response.json();
    console.log('Form submitted successfully:', result);
    return result;
  } catch (error) {
    console.error('Error submitting form:', error);
    throw error;
  }
}`)}
                        className="bg-white p-1 rounded-md shadow-sm text-gray-500 hover:text-indigo-600 focus:outline-none"
                      >
                        <ContentCopyIcon fontSize="small" />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FormApiGuide;
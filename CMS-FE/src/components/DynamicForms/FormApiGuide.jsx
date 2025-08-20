import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, ContentCopy, Check, ChevronRight, ChevronLeft } from '@mui/icons-material';
import { Tooltip, IconButton } from '@mui/material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const FormApiGuide = ({ formId, formConfig, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  
  // Generate example JSON body based on form fields
  const generateExampleBody = () => {
    const exampleData = {};
    
    formConfig.fields?.forEach(field => {
      // Generate appropriate example values based on field type
      switch(field.type) {
        case 'email':
          exampleData[field.name] = 'user@example.com';
          break;
        case 'number':
          exampleData[field.name] = 42;
          break;
        case 'date':
          exampleData[field.name] = '2025-06-06';
          break;
        case 'tel':
          exampleData[field.name] = '+1234567890';
          break;
        case 'textarea':
          exampleData[field.name] = 'This is an example response for a text area field.';
          break;
        default:
          exampleData[field.name] = `Example value for ${field.label}`;
      }
    });
    
    return {
      data: exampleData
    };
  };
  
  const exampleBody = generateExampleBody();
  const exampleBodyString = JSON.stringify(exampleBody, null, 2);
  
  const apiEndpoint = `http://localhost:5000/api/forms/forms/${formId}/submit`;
  
  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'endpoints', label: 'Endpoints' },
    { id: 'request', label: 'Request Body' },
    { id: 'response', label: 'Response' },
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4"
    >
      <motion.div 
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-indigo-50">
          <div className="flex items-center">
            <Code className="text-indigo-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">API Integration Guide</h2>
          </div>
          <IconButton onClick={onClose} aria-label="close">
            <ChevronLeft className="text-gray-600" />
          </IconButton>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Form API Integration</h3>
              <p className="text-gray-600">
                This guide helps you integrate this form with your application using our REST API.
                You can use the provided endpoints to submit form data programmatically.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Form Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Form ID</p>
                    <p className="font-mono text-sm">{formId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Form Name</p>
                    <p className="font-medium">{formConfig.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Number of Fields</p>
                    <p className="font-medium">{formConfig.fields?.length || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <ChevronRight className="text-indigo-500 h-4 w-4" />
                <span className="text-gray-600">Select a tab above to see detailed API documentation</span>
              </div>
            </div>
          )}
          
          {activeTab === 'endpoints' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">API Endpoints</h3>
              
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Submit Form Data</h4>
                <div className="flex items-center mb-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded mr-2">POST</span>
                  <code className="text-sm font-mono flex-1 bg-gray-100 p-2 rounded">{apiEndpoint}</code>
                  <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleCopyCode(apiEndpoint)}
                      className="ml-2"
                    >
                      {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </div>
                <p className="text-sm text-gray-600">
                  Use this endpoint to submit form data. The request must include a JSON body with all required fields.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Get Form Structure</h4>
                <div className="flex items-center mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded mr-2">GET</span>
                  <code className="text-sm font-mono flex-1 bg-gray-100 p-2 rounded">
                    {`http://localhost:5000/api/forms/forms/${formId}`}
                  </code>
                  <Tooltip title="Copy to clipboard">
                    <IconButton 
                      size="small" 
                      onClick={() => handleCopyCode(`http://localhost:5000/api/forms/forms/${formId}`)}
                      className="ml-2"
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </div>
                <p className="text-sm text-gray-600">
                  Use this endpoint to retrieve the form structure, including all fields and their properties.
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'request' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Request Body</h3>
              <p className="text-gray-600">
                The request body should be a JSON object with a <code className="bg-gray-100 px-1 rounded">data</code> property 
                containing all form field values.
              </p>
              
              <div className="relative">
                <div className="absolute top-2 right-2">
                  <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleCopyCode(exampleBodyString)}
                      className="bg-white shadow-sm"
                    >
                      {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </div>
                <SyntaxHighlighter 
                  language="json" 
                  style={docco}
                  className="rounded-md text-sm"
                  customStyle={{ padding: '1rem' }}
                >
                  {exampleBodyString}
                </SyntaxHighlighter>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                <h4 className="flex items-center text-blue-800 font-medium mb-1">
                  <InfoOutlined className="h-4 w-4 mr-1" /> Field Requirements
                </h4>
                <ul className="list-disc pl-5 space-y-1">
                  {formConfig.fields?.filter(field => field.required).map(field => (
                    <li key={field.name} className="text-sm text-blue-800">
                      <code>{field.name}</code> is required
                      {field.type === 'email' && " (must be a valid email address)"}
                    </li>
                  ))}
                  {formConfig.fields?.filter(field => field.required).length === 0 && (
                    <li className="text-sm text-blue-800">No required fields</li>
                  )}
                </ul>
              </div>
            </div>
          )}
          
          {activeTab === 'response' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Response Format</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-2">Successful Response (200 OK)</h4>
                  <SyntaxHighlighter 
                    language="json" 
                    style={docco}
                    className="rounded-md text-sm"
                  >
                    {JSON.stringify({
                      success: true,
                      message: "Form submitted successfully",
                      data: {
                        submissionId: "60f1b5b3e6b1f2c8c0b5e1a3",
                        timestamp: new Date().toISOString()
                      }
                    }, null, 2)}
                  </SyntaxHighlighter>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-2">Error Response (400 Bad Request)</h4>
                  <SyntaxHighlighter 
                    language="json" 
                    style={docco}
                    className="rounded-md text-sm"
                  >
                    {JSON.stringify({
                      success: false,
                      message: "Validation failed",
                      errors: [
                        {
                          field: "email",
                          message: "Please enter a valid email address"
                        }
                      ]
                    }, null, 2)}
                  </SyntaxHighlighter>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
                <h4 className="flex items-center text-yellow-800 font-medium mb-1">
                  <WarningAmberOutlined className="h-4 w-4 mr-1" /> Important Notes
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-800">
                  <li>All API requests require proper authentication headers if enabled</li>
                  <li>Rate limits may apply to prevent abuse</li>
                  <li>Check response status codes and error messages for troubleshooting</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
          <a
            href="https://documentation-url.example/api"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Full Documentation
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FormApiGuide;
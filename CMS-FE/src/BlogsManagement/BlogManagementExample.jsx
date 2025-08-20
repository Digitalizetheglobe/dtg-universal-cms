import React, { useState } from 'react';
import { FiList, FiPlus, FiEdit } from 'react-icons/fi';
import BlogList from './BlogList';
import BlogManagementForm from './BlogManagementForm';

const BlogManagementExample = () => {
  const [activeView, setActiveView] = useState('list'); // 'list', 'create', 'edit'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Blog Management System</h1>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setActiveView('list')}
                className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition ${
                  activeView === 'list' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FiList className="w-4 h-4" />
                <span>All Blogs</span>
              </button>
              
              <button
                onClick={() => setActiveView('create')}
                className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition ${
                  activeView === 'create' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FiPlus className="w-4 h-4" />
                <span>Create Blog</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto">
        {activeView === 'list' && <BlogList />}
        {activeView === 'create' && <BlogManagementForm />}
      </div>
    </div>
  );
};

export default BlogManagementExample;

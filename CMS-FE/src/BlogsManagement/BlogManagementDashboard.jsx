import React, { useState } from 'react';
import { FiUpload, FiEye, FiEdit2, FiTrash2, FiSearch, FiPlus , FiXCircle} from 'react-icons/fi';

const BlogManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [blogs, setBlogs] = useState([
    {
      id: 1,
      title: 'Getting Started with Node.js',
      excerpt: 'Learn the fundamentals of Node.js and how to build your first API',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      status: 'published',
      date: '2023-05-15',
      views: 1245
    },
    {
      id: 2,
      title: 'Advanced React Patterns',
      excerpt: 'Master advanced React patterns to build scalable applications',
      coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      status: 'draft',
      date: '2023-06-02',
      views: 0
    },
    {
      id: 3,
      title: 'CSS Grid Complete Guide',
      excerpt: 'Everything you need to know about CSS Grid layout',
      coverImage: 'https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      status: 'published',
      date: '2023-04-28',
      views: 2567
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteBlog = (id) => {
    setBlogs(blogs.filter(blog => blog.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Blog Management</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition ${activeTab === 'upload' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              <FiUpload className="w-5 h-5" />
              <span>Upload Blogs</span>
            </button>
            <button
              onClick={() => setActiveTab('view')}
              className={`px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition ${activeTab === 'view' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              <FiEye className="w-5 h-5" />
              <span>View Uploaded Blogs</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'upload' ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Upload New Blog</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side - Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blog Title</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder="Enter blog title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                    <textarea
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder="Short description of the blog"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                      rows="6"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder="Write your blog content here"
                    />
                  </div>
                </div>
                
                {/* Right Side - Additional Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <FiUpload className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 mb-2">Drag & drop your image here</p>
                        <p className="text-xs text-gray-400 mb-4">or</p>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                          Browse Files
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm">
                        Technology
                        <button className="ml-1.5 text-indigo-600 hover:text-indigo-900">
                          <FiXCircle className="w-4 h-4" />
                        </button>
                      </span>
                      <button className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm hover:bg-gray-200 transition">
                        <FiPlus className="w-3 h-3 mr-1" />
                        Add Tag
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                  Save as Draft
                </button>
                <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center space-x-1">
                  <FiUpload className="w-5 h-5" />
                  <span>Publish Blog</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Uploaded Blogs</h2>
                <div className="relative w-64">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search blogs..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlogs.map(blog => (
                  <div key={blog.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                    <div className="relative h-48 bg-gray-100">
                      <img 
                        src={blog.coverImage} 
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {blog.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-800 mb-1">{blog.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{blog.excerpt}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                        <span>{blog.date}</span>
                        <span>{blog.views} views</span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center space-x-1 transition">
                          <FiEdit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => deleteBlog(blog.id)}
                          className="flex-1 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center space-x-1 transition"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add New Blog Card */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 hover:border-indigo-500 transition cursor-pointer">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                    <FiPlus className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-medium text-gray-800 mb-1">Add New Blog</h3>
                  <p className="text-sm text-gray-500 text-center">Click here to create a new blog post</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManagementDashboard;
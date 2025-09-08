import React, { useState } from 'react';
import { FiUpload, FiCalendar, FiClock, FiTag, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const BlogManagementForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    coverImage: null, // Changed from empty string to null to store File object
    // author: '',
    tags: [],
    categories: [],
    publishedAt: '',
    isPublished: false,
    metaTitle: '',
    metaDescription: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    readTime: 0
  });
  
  const [imagePreview, setImagePreview] = useState(''); // For displaying the preview

  const [tagInput, setTagInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create a preview URL for the image
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
    // Store the file object in formData
    setFormData(prev => ({
      ...prev,
      coverImage: file
    }));
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleCategoryAdd = () => {
    if (categoryInput.trim() && !formData.categories.includes(categoryInput.trim())) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, categoryInput.trim()]
      }));
      setCategoryInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const removeCategory = (categoryToRemove) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat !== categoryToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    
    // Append all form data to FormData object
    Object.keys(formData).forEach(key => {
      if (key === 'coverImage' && formData.coverImage) {
        formDataToSend.append('image', formData.coverImage);
      } else if (Array.isArray(formData[key])) {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else if (formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    });
    
    try {
      const response = await fetch('https://dtg-universal-cms.onrender.com/api/blogs', {
        method: 'POST',
        body: formDataToSend,
        // Don't set Content-Type header - let the browser set it with the correct boundary
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      console.log('Success:', data);
      // Handle success (show toast, redirect, etc.)
      
      // Clean up the object URL to avoid memory leaks
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      
    } catch (error) {
      console.error('Error:', error);
      // Handle error (show error message to user)
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <h1 className="text-2xl font-bold">Create New Blog Post</h1>
            <p className="opacity-90">Fill in the details below to publish a new blog post</p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Enter blog title"
                    required
                  />
                </div>
                
                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug*</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Enter URL slug"
                    required
                  />
                </div>
                
                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt*</label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Short description of the blog post"
                    required
                  />
                </div>
                
                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content*</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows="8"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Write your blog content here (HTML supported)"
                    required
                  />
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      name="coverImage"
                      value={formData.coverImage}
                      onChange={handleChange}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder="Image URL or upload below"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="flex flex-col items-center px-4 py-2 bg-white text-gray-700 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition">
                      <FiUpload className="w-6 h-6 mb-1" />
                      <span className="text-sm">Click to upload or drag and drop</span>
                      <span className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  {formData.coverImage && (
                    <div className="mt-2">
                      <div className="relative group">
                        <img 
                          src={imagePreview || formData.coverImage} 
                          alt="Preview" 
                          className="h-32 w-full object-cover rounded-lg border border-gray-200" 
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove image"
                        >
                          <FiXCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Author */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author*</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Enter author ID"
                    required
                  />
                </div> */}
                
                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder="Add tag"
                    />
                    <button
                      type="button"
                      onClick={handleTagAdd}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1.5 text-indigo-600 hover:text-indigo-900"
                        >
                          <FiXCircle className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder="Add category"
                    />
                    <button
                      type="button"
                      onClick={handleCategoryAdd}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.categories.map(category => (
                      <span key={category} className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm">
                        {category}
                        <button
                          type="button"
                          onClick={() => removeCategory(category)}
                          className="ml-1.5 text-purple-600 hover:text-purple-900"
                        >
                          <FiXCircle className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Publish Settings */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-700">Publish Status</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isPublished"
                        checked={formData.isPublished}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        {formData.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </label>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="text-gray-500 w-5 h-5" />
                      <input
                        type="datetime-local"
                        name="publishedAt"
                        value={formData.publishedAt}
                        onChange={handleChange}
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <FiClock className="text-gray-500 w-5 h-5" />
                      <input
                        type="number"
                        name="readTime"
                        value={formData.readTime}
                        onChange={handleChange}
                        min="1"
                        className="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="Minutes"
                      />
                      <span className="text-sm text-gray-500">minutes read</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* SEO Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-3">SEO Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Meta title for SEO"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Meta description for SEO"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OG Title</label>
                  <input
                    type="text"
                    name="ogTitle"
                    value={formData.ogTitle}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Open Graph title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
                  <textarea
                    name="ogDescription"
                    value={formData.ogDescription}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Open Graph description"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
                  <input
                    type="text"
                    name="ogImage"
                    value={formData.ogImage}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Open Graph image URL"
                  />
                </div>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Save Draft
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center space-x-1"
              >
                <FiCheckCircle className="w-5 h-5" />
                <span>Publish Blog</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlogManagementForm;
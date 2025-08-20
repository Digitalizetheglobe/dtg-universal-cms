import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiUpload, FiCalendar, FiClock, FiTag, FiCheckCircle, FiXCircle, FiArrowLeft, FiSave } from 'react-icons/fi';
import RichTextEditor from './RichTextEditor';

const BlogEditForm = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    coverImage: null,
    uploadImage: null,
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
  
  const [imagePreview, setImagePreview] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');

  // Check if this is edit mode
  const isEditMode = !!blogId;

  // Fetch blog data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchBlogData();
    }
  }, [blogId]);

  const fetchBlogData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/blogs/${blogId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog data');
      }
      
      const blog = await response.json();
      
      // Parse tags and categories from string arrays
      const parseArrayField = (field) => {
        try {
          if (Array.isArray(field)) {
            return field.map(item => {
              try {
                return JSON.parse(item);
              } catch {
                return item;
              }
            }).flat().filter(item => item && item !== '[]');
          }
          return [];
        } catch {
          return [];
        }
      };

      setFormData({
        title: blog.title || '',
        slug: blog.slug || '',
        content: blog.content || '',
        excerpt: blog.excerpt || '',
        coverImage: null,
        uploadImage: null,
        tags: parseArrayField(blog.tags),
        categories: parseArrayField(blog.categories),
        publishedAt: blog.publishedAt ? new Date(blog.publishedAt).toISOString().split('T')[0] : '',
        isPublished: blog.isPublished || false,
        metaTitle: blog.metaTitle || '',
        metaDescription: blog.metaDescription || '',
        ogTitle: blog.ogTitle || '',
        ogDescription: blog.ogDescription || '',
        ogImage: blog.ogImage || '',
        readTime: blog.readTime || 0
      });

      // Set image preview if blog has an image
      if (blog.coverImage || blog.uploadImage) {
        setImagePreview(blog.coverImage || blog.uploadImage);
      }
      
    } catch (err) {
      setError('Failed to load blog data: ' + err.message);
      console.error('Error fetching blog:', err);
    } finally {
      setLoading(false);
    }
  };

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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    // Create a preview URL for the image
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
    // Store the file object in formData
    setFormData(prev => ({
      ...prev,
      coverImage: file,
      uploadImage: file
    }));

    setError('');
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
    
    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.slug.trim()) {
      setError('Slug is required');
      return;
    }
    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }
    if (!formData.excerpt.trim()) {
      setError('Excerpt is required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const formDataToSend = new FormData();
      
      // Append all form data to FormData object
      Object.keys(formData).forEach(key => {
        if (key === 'coverImage' && formData.coverImage) {
          formDataToSend.append('image', formData.coverImage);
        } else if (key === 'uploadImage' && formData.uploadImage) {
          formDataToSend.append('uploadImage', formData.uploadImage);
        } else if (Array.isArray(formData[key])) {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      let response;
      if (isEditMode) {
        // Update existing blog
        response = await fetch(`http://localhost:5000/api/blogs/${blogId}`, {
          method: 'PUT',
          body: formDataToSend,
        });
      } else {
        // Create new blog
        response = await fetch('http://localhost:5000/api/blogs', {
          method: 'POST',
          body: formDataToSend,
        });
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      setSuccess(isEditMode ? 'Blog updated successfully!' : 'Blog created successfully!');
      
      // Clean up the object URL to avoid memory leaks
      if (imagePreview && formData.coverImage) {
        URL.revokeObjectURL(imagePreview);
      }
      
      // Redirect to blog list after a short delay
      setTimeout(() => {
        navigate('/blog-management/list');
      }, 2000);
      
    } catch (error) {
      setError(error.message);
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}
                </h1>
                <p className="opacity-90 mt-1">
                  {isEditMode ? 'Update your blog post details' : 'Fill in the details below to publish a new blog post'}
                </p>
              </div>
              <button
                onClick={() => navigate('/blog-management/list')}
                className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span>Back to List</span>
              </button>
            </div>
          </div>
          
          {/* Error/Success Messages */}
          {error && (
            <div className="m-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2">
              <FiXCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="m-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center space-x-2">
              <FiCheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
          )}
          
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
                   <RichTextEditor
                     value={formData.content}
                     onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                     placeholder="Write your blog content here... Use the toolbar above to format your text with bold, italic, headings, lists, and more!"
                   />
                 </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                  <div className="space-y-3">
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setFormData(prev => ({ ...prev, coverImage: null, uploadImage: null }));
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                        >
                          <FiXCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    {/* Upload Button */}
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
                </div>

                {/* Publish Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">Publish Settings</h3>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={formData.isPublished}
                      onChange={handleChange}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label className="text-sm font-medium text-gray-700">Publish immediately</label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                    <input
                      type="date"
                      name="publishedAt"
                      value={formData.publishedAt}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Read Time (minutes)</label>
                    <input
                      type="number"
                      name="readTime"
                      value={formData.readTime}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="Add a tag"
                      />
                      <button
                        type="button"
                        onClick={handleTagAdd}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        Add
                      </button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm"
                          >
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
                    )}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={categoryInput}
                        onChange={(e) => setCategoryInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleCategoryAdd())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="Add a category"
                      />
                      <button
                        type="button"
                        onClick={handleCategoryAdd}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                      >
                        Add
                      </button>
                    </div>
                    {formData.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.categories.map((category, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm"
                          >
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
                    )}
                  </div>
                </div>

                {/* SEO Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">SEO Settings</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                    <input
                      type="text"
                      name="metaTitle"
                      value={formData.metaTitle}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder="SEO meta title"
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
                      placeholder="SEO meta description"
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
                    <input
                      type="url"
                      name="ogImage"
                      value={formData.ogImage}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder="Open Graph image URL"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate('/blog-management/list')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition flex items-center space-x-1"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-5 h-5" />
                    <span>{isEditMode ? 'Update Blog' : 'Publish Blog'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlogEditForm;

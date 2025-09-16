import React, { useState, useEffect } from 'react';
import { FiEye, FiEdit2, FiTrash2, FiSearch, FiCalendar, FiClock, FiTag, FiHeart, FiMessageCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const BlogList = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch blogs from API
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.harekrishnavidya.org/api/blogs/');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setBlogs(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Filter blogs based on search term and status
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'published' && blog.isPublished) ||
                         (filterStatus === 'draft' && !blog.isPublished);
    
    return matchesSearch && matchesStatus;
  });

  // Handle blog deletion
  const handleDelete = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        const response = await fetch(`https://api.harekrishnavidya.org/api/blogs/${blogId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setBlogs(blogs.filter(blog => blog._id !== blogId));
          alert('Blog deleted successfully!');
        } else {
          throw new Error('Failed to delete blog');
        }
      } catch (err) {
        console.error('Error deleting blog:', err);
        alert('Failed to delete blog');
      }
    }
  };

  // Handle blog edit
  const handleEdit = (blogId) => {
    navigate(`/blog-management/edit/${blogId}`);
  };

  // Handle blog view
  const handleView = (blogId) => {
    navigate(`/blog-management/view/${blogId}`);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <h1 className="text-3xl font-bold">Blog Management</h1>
            <p className="opacity-90 mt-2">Manage and view all your blog posts</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search blogs..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              {filteredBlogs.length} of {blogs.length} blogs
            </div>
          </div>
        </div>

        {/* Blogs Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <FiSearch className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No blogs found</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No blogs have been created yet'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => {
              const tags = parseArrayField(blog.tags);
              const categories = parseArrayField(blog.categories);
              
              return (
                <div key={blog._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {/* Blog Image */}
                  <div className="relative h-48 bg-gray-200">
                    {blog.coverImage || blog.uploadImage ? (
                      <img
                        src={blog.coverImage || blog.uploadImage}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="hidden absolute inset-0 bg-gray-200 items-center justify-center">
                      <FiEye className="w-12 h-12 text-gray-400" />
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        blog.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {blog.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>

                                         {/* Action Buttons */}
                     <div className="absolute top-3 right-3 flex space-x-2">
                       <button 
                         className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition hover:text-green-600"
                         onClick={() => handleView(blog._id)}
                         title="View Blog"
                       >
                         <FiEye className="w-4 h-4" />
                       </button>
                       <button 
                         className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition hover:text-blue-600"
                         onClick={() => handleEdit(blog._id)}
                         title="Edit Blog"
                       >
                         <FiEdit2 className="w-4 h-4" />
                       </button>
                       <button 
                         className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition hover:text-red-600"
                         onClick={() => handleDelete(blog._id)}
                         title="Delete Blog"
                       >
                         <FiTrash2 className="w-4 h-4" />
                       </button>
                     </div>
                  </div>

                  {/* Blog Content */}
                  <div className="p-6">
                                         {/* Title */}
                     <h3 
                       className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 cursor-pointer hover:text-indigo-600 transition"
                       onClick={() => handleView(blog._id)}
                       title="Click to view full blog"
                     >
                       {blog.title}
                     </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {blog.excerpt}
                    </p>

                    {/* Meta Information */}
                    <div className="space-y-3 mb-4">
                      {/* Date and Read Time */}
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <FiCalendar className="w-4 h-4 mr-1" />
                          {formatDate(blog.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <FiClock className="w-4 h-4 mr-1" />
                          {blog.readTime || 0} min read
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <FiEye className="w-4 h-4 mr-1" />
                          {blog.views || 0} views
                        </div>
                        <div className="flex items-center">
                          <FiHeart className="w-4 h-4 mr-1" />
                          {blog.likes || 0} likes
                        </div>
                        <div className="flex items-center">
                          <FiMessageCircle className="w-4 h-4 mr-1" />
                          {blog.commentsCount || 0} comments
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center mb-2">
                          <FiTag className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-500">Tags:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Categories */}
                    {categories.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {categories.slice(0, 2).map((category, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                            >
                              {category}
                            </span>
                          ))}
                          {categories.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{categories.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Slug */}
                    <div className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                      /{blog.slug}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;

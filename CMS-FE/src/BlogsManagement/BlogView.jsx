import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiClock, FiTag, FiEye, FiHeart, FiMessageCircle, FiEdit2 } from 'react-icons/fi';

const BlogView = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogData();
  }, [blogId]);

  const fetchBlogData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.harekrishnavidya.org/api/blogs/${blogId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog data');
      }
      
      const data = await response.json();
      console.log(data)
      setBlog(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching blog:', err);
    } finally {
      setLoading(false);
    }
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

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
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
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            Blog not found
          </div>
        </div>
      </div>
    );
  }

  const tags = parseArrayField(blog.tags);
  const categories = parseArrayField(blog.categories);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/blog-management/list')}
                className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span>Back to List</span>
              </button>
              <button
                onClick={() => navigate(`/blog-management/edit/${blogId}`)}
                className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition"
              >
                <FiEdit2 className="w-4 h-4" />
                <span>Edit Blog</span>
              </button>
            </div>
          </div>
        </div>

        {/* Blog Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Cover Image */}
          {(blog.coverImage || blog.uploadImage) && (
            <div className="relative h-64 md:h-96">
              <img
                src={blog.coverImage || blog.uploadImage}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  blog.isPublished 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {blog.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
          )}

          {/* Blog Header */}
          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {blog.title}
            </h1>
            
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {blog.excerpt}
            </p>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center">
                <FiCalendar className="w-4 h-4 mr-1" />
                {formatDate(blog.createdAt)}
              </div>
              <div className="flex items-center">
                <FiClock className="w-4 h-4 mr-1" />
                {blog.readTime || 0} min read
              </div>
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

            {/* Tags and Categories */}
            {(tags.length > 0 || categories.length > 0) && (
              <div className="mb-6 space-y-3">
                {tags.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <FiTag className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Tags:</span>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Blog Content */}
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-700 leading-relaxed blog-rich-content"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>

            {/* SEO Information */}
            {(blog.metaTitle || blog.metaDescription || blog.ogTitle || blog.ogDescription) && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">SEO Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {blog.metaTitle && (
                    <div>
                      <span className="font-medium text-gray-600">Meta Title:</span>
                      <p className="text-gray-800 mt-1">{blog.metaTitle}</p>
                    </div>
                  )}
                  {blog.metaDescription && (
                    <div>
                      <span className="font-medium text-gray-600">Meta Description:</span>
                      <p className="text-gray-800 mt-1">{blog.metaDescription}</p>
                    </div>
                  )}
                  {blog.ogTitle && (
                    <div>
                      <span className="font-medium text-gray-600">OG Title:</span>
                      <p className="text-gray-800 mt-1">{blog.ogTitle}</p>
                    </div>
                  )}
                  {blog.ogDescription && (
                    <div>
                      <span className="font-medium text-gray-600">OG Description:</span>
                      <p className="text-gray-800 mt-1">{blog.ogDescription}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Blog URL */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm">
                <span className="font-medium text-gray-600">Blog URL:</span>
                <div className="mt-1 p-2 bg-gray-100 rounded text-gray-800 font-mono text-xs break-all">
                  /{blog.slug}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogView;

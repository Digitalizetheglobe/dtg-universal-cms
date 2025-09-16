import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiUpload,
  FiCalendar,
  FiClock,
  FiTag,
  FiCheckCircle,
  FiXCircle,
  FiArrowLeft,
  FiSave,
} from "react-icons/fi";
import RichTextEditor from "./RichTextEditor";

const BlogEditForm = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    uploadImage: null,
    coverImage1: null, // ✅ add
    coverImage2: null, // ✅ add
    tags: [],
    categories: [],
    publishedAt: "",
    isPublished: false,
    metaTitle: "",
    metaDescription: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    readTime: 0,
  });

  const [imagePreview1, setImagePreview1] = useState("");
  const [imagePreview2, setImagePreview2] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");

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
      const response = await fetch(`https://api.harekrishnavidya.org/api/blogs/${blogId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch blog data");
      }

      const blog = await response.json();

      // Parse tags and categories from string arrays
      const parseArrayField = (field) => {
        try {
          if (Array.isArray(field)) {
            return field
              .map((item) => {
                try {
                  return JSON.parse(item);
                } catch {
                  return item;
                }
              })
              .flat()
              .filter((item) => item && item !== "[]");
          }
          return [];
        } catch {
          return [];
        }
      };

      setFormData({
        title: blog.title || "",
        slug: blog.slug || "",
        content: blog.content || "",
        excerpt: blog.excerpt || "",
        uploadImage: null, // We'll use preview only
        coverImage1: null,
        coverImage2: null,
        tags: parseArrayField(blog.tags),
        categories: parseArrayField(blog.categories),
        publishedAt: blog.publishedAt
          ? new Date(blog.publishedAt).toISOString().split("T")[0]
          : "",
        isPublished: blog.isPublished || false,
        metaTitle: blog.metaTitle || "",
        metaDescription: blog.metaDescription || "",
        ogTitle: blog.ogTitle || "",
        ogDescription: blog.ogDescription || "",
        ogImage: blog.ogImage || "",
        readTime: blog.readTime || 0,
      });

      // Set image preview if blog has an image
      if (blog.uploadImage) setImagePreview(blog.uploadImage);
      if (blog.coverImage1) setImagePreview1(blog.coverImage1);
      if (blog.coverImage2) setImagePreview2(blog.coverImage2);
    } catch (err) {
      setError("Failed to load blog data: " + err.message);
      console.error("Error fetching blog:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // console.log(name,value)
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    // Create a preview URL for the image
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Store the file object in formData
    setFormData((prev) => ({
      ...prev,
      coverImage1: file,

      coverImage2: file,
      uploadImage: file,
    }));

    setError("");
  };
  const handleCoverImage1Upload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file for Cover Image 1");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Cover Image 1 size should be less than 5MB");
      return;
    }

    setImagePreview1(URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      coverImage1: file,
    }));

    setError("");
  };

  const handleCoverImage2Upload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file for Cover Image 2");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Cover Image 2 size should be less than 5MB");
      return;
    }

    setImagePreview2(URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      coverImage2: file,
    }));

    setError("");
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleCategoryAdd = () => {
    if (
      categoryInput.trim() &&
      !formData.categories.includes(categoryInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, categoryInput.trim()],
      }));
      setCategoryInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const removeCategory = (categoryToRemove) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((cat) => cat !== categoryToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) return setError("Title is required");
    if (!formData.slug.trim()) return setError("Slug is required");
    if (!formData.content.trim()) return setError("Content is required");
    if (!formData.excerpt.trim()) return setError("Excerpt is required");

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const formDataToSend = new FormData();

      // Append all fields
      formDataToSend.append("title", formData.title);
      formDataToSend.append("slug", formData.slug);
      formDataToSend.append("excerpt", formData.excerpt);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("metaTitle", formData.metaTitle);
      formDataToSend.append("metaDescription", formData.metaDescription);
      formDataToSend.append("ogTitle", formData.ogTitle);
      formDataToSend.append("ogDescription", formData.ogDescription);
      formDataToSend.append("ogImage", formData.ogImage);
      formDataToSend.append("publishedAt", formData.publishedAt);
      formDataToSend.append("isPublished", formData.isPublished);
      formDataToSend.append("readTime", formData.readTime);

      // Append array fields as JSON strings
      formDataToSend.append("tags", JSON.stringify(formData.tags));
      formDataToSend.append("categories", JSON.stringify(formData.categories));

      // Append image files if present
      if (formData.uploadImage)
        formDataToSend.append("uploadImage", formData.uploadImage);
      if (formData.coverImage1)
        formDataToSend.append("coverImage1", formData.coverImage1);
      if (formData.coverImage2)
        formDataToSend.append("coverImage2", formData.coverImage2);

      let response;

      if (isEditMode) {
        response = await fetch(`https://api.harekrishnavidya.org/api/blogs/${blogId}`, {
          method: "PUT",
          body: formDataToSend,
        });
      } else {
        response = await fetch(`https://api.harekrishnavidya.org/api/blogs`, {
          method: "POST",
          body: formDataToSend,
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSuccess(
        isEditMode ? "Blog updated successfully!" : "Blog created successfully!"
      );
      setTimeout(() => navigate("/blog-management/list"), 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 rounded-full border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="overflow-hidden bg-white shadow-lg rounded-xl">
          {/* Header */}
          <div className="p-6 text-white bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {isEditMode ? "Edit Blog Post" : "Create New Blog Post"}
                </h1>
                <p className="mt-1 opacity-90">
                  {isEditMode
                    ? "Update your blog post details"
                    : "Fill in the details below to publish a new blog post"}
                </p>
              </div>
              <button
                onClick={() => navigate("/blog-management/list")}
                className="flex items-center px-4 py-2 space-x-2 transition bg-white rounded-lg bg-opacity-20 hover:bg-opacity-30"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span>Back to List</span>
              </button>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center p-4 m-6 space-x-2 text-red-700 bg-red-100 border border-red-400 rounded-lg">
              <FiXCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center p-4 m-6 space-x-2 text-green-700 bg-green-100 border border-green-400 rounded-lg">
              <FiCheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Title*
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter blog title"
                    required
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Slug*
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter URL slug"
                    required
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Excerpt*
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Short description of the blog post"
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Content*
                  </label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(html) =>
                      setFormData((prev) => ({ ...prev, content: html }))
                    }
                    placeholder="Write your blog content here... Use the toolbar above to format your text with bold, italic, headings, lists, and more!"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Upload Image
                  </label>
                  <div className="space-y-3">
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="object-cover w-full h-48 border rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview("");
                            setFormData((prev) => ({
                              ...prev,
                              coverImage1: null,
                              coverImage2: null,
                              uploadImage: null,
                            }));
                          }}
                          className="absolute p-1 text-white transition bg-red-500 rounded-full top-2 right-2 hover:bg-red-600"
                        >
                          <FiXCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Upload Button */}
                    <label className="flex flex-col items-center px-4 py-2 text-gray-700 transition bg-white border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                      <FiUpload className="w-6 h-6 mb-1" />
                      <span className="text-sm">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Cover Image 1
                  </label>
                  <div className="space-y-3">
                    {imagePreview1 && (
                      <div className="relative">
                        <img
                          src={imagePreview1}
                          alt="Preview"
                          className="object-cover w-full h-48 border rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview1("");
                            setFormData((prev) => ({
                              ...prev,
                              coverImage1: null,
                            }));
                          }}
                          className="absolute p-1 text-white transition bg-red-500 rounded-full top-2 right-2 hover:bg-red-600"
                        >
                          <FiXCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <label className="flex flex-col items-center px-4 py-2 text-gray-700 transition bg-white border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                      <FiUpload className="w-6 h-6 mb-1" />
                      <span className="text-sm">
                        Click to upload Cover Image 1
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleCoverImage1Upload}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Cover Image 2
                  </label>
                  <div className="space-y-3">
                    {imagePreview2 && (
                      <div className="relative">
                        <img
                          src={imagePreview2}
                          alt="Preview"
                          className="object-cover w-full h-48 border rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview2("");
                            setFormData((prev) => ({
                              ...prev,
                              coverImage2: null,
                            }));
                          }}
                          className="absolute p-1 text-white transition bg-red-500 rounded-full top-2 right-2 hover:bg-red-600"
                        >
                          <FiXCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <label className="flex flex-col items-center px-4 py-2 text-gray-700 transition bg-white border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                      <FiUpload className="w-6 h-6 mb-1" />
                      <span className="text-sm">
                        Click to upload Cover Image 2
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleCoverImage2Upload}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Cover Image */}

                {/* Publish Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">
                    Publish Settings
                  </h3>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={formData.isPublished}
                      onChange={handleChange}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Publish immediately
                    </label>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Publish Date
                    </label>
                    <input
                      type="date"
                      name="publishedAt"
                      value={formData.publishedAt}
                      onChange={handleChange}
                      className="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Read Time (minutes)
                    </label>
                    <input
                      type="number"
                      name="readTime"
                      value={formData.readTime}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Tags
                  </label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleTagAdd())
                        }
                        className="flex-1 px-3 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Add a tag"
                      />
                      <button
                        type="button"
                        onClick={handleTagAdd}
                        className="px-4 py-2 text-white transition bg-indigo-600 rounded-lg hover:bg-indigo-700"
                      >
                        Add
                      </button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 text-sm text-indigo-800 bg-indigo-100 rounded-full"
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
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Categories
                  </label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={categoryInput}
                        onChange={(e) => setCategoryInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleCategoryAdd())
                        }
                        className="flex-1 px-3 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Add a category"
                      />
                      <button
                        type="button"
                        onClick={handleCategoryAdd}
                        className="px-4 py-2 text-white transition bg-purple-600 rounded-lg hover:bg-purple-700"
                      >
                        Add
                      </button>
                    </div>
                    {formData.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.categories.map((category, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 text-sm text-purple-800 bg-purple-100 rounded-full"
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
                  <h3 className="text-lg font-medium text-gray-800">
                    SEO Settings
                  </h3>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      name="metaTitle"
                      value={formData.metaTitle}
                      onChange={handleChange}
                      className="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="SEO meta title"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Meta Description
                    </label>
                    <textarea
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={handleChange}
                      rows="2"
                      className="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="SEO meta description"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      OG Title
                    </label>
                    <input
                      type="text"
                      name="ogTitle"
                      value={formData.ogTitle}
                      onChange={handleChange}
                      className="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Open Graph title"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      OG Description
                    </label>
                    <textarea
                      name="ogDescription"
                      value={formData.ogDescription}
                      onChange={handleChange}
                      rows="2"
                      className="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Open Graph description"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      OG Image URL
                    </label>
                    <input
                      type="url"
                      name="ogImage"
                      value={formData.ogImage}
                      onChange={handleChange}
                      className="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Open Graph image URL"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end pt-4 space-x-3 border-t">
              <button
                type="button"
                onClick={() => navigate("/blog-management/list")}
                className="px-6 py-2 text-gray-700 transition border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center px-6 py-2 space-x-1 text-white transition bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-5 h-5" />
                    <span>{isEditMode ? "Update Blog" : "Publish Blog"}</span>
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

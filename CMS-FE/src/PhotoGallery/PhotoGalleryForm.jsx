import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaSave, FaImage, FaInfoCircle } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

const PhotoGalleryForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        imageTitle: '',
        description: '',
        category: '',
        publishDate: new Date().toISOString().split('T')[0],
        imageFile: null,
        featured: false
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [error, setError] = useState('');

    const categories = [
        'Events',
        'Campaigns',
        'Education',
        'Celebrations',
        'Volunteers'
    ];

    useEffect(() => {
        if (isEditMode) {
            fetchPhotoDetails();
        }
    }, [id]);

    const fetchPhotoDetails = async () => {
        try {
            setFetchLoading(true);
            const response = await fetch(`https://api.harekrishnavidya.org/api/photo-gallery/${id}`);

            if (!response.ok) {
                throw new Error('Failed to fetch photo details');
            }

            const result = await response.json();
            const photo = result.data;

            setFormData({
                imageTitle: photo.imageTitle,
                description: photo.description || '',
                category: photo.category,
                publishDate: photo.publishDate ? photo.publishDate.split('T')[0] : new Date().toISOString().split('T')[0],
                featured: photo.featured,
                imageFile: null // Reset file input
            });

            // Set preview with full URL
            setImagePreview(photo.imageUrl);
        } catch (err) {
            console.error('Error fetching photo:', err);
            setError('Failed to load photo details');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should not exceed 5MB');
                return;
            }

            setFormData(prev => ({
                ...prev,
                imageFile: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation based on mode
        if (!formData.imageTitle.trim()) {
            setError('Image title is required');
            setLoading(false);
            return;
        }

        if (!formData.category) {
            setError('Please select a category');
            setLoading(false);
            return;
        }

        // In edit mode, image is optional (can keep existing)
        // In create mode, image is required
        if (!isEditMode && !formData.imageFile) {
            setError('Please select an image to upload');
            setLoading(false);
            return;
        }

        try {
            const submitData = new FormData();
            submitData.append('imageTitle', formData.imageTitle);
            submitData.append('description', formData.description);
            submitData.append('category', formData.category);
            submitData.append('publishDate', formData.publishDate);
            submitData.append('featured', formData.featured);

            if (formData.imageFile) {
                submitData.append('image', formData.imageFile);
            }

            const url = isEditMode
                ? `https://api.harekrishnavidya.org/api/photo-gallery/${id}`
                : 'https://api.harekrishnavidya.org/api/photo-gallery';

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                body: submitData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'upload'} image`);
            }

            const result = await response.json();
            console.log(`Image ${isEditMode ? 'updated' : 'uploaded'} successfully:`, result);

            // Navigate back to gallery list
            navigate('/photo-gallery');
        } catch (err) {
            console.error('Error saving image:', err);
            setError(err.message || `Failed to ${isEditMode ? 'update' : 'upload'} image. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/photo-gallery')}
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <FaArrowLeft className="text-xl" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <FaImage className="text-green-500" />
                            {isEditMode ? 'Edit Photo' : 'Add New Photo'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {isEditMode ? 'Update photo details' : 'Add a new photo to the gallery'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/photo-gallery')}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaSave />
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Basic Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FaInfoCircle className="text-orange-500" />
                                <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">Image title and description</p>

                            <div className="space-y-4">
                                {/* Image Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Image Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="imageTitle"
                                        value={formData.imageTitle}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Annual Day Celebration 2024"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Brief description of the photo..."
                                        rows="4"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
                                    />
                                </div>

                                {/* Category and Publish Date */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                            required
                                        >
                                            <option value="">Select category</option>
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Publish Date
                                        </label>
                                        <input
                                            type="date"
                                            name="publishDate"
                                            value={formData.publishDate}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FaImage className="text-orange-500" />
                                <h2 className="text-lg font-semibold text-gray-800">Image Upload</h2>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">
                                {isEditMode ? 'Change image file (Leave empty to keep current)' : 'Upload image file (Max 5MB)'}
                            </p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image File {isEditMode ? '' : <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                    required={!isEditMode}
                                />
                                <p className="text-xs text-gray-500 mt-2">Supports: JPG, PNG, GIF, WebP (Max 5MB)</p>
                            </div>
                        </div>

                        {/* Featured Toggle */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-800">Featured Photo</h3>
                                    <p className="text-xs text-gray-500 mt-1">Show this photo prominently at the top of the gallery</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        checked={formData.featured}
                                        onChange={handleInputChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Preview */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Image Preview</h2>
                            <p className="text-sm text-gray-500 mb-4">How it will appear in the gallery</p>

                            <div className="space-y-4">
                                {/* Image Preview */}
                                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center relative group">
                                    {imagePreview ? (
                                        <>
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            {formData.featured && (
                                                <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded shadow-sm">
                                                    Featured
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <FaImage className="text-5xl mx-auto mb-2" />
                                            <p className="text-sm">No image selected</p>
                                        </div>
                                    )}
                                </div>

                                {/* Title Preview */}
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-lg">
                                        {formData.imageTitle || 'Image Title'}
                                    </h3>
                                    {formData.category && (
                                        <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                            {formData.category}
                                        </span>
                                    )}
                                </div>

                                {/* Description Preview */}
                                {formData.description && (
                                    <p className="text-sm text-gray-600">
                                        {formData.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhotoGalleryForm;

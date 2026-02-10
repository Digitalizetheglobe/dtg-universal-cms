import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaSave, FaVideo, FaInfoCircle, FaLink, FaImage as FaThumbnail } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

const VideoGalleryForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        videoTitle: '',
        description: '',
        category: '',
        videoUrl: '',
        thumbnailUrl: '',
        duration: '',
        publishDate: new Date().toISOString().split('T')[0],
        featured: false
    });

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [error, setError] = useState('');

    const categories = [
        'Events',
        'Campaigns',
        'Testimonials',
        'Documentaries',
        'Updates'
    ];

    useEffect(() => {
        if (isEditMode) {
            fetchVideoDetails();
        }
    }, [id]);

    const fetchVideoDetails = async () => {
        try {
            setFetchLoading(true);
            const response = await fetch(`https://api.harekrishnavidya.org/api/video-gallery/${id}`);

            if (!response.ok) {
                throw new Error('Failed to fetch video details');
            }

            const result = await response.json();
            const video = result.data;

            setFormData({
                videoTitle: video.videoTitle,
                description: video.description || '',
                category: video.category,
                videoUrl: video.videoUrl,
                thumbnailUrl: video.thumbnailUrl || '',
                duration: video.duration || '',
                publishDate: video.publishDate ? video.publishDate.split('T')[0] : new Date().toISOString().split('T')[0],
                featured: video.featured
            });
        } catch (err) {
            console.error('Error fetching video:', err);
            setError('Failed to load video details');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation
        if (!formData.videoTitle.trim()) {
            setError('Video title is required');
            setLoading(false);
            return;
        }

        if (!formData.category) {
            setError('Please select a category');
            setLoading(false);
            return;
        }

        if (!formData.videoUrl.trim()) {
            setError('Video URL is required');
            setLoading(false);
            return;
        }

        try {
            const url = isEditMode
                ? `https://api.harekrishnavidya.org/api/video-gallery/${id}`
                : 'https://api.harekrishnavidya.org/api/video-gallery';

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'add'} video`);
            }

            const result = await response.json();
            console.log(`Video ${isEditMode ? 'updated' : 'added'} successfully:`, result);

            // Navigate back to gallery list
            navigate('/video-gallery');
        } catch (err) {
            console.error('Error saving video:', err);
            setError(err.message || `Failed to ${isEditMode ? 'update' : 'add'} video. Please try again.`);
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
                        onClick={() => navigate('/video-gallery')}
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <FaArrowLeft className="text-xl" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <FaVideo className="text-red-500" />
                            {isEditMode ? 'Edit Video' : 'Add New Video'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {isEditMode ? 'Update video details' : 'Add a new video to the gallery'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/video-gallery')}
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
                            <p className="text-sm text-gray-500 mb-6">Video title and description</p>

                            <div className="space-y-4">
                                {/* Video Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Video Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="videoTitle"
                                        value={formData.videoTitle}
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
                                        placeholder="Brief description of the video..."
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

                        {/* Video URL */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FaLink className="text-orange-500" />
                                <h2 className="text-lg font-semibold text-gray-800">Video URL</h2>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">YouTube or Vimeo video link</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Video URL <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        name="videoUrl"
                                        value={formData.videoUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                    <p className="text-xs text-orange-500 mt-2">Supports YouTube and Vimeo URLs</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Duration
                                        </label>
                                        <input
                                            type="text"
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 12:45"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            View Count
                                        </label>
                                        <input
                                            type="text"
                                            value="0"
                                            disabled
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Thumbnail */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FaThumbnail className="text-orange-500" />
                                <h2 className="text-lg font-semibold text-gray-800">Thumbnail</h2>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">Custom thumbnail image for the video</p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Thumbnail URL
                                </label>
                                <input
                                    type="url"
                                    name="thumbnailUrl"
                                    value={formData.thumbnailUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-2">Leave empty to use the video's default thumbnail</p>
                            </div>
                        </div>

                        {/* Featured Toggle */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-800">Featured Video</h3>
                                    <p className="text-xs text-gray-500 mt-1">Show this video prominently at the top of the gallery</p>
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
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Video Preview</h2>
                            <p className="text-sm text-gray-500 mb-4">How it will appear in the gallery</p>

                            <div className="space-y-4">
                                {/* Video Preview */}
                                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center relative">
                                    {formData.thumbnailUrl ? (
                                        <>
                                            <img
                                                src={formData.thumbnailUrl}
                                                alt="Thumbnail Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                                                    <FaVideo className="text-3xl text-red-500 ml-1" />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <FaVideo className="text-5xl mx-auto mb-2" />
                                            <p className="text-sm">Video Title</p>
                                            {formData.duration && (
                                                <p className="text-xs mt-1">⏱️ {formData.duration}</p>
                                            )}
                                        </div>
                                    )}
                                    {formData.featured && (
                                        <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded shadow-sm">
                                            ⭐ Featured
                                        </div>
                                    )}
                                    {formData.duration && formData.thumbnailUrl && (
                                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs font-medium px-2 py-1 rounded">
                                            {formData.duration}
                                        </div>
                                    )}
                                </div>

                                {/* Title Preview */}
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-lg">
                                        {formData.videoTitle || 'Video Title'}
                                    </h3>
                                    {formData.category && (
                                        <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
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

export default VideoGalleryForm;

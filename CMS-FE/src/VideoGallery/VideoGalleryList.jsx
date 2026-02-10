import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaVideo, FaPlay } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const VideoGalleryList = () => {
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [stats, setStats] = useState({
        totalVideos: 0,
        featuredVideos: 0,
        totalViews: 0,
        totalCategories: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState({
        category: '',
        featured: ''
    });

    const categories = [
        'Events',
        'Campaigns',
        'Festivals',
        'Community Service',
        'Temple Activities',
        'Other'
    ];

    useEffect(() => {
        fetchVideos();
        fetchStats();
    }, [filter]);

    const fetchStats = async () => {
        try {
            const response = await fetch('https://api.harekrishnavidya.org/api/video-gallery/stats');
            if (!response.ok) throw new Error('Failed to fetch stats');
            const result = await response.json();
            setStats(result.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filter.category) queryParams.append('category', filter.category);
            if (filter.featured) queryParams.append('featured', filter.featured);

            const response = await fetch(`https://api.harekrishnavidya.org/api/video-gallery?${queryParams}`);
            if (!response.ok) throw new Error('Failed to fetch videos');

            const data = await response.json();
            setVideos(data.data || []);
        } catch (err) {
            console.error('Error fetching videos:', err);
            setError('Failed to load videos');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this video?')) return;

        try {
            const response = await fetch(`https://api.harekrishnavidya.org/api/video-gallery/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete video');

            setVideos(videos.filter(video => video._id !== id));
            fetchStats(); // Refresh stats after deletion
        } catch (err) {
            console.error('Error deleting video:', err);
            alert('Failed to delete video');
        }
    };

    const getVideoThumbnail = (video) => {
        if (video.thumbnailUrl) return video.thumbnailUrl;

        // Extract YouTube video ID and generate thumbnail
        const youtubeMatch = video.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        if (youtubeMatch) {
            return `https://img.youtube.com/vi/${youtubeMatch[1]}/mqdefault.jpg`;
        }

        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <FaVideo className="text-red-500" />
                            Video Gallery
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Manage event and campaign videos</p>
                    </div>
                    <button
                        onClick={() => navigate('/video-gallery/create')}
                        className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2"
                    >
                        <FaPlus />
                        Add Video
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                        <div className="text-3xl font-bold text-gray-800">{stats.totalVideos}</div>
                        <div className="text-sm text-gray-500 mt-1">Total Videos</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">{stats.featuredVideos}</div>
                        <div className="text-sm text-gray-500 mt-1">Featured</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                        <div className="text-3xl font-bold text-blue-600">{stats.totalViews.toLocaleString()}</div>
                        <div className="text-sm text-gray-500 mt-1">Total Views</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                        <div className="text-3xl font-bold text-purple-600">{stats.totalCategories}</div>
                        <div className="text-sm text-gray-500 mt-1">Categories</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Search videos..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                        />
                        <select
                            value={filter.category}
                            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <select
                            value={filter.featured}
                            onChange={(e) => setFilter({ ...filter, featured: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                        >
                            <option value="">All Videos</option>
                            <option value="true">Featured Only</option>
                            <option value="false">Non-Featured</option>
                        </select>
                    </div>
                </div>

                {/* Videos List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                        <p className="mt-4 text-gray-600">Loading videos...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-12">
                        <FaVideo className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No videos found</p>
                        <button
                            onClick={() => navigate('/video-gallery/create')}
                            className="mt-4 px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                        >
                            Add Your First Video
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {videos.map((video) => {
                            const thumbnail = getVideoThumbnail(video);
                            return (
                                <div key={video._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                    <div className="flex flex-col md:flex-row">
                                        {/* Video Thumbnail */}
                                        <div className="md:w-64 aspect-video bg-gray-900 overflow-hidden relative flex-shrink-0 group">
                                            {thumbnail ? (
                                                <>
                                                    <img
                                                        src={thumbnail}
                                                        alt={video.videoTitle}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                    {/* Play Button Overlay */}
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
                                                        <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                                                            <FaPlay className="text-2xl text-red-500 ml-1" />
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FaVideo className="text-5xl text-gray-600" />
                                                </div>
                                            )}

                                            {/* Featured Badge */}
                                            {video.featured && (
                                                <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                                    <span>⭐</span> Featured
                                                </div>
                                            )}

                                            {/* Duration Badge */}
                                            {video.duration && (
                                                <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white text-xs font-medium px-2 py-1 rounded">
                                                    {video.duration}
                                                </div>
                                            )}
                                        </div>

                                        {/* Video Details */}
                                        <div className="flex-1 p-4 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-800 text-lg mb-2">
                                                            {video.videoTitle}
                                                        </h3>
                                                        {video.description && (
                                                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                                                {video.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 font-medium rounded-full">
                                                        {video.category}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        👁️ {video.viewCount.toLocaleString()} views
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        📅 {new Date(video.publishDate).toLocaleDateString()}
                                                    </span>
                                                    {video.duration && (
                                                        <span className="flex items-center gap-1">
                                                            ⏱️ {video.duration}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => window.open(video.videoUrl, '_blank')}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                    title="Watch Video"
                                                >
                                                    <FaEye />
                                                    Watch
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/video-gallery/edit/${video._id}`)}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
                                                    title="Edit Video"
                                                >
                                                    <FaEdit />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(video._id)}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    title="Delete Video"
                                                >
                                                    <FaTrash />
                                                    Delete
                                                </button>
                                            </div>
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

export default VideoGalleryList;

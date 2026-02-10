import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaImage } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const PhotoGalleryList = () => {
    const navigate = useNavigate();
    const [photos, setPhotos] = useState([]);
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
        fetchPhotos();
    }, [filter]);

    const fetchPhotos = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filter.category) queryParams.append('category', filter.category);
            if (filter.featured) queryParams.append('featured', filter.featured);

            const response = await fetch(`https://api.harekrishnavidya.org/api/photo-gallery?${queryParams}`);
            if (!response.ok) throw new Error('Failed to fetch photos');

            const data = await response.json();
            setPhotos(data.data || []);
        } catch (err) {
            console.error('Error fetching photos:', err);
            setError('Failed to load photos');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this photo?')) return;

        try {
            const response = await fetch(`https://api.harekrishnavidya.org/api/photo-gallery/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete photo');

            setPhotos(photos.filter(photo => photo._id !== id));
        } catch (err) {
            console.error('Error deleting photo:', err);
            alert('Failed to delete photo');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <FaImage className="text-green-500" />
                            Photo Gallery
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Manage event and campaign photos</p>
                    </div>
                    <button
                        onClick={() => navigate('/photo-gallery/create')}
                        className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2"
                    >
                        <FaPlus />
                        Add New Photo
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex gap-4">
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
                        <option value="">All Photos</option>
                        <option value="true">Featured Only</option>
                        <option value="false">Non-Featured</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                        <p className="mt-4 text-gray-600">Loading photos...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                ) : photos.length === 0 ? (
                    <div className="text-center py-12">
                        <FaImage className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No photos found</p>
                        <button
                            onClick={() => navigate('/photo-gallery/create')}
                            className="mt-4 px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                        >
                            Add Your First Photo
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {photos.map((photo) => (
                            <div key={photo._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                {/* Image with Hover Overlay */}
                                <div className="aspect-video bg-gray-100 overflow-hidden relative">
                                    <img
                                        src={`https://api.harekrishnavidya.org${photo.imageUrl}`}
                                        alt={photo.imageTitle}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />

                                    {/* Featured Badge */}
                                    {photo.featured && (
                                        <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                            <span>⭐</span> Featured
                                        </div>
                                    )}

                                    {/* Category Badge */}
                                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
                                        {photo.category}
                                    </div>

                                    {/* Hover Overlay with Action Buttons */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                                        {/* Star/Favorite Button */}
                                        <button
                                            onClick={() => window.open(`https://api.harekrishnavidya.org${photo.imageUrl}`, '_blank')}
                                            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-all transform hover:scale-110 shadow-lg"
                                            title="View Full Image"
                                        >
                                            <FaEye className="text-lg" />
                                        </button>

                                        {/* Edit Button */}
                                        <button
                                            onClick={() => navigate(`/photo-gallery/edit/${photo._id}`)}
                                            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-all transform hover:scale-110 shadow-lg"
                                            title="Edit Photo"
                                        >
                                            <FaEdit className="text-lg" />
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => handleDelete(photo._id)}
                                            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-600 hover:bg-red-50 transition-all transform hover:scale-110 shadow-lg"
                                            title="Delete Photo"
                                        >
                                            <FaTrash className="text-lg" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-lg">
                                        {photo.imageTitle}
                                    </h3>
                                    {photo.description && (
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                            {photo.description}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                                        <span className="flex items-center gap-1">
                                            📅 {new Date(photo.publishDate).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            👁️ {photo.viewCount} views
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhotoGalleryList;

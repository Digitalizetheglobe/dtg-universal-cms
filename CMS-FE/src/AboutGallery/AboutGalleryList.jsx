import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AboutGalleryList = () => {
    const navigate = useNavigate();
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPhotos();
    }, []);

    const fetchPhotos = async () => {
        try {
            setLoading(true);
            const response = await fetch(`https://api.harekrishnavidya.org/api/about-gallery`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setPhotos(data.data || []);
        } catch (err) {
            setError('Failed to load photos');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            const response = await fetch(`https://api.harekrishnavidya.org/api/about-gallery/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Delete failed');
            setPhotos(photos.filter(p => p._id !== id));
        } catch (err) {
            alert('Delete failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">About Gallery</h1>
                <button onClick={() => navigate('/about-gallery/create')} className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                    <FaPlus /> Add New
                </button>
            </div>

            {loading ? <div className="text-center py-10">Loading...</div> : error ? <div className="text-red-500">{error}</div> : photos.length === 0 ? <div className="text-center py-10 bg-white border rounded-xl">No items found.</div> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {photos.map((photo) => (
                        <div key={photo._id} className="bg-white rounded-xl border overflow-hidden flex flex-col shadow-sm">
                            <div className="aspect-video bg-gray-100">
                                <img src={photo.imageUrl} alt={photo.imageTitle} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-4 flex-grow">
                                <h3 className="font-bold text-lg mb-1">{photo.imageTitle}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{photo.description}</p>
                            </div>
                            <div className="p-3 bg-gray-50 border-t grid grid-cols-2 gap-2">
                                <button onClick={() => navigate(`/about-gallery/edit/${photo._id}`)} className="flex items-center justify-center gap-2 py-2 bg-white border rounded text-sm font-semibold text-blue-600 hover:bg-blue-50">
                                    <FaEdit /> Edit
                                </button>
                                <button onClick={() => handleDelete(photo._id)} className="flex items-center justify-center gap-2 py-2 bg-white border rounded text-sm font-semibold text-red-600 hover:bg-red-50">
                                    <FaTrash /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AboutGalleryList;

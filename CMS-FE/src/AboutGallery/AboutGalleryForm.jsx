import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

const AboutGalleryForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        imageTitle: '',
        description: '',
        category: 'General',
        imageFile: null
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchDetails();
        }
    }, [id]);

    const fetchDetails = async () => {
        try {
            setFetchLoading(true);
            const response = await fetch(`https://api.harekrishnavidya.org/api/about-gallery/${id}`);
            if (!response.ok) throw new Error('Failed to fetch details');
            const data = (await response.json()).data;
            setFormData({
                imageTitle: data.imageTitle,
                description: data.description || '',
                category: data.category || 'General',
                imageFile: null
            });
            setImagePreview(data.imageUrl);
        } catch (err) {
            setError('Failed to load details');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, imageFile: file }));
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (!formData.imageTitle.trim()) {
            setError('Title is required');
            setLoading(false);
            return;
        }
        try {
            const submitData = new FormData();
            submitData.append('imageTitle', formData.imageTitle);
            submitData.append('description', formData.description);
            submitData.append('category', formData.category);
            if (formData.imageFile) submitData.append('image', formData.imageFile);

            const url = isEditMode ? `https://api.harekrishnavidya.org/api/about-gallery/${id}` : 'https://api.harekrishnavidya.org/api/about-gallery';
            const res = await fetch(url, { method: isEditMode ? 'PUT' : 'POST', body: submitData });
            if (!res.ok) throw new Error('Save failed');
            navigate('/about-gallery');
        } catch (err) {
            setError('Save failed');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/about-gallery')} className="text-gray-600"><FaArrowLeft /></button>
                    <h1 className="text-xl font-bold">{isEditMode ? 'Edit About Item' : 'Add About Item'}</h1>
                </div>
                <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                    <FaSave /> {loading ? 'Saving...' : 'Save'}
                </button>
            </div>
            <div className="max-w-2xl mx-auto p-6 space-y-6">
                <div className="bg-white p-6 rounded-xl border space-y-4 shadow-sm">
                    <div>
                        <label className="block text-sm font-medium mb-1">Image Title *</label>
                        <input type="text" name="imageTitle" value={formData.imageTitle} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Upload Image *</label>
                        <input type="file" onChange={handleImageChange} className="w-full mb-4" />
                        {imagePreview && <img src={imagePreview} alt="Preview" className="rounded-lg max-h-64 object-cover" />}
                    </div>
                </div>
                {error && <div className="text-red-500 font-medium">{error}</div>}
            </div>
        </div>
    );
};

export default AboutGalleryForm;

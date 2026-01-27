import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaSave, FaPlus, FaTrash, FaImage } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = 'http://localhost:5000/api';

const DonationKitForm = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fetching, setFetching] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        price: '',
        img: '',
        description: '',
        highlight: '',
        included: [''],
        displayOrder: 0,
        isActive: true
    });

    useEffect(() => {
        if (isEditMode) {
            fetchKitData();
        }
    }, [id]);

    const fetchKitData = async () => {
        setFetching(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/donation-kit-management/${id}`);
            if (response.data.success) {
                const data = response.data.data;
                setFormData({
                    title: data.title,
                    price: data.price,
                    img: data.img,
                    description: data.description,
                    highlight: data.highlight,
                    included: data.included && data.included.length > 0 ? data.included : [''],
                    displayOrder: data.displayOrder || 0,
                    isActive: data.isActive
                });
            }
        } catch (error) {
            console.error('Error fetching kit data:', error);
            toast.error('Failed to load donation kit details');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleIncludedChange = (index, value) => {
        const newIncluded = [...formData.included];
        newIncluded[index] = value;
        setFormData(prev => ({ ...prev, included: newIncluded }));
    };

    const addIncludedItem = () => {
        setFormData(prev => ({ ...prev, included: [...prev.included, ''] }));
    };

    const removeIncludedItem = (index) => {
        const newIncluded = formData.included.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, included: newIncluded }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Filter out empty included items
            const payload = {
                ...formData,
                included: formData.included.filter(item => item.trim() !== ''),
                price: Number(formData.price),
                displayOrder: Number(formData.displayOrder)
            };

            if (isEditMode) {
                await axios.put(`${API_BASE_URL}/donation-kit-management/${id}`, payload);
                toast.success('Donation kit updated successfully');
            } else {
                await axios.post(`${API_BASE_URL}/donation-kit-management`, payload);
                toast.success('Donation kit created successfully');
            }

            // Navigate back after short delay
            setTimeout(() => {
                navigate('/donation-kit-management/kits');
            }, 1500);
        } catch (error) {
            console.error('Error saving kit:', error);
            toast.error(error.response?.data?.message || 'Failed to save donation kit');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="p-8 text-center text-gray-500">Loading form...</div>;
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <ToastContainer />
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link
                            to="/donation-kit-management/kits"
                            className="flex items-center text-gray-500 hover:text-gray-700 mb-2 transition-colors"
                        >
                            <FaArrowLeft className="mr-2" /> Back to List
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-800">
                            {isEditMode ? 'Edit Donation Kit' : 'Add New Donation Kit'}
                        </h1>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Left Column */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kit Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow"
                                        placeholder="e.g. Education Support Kit"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow"
                                        placeholder="e.g. 790"
                                        min="0"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow"
                                        placeholder="Brief description of the kit..."
                                        required
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Highlight Label</label>
                                    <input
                                        type="text"
                                        name="highlight"
                                        value={formData.highlight}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow"
                                        placeholder="e.g. Education, Grocery, Medical"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image</label>
                                    <div className="border-2 border-dashed border-orange-200 rounded-lg p-6 text-center hover:bg-orange-50 transition-colors mb-4 cursor-pointer relative">
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;

                                                if (file.size > 5 * 1024 * 1024) {
                                                    toast.error('File size should be less than 5MB');
                                                    return;
                                                }

                                                const formData = new FormData();
                                                formData.append('image', file);

                                                setUploading(true);
                                                try {
                                                    const response = await axios.post(`${API_BASE_URL}/donation-kit-upload`, formData, {
                                                        headers: {
                                                            'Content-Type': 'multipart/form-data'
                                                        }
                                                    });

                                                    if (response.data.success) {
                                                        setFormData(prev => ({ ...prev, img: response.data.url }));
                                                        toast.success('Image uploaded successfully');
                                                    }
                                                } catch (error) {
                                                    console.error('Upload error:', error);
                                                    toast.error('Failed to upload image');
                                                } finally {
                                                    setUploading(false);
                                                }
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="flex flex-col items-center">
                                            {uploading ? (
                                                <div className="text-orange-500 font-medium">Uploading...</div>
                                            ) : (
                                                <>
                                                    <FaImage className="text-3xl text-gray-400 mb-2" />
                                                    <span className="text-sm font-medium text-gray-700">Click to upload</span>
                                                    <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Or enter image URL</label>
                                        <input
                                            type="text"
                                            name="img"
                                            value={formData.img}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow text-sm"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>

                                    {/* Image Preview */}
                                    {formData.img && (
                                        <div className="mt-2 relative h-48 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                            <img
                                                src={formData.img}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Invalid+Image+URL' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, img: '' }))}
                                                className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-md text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Included Items
                                        <span className="text-xs font-normal text-gray-500 ml-2">(List items included in this kit)</span>
                                    </label>
                                    <div className="space-y-2">
                                        {formData.included.map((item, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={item}
                                                    onChange={(e) => handleIncludedChange(index, e.target.value)}
                                                    className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow text-sm"
                                                    placeholder={`Item ${index + 1}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeIncludedItem(index)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    disabled={formData.included.length === 1}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addIncludedItem}
                                            className="text-sm text-orange-600 font-medium hover:text-orange-700 flex items-center mt-2"
                                        >
                                            <FaPlus className="mr-1 text-xs" /> Add Another Item
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
                                        <input
                                            type="number"
                                            name="displayOrder"
                                            value={formData.displayOrder}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow"
                                        />
                                    </div>
                                    <div className="flex-1 flex items-end mb-3">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isActive"
                                                checked={formData.isActive}
                                                onChange={handleChange}
                                                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 border-gray-300"
                                            />
                                            <span className="font-medium text-gray-700">Active</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end gap-4">
                            <Link
                                to="/donation-kit-management/kits"
                                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-8 py-2.5 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-all shadow-md flex items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                <FaSave className="mr-2" />
                                {loading ? 'Saving...' : 'Save Kit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DonationKitForm;

import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaUpload, FaTrash, FaShoppingBasket } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { API_BASE_URL_API } from '../api/api';

const GROCERY_EMOJIS = [
    '🍚', '🥇', '☕', '🌾', '⚡', '🧂', '🥐', '☕', '💧', '🍪', '🍝',
    '🥣', '🥜', '🫖'
];

const GroceryItemForm = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fetching, setFetching] = useState(false);

    const [formData, setFormData] = useState({
        itemName: '',
        quantity: '',
        price: '',
        icon: '🍚',
        description: '',
        displayOrder: 0,
        isActive: true
    });

    useEffect(() => {
        if (isEditMode) {
            fetchItemData();
        }
    }, [id]);

    const fetchItemData = async () => {
        setFetching(true);
        try {
            const response = await axios.get(`${API_BASE_URL_API}/grocery-item-management/${id}`);
            if (response.data.success) {
                const data = response.data.data;
                setFormData({
                    itemName: data.itemName || '',
                    quantity: data.quantity || '',
                    price: data.price || '',
                    icon: data.icon || '🍚',
                    description: data.description || '',
                    displayOrder: data.displayOrder || 0,
                    isActive: data.isActive !== undefined ? data.isActive : true
                });
            }
        } catch (error) {
            console.error('Error fetching item data:', error);
            toast.error('Failed to load grocery item details');
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

    const handleIconSelect = (emoji) => {
        setFormData(prev => ({ ...prev, icon: emoji }));
    };

    const handleImageUpload = async (e) => {
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
            const response = await axios.post(`${API_BASE_URL_API}/grocery-item-upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setFormData(prev => ({ ...prev, icon: response.data.url }));
                toast.success('Image uploaded successfully');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                price: Number(formData.price),
                displayOrder: Number(formData.displayOrder)
            };

            if (isEditMode) {
                await axios.put(`${API_BASE_URL_API}/grocery-item-management/${id}`, payload);
                toast.success('Grocery item updated successfully');
            } else {
                await axios.post(`${API_BASE_URL_API}/grocery-item-management`, payload);
                toast.success('Grocery item created successfully');
            }

            setTimeout(() => {
                navigate('/grocery-item-management/items');
            }, 1500);
        } catch (error) {
            console.error('Error saving item:', error);
            toast.error(error.response?.data?.message || 'Failed to save grocery item');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="p-8 text-center text-gray-500">Loading form...</div>;
    }

    const previewPrice = formData.price ? `₹${Number(formData.price).toLocaleString()}` : '₹0';
    const previewQuantity = formData.quantity || 'Amount';

    return (
        <div className="p-8 bg-[#F5F5DC] min-h-screen">
            <ToastContainer />
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <Link
                        to="/grocery-item-management/items"
                        className="flex items-center text-gray-500 hover:text-gray-700 mb-2 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" /> Back to List
                    </Link>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-8">
                        {/* Title */}
                        <div className="flex items-center mb-8">
                            <FaShoppingBasket className="text-orange-500 mr-3 text-xl" />
                            <h1 className="text-3xl font-bold text-gray-800">
                                {isEditMode ? 'Edit Item Details' : 'Item Details'}
                            </h1>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Icon Selection Section */}
                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-gray-700 mb-4">Icon</label>

                                {/* Custom Upload Option */}
                                <div className="mb-6">
                                    <p className="text-sm text-gray-600 mb-2">Upload custom icon</p>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="icon-upload"
                                            disabled={uploading}
                                        />
                                        <label
                                            htmlFor="icon-upload"
                                            className={`inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg cursor-pointer hover:bg-orange-600 transition-colors font-medium ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <FaUpload className="mr-2" />
                                            {uploading ? 'Uploading...' : 'Upload Image'}
                                        </label>
                                    </div>
                                </div>

                                {/* Emoji Selection Option */}
                                <div>
                                    <p className="text-sm text-gray-600 mb-3">Or choose an emoji</p>
                                    <div className="grid grid-cols-11 gap-3">
                                        {GROCERY_EMOJIS.map((emoji, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => handleIconSelect(emoji)}
                                                className={`w-12 h-12 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${formData.icon === emoji
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-gray-200 hover:border-orange-300'
                                                    }`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Form Fields Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* Item Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name</label>
                                    <input
                                        type="text"
                                        name="itemName"
                                        value={formData.itemName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow"
                                        placeholder="e.g., Premium Rice"
                                        required
                                    />
                                </div>

                                {/* Quantity/Amount */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity/Amount</label>
                                    <input
                                        type="text"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow"
                                        placeholder="e.g., 10 Kg"
                                        required
                                    />
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow"
                                        placeholder="e.g., 500"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow resize-y"
                                    placeholder="Brief description of the item"
                                    required
                                ></textarea>
                            </div>

                            {/* Preview Section */}
                            <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                                <label className="block text-sm font-semibold text-gray-700 mb-4">Preview</label>
                                <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm">
                                    <div className="w-16 h-16 rounded-full bg-[#FF6B35] flex items-center justify-center text-3xl text-white flex-shrink-0 overflow-hidden">
                                        {formData.icon && formData.icon.startsWith('http') ? (
                                            <img
                                                src={formData.icon}
                                                alt="Icon"
                                                className="w-full h-full rounded-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    if (!e.target.parentElement.querySelector('span.fallback-icon')) {
                                                        const span = document.createElement('span');
                                                        span.textContent = '🍚';
                                                        span.className = 'fallback-icon text-white text-3xl';
                                                        e.target.parentElement.appendChild(span);
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <span className="text-white">{formData.icon || '🍚'}</span>
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-gray-800 text-lg">
                                            {formData.itemName || 'Item Name'}
                                        </h3>
                                        <p className="text-gray-600 text-sm mt-1">
                                            {previewQuantity} • {previewPrice}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                                <Link
                                    to="/grocery-item-management/items"
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
                                    <FaShoppingBasket className="mr-2" />
                                    {loading ? 'Saving...' : isEditMode ? 'Update Item' : 'Create Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroceryItemForm;


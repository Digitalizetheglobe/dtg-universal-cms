import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaUpload, FaTrash, FaFileAlt, FaCalendarAlt, FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { API_BASE_URL_API } from '../api/api';

const CATEGORIES = ['Education', 'Healthcare', 'Food', 'Empowerment', 'Environment', 'General'];

const CampaignForm = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fetching, setFetching] = useState(false);

    const [formData, setFormData] = useState({
        campaignTitle: '',
        subtitle: '',
        shortDescription: '',
        category: '',
        location: '',
        goalAmount: '5000000',
        raisedAmount: '0',
        supporters: '0',
        deadline: '',
        featured: false,
        heroImage: '',
        displayOrder: 0,
        isActive: true
    });

    useEffect(() => {
        if (isEditMode) {
            fetchCampaignData();
        }
    }, [id]);

    const fetchCampaignData = async () => {
        setFetching(true);
        try {
            const response = await axios.get(`${API_BASE_URL_API}/campaign-management/${id}`);
            if (response.data.success) {
                const data = response.data.data;
                setFormData({
                    campaignTitle: data.campaignTitle || '',
                    subtitle: data.subtitle || '',
                    shortDescription: data.shortDescription || '',
                    category: data.category || '',
                    location: data.location || '',
                    goalAmount: data.goalAmount?.toString() || '0',
                    raisedAmount: data.raisedAmount?.toString() || '0',
                    supporters: data.supporters?.toString() || '0',
                    deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '',
                    featured: data.featured || false,
                    heroImage: data.heroImage || '',
                    displayOrder: data.displayOrder || 0,
                    isActive: data.isActive !== undefined ? data.isActive : true
                });
            }
        } catch (error) {
            console.error('Error fetching campaign data:', error);
            toast.error('Failed to load campaign details');
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
            const response = await axios.post(`${API_BASE_URL_API}/campaign-upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setFormData(prev => ({ ...prev, heroImage: response.data.url }));
                toast.success('Hero image uploaded successfully');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload hero image');
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
                goalAmount: Number(formData.goalAmount),
                raisedAmount: Number(formData.raisedAmount),
                supporters: Number(formData.supporters),
                displayOrder: Number(formData.displayOrder),
                deadline: new Date(formData.deadline)
            };

            if (isEditMode) {
                await axios.put(`${API_BASE_URL_API}/campaign-management/${id}`, payload);
                toast.success('Campaign updated successfully');
            } else {
                await axios.post(`${API_BASE_URL_API}/campaign-management`, payload);
                toast.success('Campaign created successfully');
            }

            setTimeout(() => {
                navigate('/campaign-management/campaigns');
            }, 1500);
        } catch (error) {
            console.error('Error saving campaign:', error);
            toast.error(error.response?.data?.message || 'Failed to save campaign');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="p-8 text-center text-gray-500">Loading form...</div>;
    }

    const previewGoalAmount = formData.goalAmount ? (Number(formData.goalAmount) / 100000).toFixed(1) + 'L' : '0.0L';
    const previewRaisedAmount = formData.raisedAmount ? (Number(formData.raisedAmount) / 100000).toFixed(1) + 'L' : '0.0L';
    const previewProgress = formData.goalAmount && Number(formData.goalAmount) > 0 
        ? ((Number(formData.raisedAmount) / Number(formData.goalAmount)) * 100).toFixed(0) 
        : 0;
    
    const daysLeft = formData.deadline 
        ? Math.max(0, Math.ceil((new Date(formData.deadline) - new Date()) / (1000 * 60 * 60 * 24)))
        : 0;

    return (
        <div className="p-8 bg-[#F5F5DC] min-h-screen">
            <ToastContainer />
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <Link
                        to="/campaign-management/campaigns"
                        className="flex items-center text-gray-500 hover:text-gray-700 mb-2 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" /> Back to List
                    </Link>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Section: Basic Information */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                            <div className="flex items-center mb-6">
                                <FaInfoCircle className="text-orange-500 mr-2" />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
                                    <p className="text-sm text-gray-500">Campaign title, category, and goals</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Campaign Title */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Campaign Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="campaignTitle"
                                        value={formData.campaignTitle}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow"
                                        placeholder="e.g., Build a School in Rural Telangana"
                                        required
                                    />
                                </div>

                                {/* Subtitle */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
                                    <input
                                        type="text"
                                        name="subtitle"
                                        value={formData.subtitle}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow"
                                        placeholder="Brief compelling tagline..."
                                    />
                                </div>

                                {/* Short Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description</label>
                                    <textarea
                                        name="shortDescription"
                                        value={formData.shortDescription}
                                        onChange={handleChange}
                                        rows="4"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow resize-y"
                                        placeholder="Brief description shown on campaign cards..."
                                    ></textarea>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow"
                                        required
                                    >
                                        <option value="">Select category</option>
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow"
                                        placeholder="e.g., Komarolu, Telangana"
                                    />
                                </div>

                                {/* Financial Details - Three fields in one row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Goal Amount (₹) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="goalAmount"
                                            value={formData.goalAmount}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow"
                                            placeholder="5000000"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Raised Amount (₹)</label>
                                        <input
                                            type="number"
                                            name="raisedAmount"
                                            value={formData.raisedAmount}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow"
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Supporters</label>
                                        <input
                                            type="number"
                                            name="supporters"
                                            value={formData.supporters}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow"
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                {/* Deadline */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Deadline <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="deadline"
                                            value={formData.deadline}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow pr-10"
                                            required
                                        />
                                        <FaCalendarAlt className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Featured Campaign */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Featured Campaign</label>
                                        <p className="text-xs text-gray-500">Show prominently on the campaigns page</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="featured"
                                            checked={formData.featured}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                    </label>
                                </div>

                                {/* Hero Image */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hero Image</label>
                                    <div className="border-2 border-dashed border-orange-200 rounded-lg p-6 text-center hover:bg-orange-50 transition-colors mb-3 cursor-pointer relative">
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg"
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            disabled={uploading}
                                        />
                                        <div className="flex flex-col items-center">
                                            {uploading ? (
                                                <div className="text-orange-500 font-medium">Uploading...</div>
                                            ) : (
                                                <>
                                                    <FaUpload className="text-2xl text-gray-400 mb-2" />
                                                    <span className="text-sm font-medium text-gray-700">Click to upload hero image</span>
                                                    <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        name="heroImage"
                                        value={formData.heroImage}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow text-sm"
                                        placeholder="Or paste image URL..."
                                    />
                                    {formData.heroImage && (
                                        <div className="mt-3 relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                                            <img
                                                src={formData.heroImage}
                                                alt="Hero"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/600x300?text=Invalid+Image';
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, heroImage: '' }))}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                            >
                                                <FaTrash size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Section: Campaign Preview */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Campaign Preview</h2>
                                <p className="text-sm text-gray-500">How it will appear</p>
                            </div>

                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* Preview Image */}
                                <div className="relative w-full h-48 bg-gray-200">
                                    {formData.heroImage ? (
                                        <img
                                            src={formData.heroImage}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                    {formData.category && (
                                        <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-md text-sm font-semibold">
                                            {formData.category}
                                        </div>
                                    )}
                                    {formData.featured && (
                                        <div className="absolute top-3 right-3 bg-yellow-400 text-gray-800 px-2 py-1 rounded-md text-xs font-bold">
                                            ★ Featured
                                        </div>
                                    )}
                                </div>

                                {/* Preview Content */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                                        {formData.campaignTitle || 'Campaign Title'}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {formData.shortDescription || 'Description...'}
                                    </p>

                                    {/* Funding Status */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-orange-500 font-bold text-lg">
                                                ₹{previewRaisedAmount}
                                            </span>
                                            <span className="text-gray-500 text-sm">
                                                of ₹{previewGoalAmount}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="bg-orange-500 h-2.5 rounded-full transition-all duration-300"
                                                style={{ width: `${Math.min(previewProgress, 100)}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{previewProgress}% funded</p>
                                    </div>

                                    {/* Metadata */}
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                        {formData.location && (
                                            <div className="flex items-center gap-1">
                                                <FaMapMarkerAlt />
                                                <span>{formData.location}</span>
                                            </div>
                                        )}
                                        {formData.deadline && (
                                            <div className="flex items-center gap-1">
                                                <FaCalendarAlt />
                                                <span>{daysLeft} days left</span>
                                            </div>
                                        )}
                                        {formData.supporters && Number(formData.supporters) > 0 && (
                                            <div>
                                                <span>{formData.supporters} supporters</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 mt-8">
                        <Link
                            to="/campaign-management/campaigns"
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
                            <FaFileAlt className="mr-2" />
                            {loading ? 'Saving...' : isEditMode ? 'Update Campaign' : 'Create Campaign'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CampaignForm;


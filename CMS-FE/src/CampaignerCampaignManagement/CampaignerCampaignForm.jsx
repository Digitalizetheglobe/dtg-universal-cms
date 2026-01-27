import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaUpload, FaTrash, FaFileAlt } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = 'http://localhost:5000/api';

const CampaignerCampaignForm = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [fetching, setFetching] = useState(false);

    const [formData, setFormData] = useState({
        fundraiserName: '',
        fundraiserPhoto: '',
        location: '',
        category: '',
        campaignStory: '',
        campaignImage: '',
        targetAmount: '',
        raisedAmount: '0',
        supportersCount: '0',
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
            const response = await axios.get(`${API_BASE_URL}/campaigner-campaign-management/${id}`);
            if (response.data.success) {
                const data = response.data.data;
                setFormData({
                    fundraiserName: data.fundraiserName || '',
                    fundraiserPhoto: data.fundraiserPhoto || '',
                    location: data.location || '',
                    category: data.category || '',
                    campaignStory: data.campaignStory || '',
                    campaignImage: data.campaignImage || '',
                    targetAmount: data.targetAmount || '',
                    raisedAmount: data.raisedAmount?.toString() || '0',
                    supportersCount: data.supportersCount?.toString() || '0',
                    displayOrder: data.displayOrder || 0,
                    isActive: data.isActive !== undefined ? data.isActive : true
                });
            }
        } catch (error) {
            console.error('Error fetching campaign data:', error);
            toast.error('Failed to load campaigner campaign details');
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

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should be less than 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        setUploadingPhoto(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/campaigner-campaign-upload?type=photo`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setFormData(prev => ({ ...prev, fundraiserPhoto: response.data.url }));
                toast.success('Fundraiser photo uploaded successfully');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload fundraiser photo');
        } finally {
            setUploadingPhoto(false);
        }
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

        setUploadingImage(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/campaigner-campaign-upload?type=campaign`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setFormData(prev => ({ ...prev, campaignImage: response.data.url }));
                toast.success('Campaign image uploaded successfully');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload campaign image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                targetAmount: Number(formData.targetAmount),
                raisedAmount: Number(formData.raisedAmount),
                supportersCount: Number(formData.supportersCount),
                displayOrder: Number(formData.displayOrder)
            };

            if (isEditMode) {
                await axios.put(`${API_BASE_URL}/campaigner-campaign-management/${id}`, payload);
                toast.success('Campaigner campaign updated successfully');
            } else {
                await axios.post(`${API_BASE_URL}/campaigner-campaign-management`, payload);
                toast.success('Campaigner campaign created successfully');
            }

            setTimeout(() => {
                navigate('/campaigner-campaign-management/campaigns');
            }, 1500);
        } catch (error) {
            console.error('Error saving campaign:', error);
            toast.error(error.response?.data?.message || 'Failed to save campaigner campaign');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="p-8 text-center text-gray-500">Loading form...</div>;
    }

    return (
        <div className="p-8 bg-[#F5F5DC] min-h-screen">
            <ToastContainer />
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <Link
                        to="/campaigner-campaign-management/campaigns"
                        className="flex items-center text-gray-500 hover:text-gray-700 mb-2 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" /> Back to List
                    </Link>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-8">
                        {/* Title */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-800">Campaign Details</h1>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Fundraiser Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Fundraiser Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="fundraiserName"
                                    value={formData.fundraiserName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow"
                                    placeholder="e.g., Priya Sharma"
                                    required
                                />
                            </div>

                            {/* Fundraiser Photo */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Fundraiser Photo</label>
                                <div className="mb-3">
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                        id="photo-upload"
                                        disabled={uploadingPhoto}
                                    />
                                    <label
                                        htmlFor="photo-upload"
                                        className={`inline-flex items-center px-6 py-2.5 bg-orange-500 text-white rounded-lg cursor-pointer hover:bg-orange-600 transition-colors font-medium ${uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <FaUpload className="mr-2" />
                                        {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">Or paste an image URL below</p>
                                <input
                                    type="text"
                                    name="fundraiserPhoto"
                                    value={formData.fundraiserPhoto}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow text-sm"
                                    placeholder="https://..."
                                />
                                {formData.fundraiserPhoto && (
                                    <div className="mt-3 relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                                        <img
                                            src={formData.fundraiserPhoto}
                                            alt="Fundraiser"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/100?text=No+Photo';
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, fundraiserPhoto: '' }))}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                        >
                                            <FaTrash size={10} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Location <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow"
                                    placeholder="e.g., Nizamabad, Telangana"
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow"
                                    placeholder="e.g., Education, Healthcare, Food, Empowerment"
                                    required
                                />
                            </div>

                            {/* Campaign Story */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Campaign Story <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="campaignStory"
                                    value={formData.campaignStory}
                                    onChange={handleChange}
                                    rows="6"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow resize-y"
                                    placeholder="Describe the campaign mission and goals..."
                                    required
                                ></textarea>
                            </div>

                            {/* Campaign Image */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Campaign Image</label>
                                <div className="mb-3">
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                        disabled={uploadingImage}
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className={`inline-flex items-center px-6 py-2.5 bg-orange-500 text-white rounded-lg cursor-pointer hover:bg-orange-600 transition-colors font-medium ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <FaUpload className="mr-2" />
                                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">Or paste an image URL below</p>
                                <input
                                    type="text"
                                    name="campaignImage"
                                    value={formData.campaignImage}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow text-sm"
                                    placeholder="https://..."
                                />
                                {formData.campaignImage && (
                                    <div className="mt-3 relative w-full max-w-md h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                                        <img
                                            src={formData.campaignImage}
                                            alt="Campaign"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, campaignImage: '' }))}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                        >
                                            <FaTrash size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Financial Details - Three fields in one row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Target Amount (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="targetAmount"
                                        value={formData.targetAmount}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow"
                                        placeholder="e.g., 150000"
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
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Supporters Count</label>
                                    <input
                                        type="number"
                                        name="supportersCount"
                                        value={formData.supportersCount}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                                <Link
                                    to="/campaigner-campaign-management/campaigns"
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
            </div>
        </div>
    );
};

export default CampaignerCampaignForm;


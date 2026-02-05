import React, { useState, useEffect, useRef } from 'react';
import {
    FaArrowLeft,
    FaUpload,
    FaTrash,
    FaSave,
    FaMagic,
    FaCommentDots,
    FaChartLine,
    FaMoneyBillWave,
    FaUsers,
    FaImages,
    FaVideo,
    FaHeart,
    FaEnvelope,
    FaPlus,
    FaTimes,
    FaFolderOpen,
    FaChevronDown,
    FaInfoCircle
} from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { API_BASE_URL_API } from '../api/api';

const TABS = [
    { id: 'basic', label: 'Basic', icon: FaMagic },
    { id: 'story', label: 'Story', icon: FaCommentDots },
    { id: 'impact', label: 'Impact', icon: FaChartLine },
    { id: 'funds', label: 'Funds', icon: FaMoneyBillWave },
    { id: 'testimonials', label: 'Testimonials', icon: FaUsers },
    { id: 'gallery', label: 'Gallery', icon: FaImages },
    { id: 'videos', label: 'Videos', icon: FaVideo },
    { id: 'donorWall', label: 'Donor Wall', icon: FaHeart },
    { id: 'contact', label: 'Contact', icon: FaEnvelope }
];

const CampaignForm = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const tabsRef = useRef(null);

    const [activeTab, setActiveTab] = useState('basic');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [uploading, setUploading] = useState({});

    const [formData, setFormData] = useState({
        basicInfo: {
            title: '',
            subtitle: '',
            slug: '',
            category: '',
            location: '',
            shortDescription: '',
            coverImage: '',
            bannerImage: '',
            deadline: '',
            isFeatured: false,
            isActive: true
        },
        story: {
            fullStory: '',
            mission: '',
            vision: ''
        },
        impact: {
            impactStatistics: [],
            donationImpacts: []
        },
        funds: {
            targetAmount: '',
            raisedAmount: '0',
            minimumDonation: '100',
            suggestedAmounts: ['500', '1000', '2500', '5000'],
            fundUtilization: [],
            currency: 'INR'
        },
        testimonials: [],
        gallery: [],
        albums: ['General'],
        videos: [],
        donorWall: {
            showDonorWall: true,
            showDonorNames: true,
            showDonationAmounts: true,
            minAmountToDisplay: '0',
            recentDonors: []
        },
        contact: {
            email: '',
            phone: '',
            address: '',
            socialLinks: {
                facebook: '',
                twitter: '',
                instagram: '',
                linkedin: ''
            }
        }
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
                setFormData(prev => ({
                    ...prev,
                    ...data,
                    basicInfo: {
                        ...(data.basicInfo || {}),
                        subtitle: data.basicInfo?.subtitle || '',
                        location: data.basicInfo?.location || '',
                        deadline: data.basicInfo?.deadline ? new Date(data.basicInfo.deadline).toISOString().split('T')[0] : '',
                        isFeatured: data.basicInfo?.isFeatured || false,
                    },
                    impact: {
                        impactStatistics: data.impact?.impactStatistics || [],
                        donationImpacts: data.impact?.donationImpacts || []
                    },
                    funds: {
                        ...(data.funds || {}),
                        fundUtilization: data.funds?.fundUtilization || [],
                        suggestedAmounts: data.funds?.suggestedAmounts || []
                    },
                    donorWall: {
                        ...(data.donorWall || {}),
                        showDonorWall: data.donorWall?.showDonorWall ?? true,
                        showDonorNames: data.donorWall?.showDonorNames ?? true,
                        showDonationAmounts: data.donorWall?.showDonationAmounts ?? true,
                        minAmountToDisplay: data.donorWall?.minAmountToDisplay ?? '0',
                        recentDonors: data.donorWall?.recentDonors || []
                    },
                    albums: data.albums || ['General'],
                    testimonials: data.testimonials || [],
                    gallery: data.gallery || [],
                    videos: data.videos || []
                }));
            }
        } catch (error) {
            console.error('Error fetching campaign data:', error);
            toast.error('Failed to load campaign details');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (section, field, value) => {
        if (!section) {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
            return;
        }
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleNestedChange = (section, parentField, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [parentField]: {
                    ...prev[section][parentField],
                    [field]: value
                }
            }
        }));
    };

    const handleImageUpload = async (e, section, field) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should be less than 5MB');
            return;
        }

        const uploadKey = `${section}-${field}`;
        setUploading(prev => ({ ...prev, [uploadKey]: true }));

        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

        try {
            const response = await axios.post(`${API_BASE_URL_API}/campaign-upload?type=${field}`, uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                handleChange(section, field, response.data.url);
                toast.success('Image uploaded successfully');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload image');
        } finally {
            setUploading(prev => ({ ...prev, [uploadKey]: false }));
        }
    };

    const addToArray = (section, newItem) => {
        setFormData(prev => ({
            ...prev,
            [section]: [...prev[section], newItem]
        }));
    };

    const removeFromArray = (section, index) => {
        setFormData(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
    };

    const updateArrayItem = (section, index, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: prev[section].map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                funds: {
                    ...formData.funds,
                    targetAmount: Number(formData.funds.targetAmount),
                    raisedAmount: Number(formData.funds.raisedAmount),
                    minimumDonation: Number(formData.funds.minimumDonation),
                    suggestedAmounts: formData.funds.suggestedAmounts.map(Number)
                }
            };

            if (isEditMode) {
                await axios.put(`${API_BASE_URL_API}/campaign-management/${id}`, payload);
                toast.success('Campaign updated successfully');
            } else {
                await axios.post(`${API_BASE_URL_API}/campaign-management`, payload);
                toast.success('Campaign created successfully');
            }

            setTimeout(() => {
                navigate('/donation-kit-management');
            }, 1500);
        } catch (error) {
            console.error('Error saving campaign:', error);
            toast.error(error.response?.data?.message || 'Failed to save campaign');
        } finally {
            setLoading(false);
        }
    };

    const scrollTabs = (direction) => {
        if (tabsRef.current) {
            tabsRef.current.scrollBy({ left: direction * 150, behavior: 'smooth' });
        }
    };

    if (fetching) {
        return (
            <div className="p-8 bg-[#F5F5DC] min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading campaign...</p>
                </div>
            </div>
        );
    }

    return (

        <div className="p-8 bg-[#F5F5DC] min-h-screen">
            <ToastContainer />
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        to="/donation-kit-management"
                        className="flex items-center text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {isEditMode ? 'Edit Campaign' : 'Create New Campaign'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Add a new cause to 'Choose a Cause - Make Real Impact'
                    </p>
                </div>

                {/* Tabs Navigation */}
                <div className="sticky top-0 z-30 bg-white rounded-t-2xl shadow-lg border border-gray-100 border-b-0">
                    <div className="relative">
                        <div
                            ref={tabsRef}
                            className="flex overflow-x-auto scrollbar-hide px-4 py-3 gap-2"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${activeTab === tab.id
                                            ? 'bg-orange-500 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-orange-200'
                                            }`}
                                    >
                                        <Icon className="text-sm" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                        {/* Progress bar */}
                        <div className="h-1 bg-gray-200">
                            <div
                                className="h-full bg-orange-500 transition-all duration-300"
                                style={{ width: `${((TABS.findIndex(t => t.id === activeTab) + 1) / TABS.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit}>

                    <div className="bg-white rounded-b-2xl shadow-lg border border-gray-100 border-t-0 p-8">

                        {/* Basic Tab */}
                        {activeTab === 'basic' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Basic Information Section */}
                                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 space-y-6">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                                                <FaInfoCircle size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800">Basic Information</h3>
                                                <p className="text-xs text-gray-500">Campaign title, category, and goals</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Campaign Title <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.basicInfo.title}
                                                    onChange={(e) => handleChange('basicInfo', 'title', e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                    placeholder="Build a School in Rural Telangana"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
                                                <input
                                                    type="text"
                                                    value={formData.basicInfo.subtitle}
                                                    onChange={(e) => handleChange('basicInfo', 'subtitle', e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                    placeholder="Give 200+ children a safe place to learn and grow"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description</label>
                                                <textarea
                                                    value={formData.basicInfo.shortDescription}
                                                    onChange={(e) => handleChange('basicInfo', 'shortDescription', e.target.value)}
                                                    rows="3"
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                                                    placeholder="Brief description of the campaign..."
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Category <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={formData.basicInfo.category}
                                                        onChange={(e) => handleChange('basicInfo', 'category', e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                        required
                                                    >
                                                        <option value="">Select Category</option>
                                                        <option value="Education">Education</option>
                                                        <option value="Healthcare">Healthcare</option>
                                                        <option value="Food">Food</option>
                                                        <option value="Empowerment">Empowerment</option>
                                                        <option value="Environment">Environment</option>
                                                        <option value="Children">Children</option>
                                                        <option value="Women">Women</option>
                                                        <option value="Elderly">Elderly</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                                                    <input
                                                        type="text"
                                                        value={formData.basicInfo.location}
                                                        onChange={(e) => handleChange('basicInfo', 'location', e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                        placeholder="Komarolu, Telangana"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Goal Amount (₹) <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.funds.targetAmount}
                                                        onChange={(e) => handleChange('funds', 'targetAmount', e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                        placeholder="5000000"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Raised Amount (₹)</label>
                                                    <input
                                                        type="number"
                                                        value={formData.funds.raisedAmount}
                                                        onChange={(e) => handleChange('funds', 'raisedAmount', e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                        placeholder="3250000"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Deadline <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={formData.basicInfo.deadline}
                                                        onChange={(e) => handleChange('basicInfo', 'deadline', e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                                <div>
                                                    <h4 className="font-bold text-gray-800 text-sm">Featured Campaign</h4>
                                                    <p className="text-[10px] text-gray-500">Show prominently on the campaigns page</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={formData.basicInfo.isFeatured}
                                                        onChange={(e) => handleChange('basicInfo', 'isFeatured', e.target.checked)}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                                </label>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Hero Image</label>
                                                <div className="space-y-4">
                                                    {formData.basicInfo.coverImage && (
                                                        <div className="relative rounded-2xl overflow-hidden border border-gray-100 aspect-video bg-gray-50">
                                                            <img src={formData.basicInfo.coverImage} alt="Hero" className="w-full h-full object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleChange('basicInfo', 'coverImage', '')}
                                                                className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-xl hover:bg-red-600 transition-colors shadow-lg"
                                                            >
                                                                <FaTrash size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={formData.basicInfo.coverImage}
                                                            onChange={(e) => handleChange('basicInfo', 'coverImage', e.target.value)}
                                                            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-none"
                                                            placeholder="Paste image URL here..."
                                                        />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleImageUpload(e, 'basicInfo', 'coverImage')}
                                                            className="hidden"
                                                            id="hero-upload"
                                                        />
                                                        <label
                                                            htmlFor="hero-upload"
                                                            className={`px-4 py-2.5 bg-orange-500 text-white rounded-xl cursor-pointer hover:bg-orange-600 transition-colors text-xs font-medium flex items-center gap-2 ${uploading['basicInfo-coverImage'] ? 'opacity-50 pointer-events-none' : ''}`}
                                                        >
                                                            <FaUpload size={12} />
                                                            {uploading['basicInfo-coverImage'] ? 'Uploading...' : 'Upload'}
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                                                <input
                                                    type="checkbox"
                                                    id="isActive"
                                                    checked={formData.basicInfo.isActive}
                                                    onChange={(e) => handleChange('basicInfo', 'isActive', e.target.checked)}
                                                    className="w-5 h-5 text-orange-500 rounded-lg focus:ring-orange-500 border-gray-300"
                                                />
                                                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                                                    Campaign is Active
                                                </label>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                {/* Preview Sidebar */}
                                <div className="lg:col-span-1">
                                    <div className="sticky top-24 space-y-4">
                                        <h3 className="font-bold text-gray-800">Campaign Preview</h3>
                                        <p className="text-xs text-gray-500 -mt-2">How it will appear</p>

                                        <div className="bg-white border border-gray-100 rounded-3xl shadow-lg overflow-hidden max-w-sm mx-auto">
                                            <div className="relative h-48">
                                                {formData.basicInfo.coverImage ? (
                                                    <img src={formData.basicInfo.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                                        <FaImages size={48} />
                                                    </div>
                                                )}
                                                <div className="absolute top-4 left-4 flex gap-2">
                                                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                        {formData.basicInfo.category || 'Category'}
                                                    </span>
                                                    {formData.basicInfo.isFeatured && (
                                                        <span className="bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-4">
                                                <h4 className="font-bold text-gray-800 text-lg line-clamp-2">
                                                    {formData.basicInfo.title || 'Build a School in Rural Telangana'}
                                                </h4>
                                                <p className="text-gray-500 text-sm line-clamp-3">
                                                    {formData.basicInfo.subtitle || formData.basicInfo.shortDescription || 'Help us construct a school building for 200+ children in a remote village...'}
                                                </p>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-orange-500 font-bold text-sm">₹{formData.funds.raisedAmount || 0}</span>
                                                        <span className="text-gray-400 text-[10px]">of ₹{formData.funds.targetAmount || 0}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-orange-500"
                                                            style={{ width: `${Math.min(100, (Number(formData.funds.raisedAmount) / Number(formData.funds.targetAmount || 1)) * 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-medium text-left">
                                                        {Math.round((Number(formData.funds.raisedAmount) / Number(formData.funds.targetAmount || 1)) * 100)}% funded
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-[10px] text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <FaUsers />
                                                        <span>{formData.basicInfo.location || 'Komarolu, Telangana'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="bg-gray-100 px-2 py-0.5 rounded">{formData.basicInfo.deadline || '2025-03-31'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        )}
                        {/* Story Tab */}
                        {activeTab === 'story' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 space-y-6 text-left">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                                                <FaCommentDots size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800">Campaign Story</h3>
                                                <p className="text-xs text-gray-500">The narrative behind your cause</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    The Problem <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={formData.story.fullStory}
                                                    onChange={(e) => handleChange('story', 'fullStory', e.target.value)}
                                                    rows="8"
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-y"
                                                    placeholder="Tell the complete story of your campaign..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Our Solution</label>
                                                <textarea
                                                    value={formData.story.mission}
                                                    onChange={(e) => handleChange('story', 'mission', e.target.value)}
                                                    rows="4"
                                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-y"
                                                    placeholder="What is the mission of this campaign?"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview Sidebar */}
                                <div className="lg:col-span-1">
                                    <div className="sticky top-24 space-y-4">
                                        <h3 className="font-bold text-gray-800">Campaign Preview</h3>
                                        <p className="text-xs text-gray-500 -mt-2">How it will appear</p>

                                        <div className="bg-white border border-gray-100 rounded-3xl shadow-lg overflow-hidden max-w-sm mx-auto">
                                            <div className="relative h-48">
                                                {formData.basicInfo.coverImage ? (
                                                    <img src={formData.basicInfo.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                                        <FaImages size={48} />
                                                    </div>
                                                )}
                                                <div className="absolute top-4 left-4 flex gap-2">
                                                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                        {formData.basicInfo.category || 'Category'}
                                                    </span>
                                                    {formData.basicInfo.isFeatured && (
                                                        <span className="bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-4 text-left">
                                                <h4 className="font-bold text-gray-800 text-lg line-clamp-2">
                                                    {formData.basicInfo.title || 'Build a School in Rural Telangana'}
                                                </h4>
                                                <p className="text-gray-500 text-sm line-clamp-3">
                                                    {formData.basicInfo.subtitle || formData.basicInfo.shortDescription || 'Help us construct a school building for 200+ children in a remote village...'}
                                                </p>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-orange-500 font-bold text-sm">₹{formData.funds.raisedAmount || 0}</span>
                                                        <span className="text-gray-400 text-[10px]">of ₹{formData.funds.targetAmount || 0}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-orange-500"
                                                            style={{ width: `${Math.min(100, (Number(formData.funds.raisedAmount) / Number(formData.funds.targetAmount || 1)) * 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-medium">
                                                        {Math.round((Number(formData.funds.raisedAmount) / Number(formData.funds.targetAmount || 1)) * 100)}% funded
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-[10px] text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <FaUsers />
                                                        <span>{formData.basicInfo.location || 'Komarolu, Telangana'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="bg-gray-100 px-2 py-0.5 rounded">{formData.basicInfo.deadline || '2025-03-31'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Impact Tab */}
                        {activeTab === 'impact' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Impact Statistics */}
                                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                                                    <FaChartLine />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800">Impact Statistics</h3>
                                                    <p className="text-xs text-gray-500">Key impact numbers</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newStats = [...formData.impact.impactStatistics, { value: '', label: '', description: '' }];
                                                    handleChange('impact', 'impactStatistics', newStats);
                                                }}
                                                className="flex items-center gap-1 px-4 py-2 border border-orange-200 text-orange-500 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors"
                                            >
                                                <FaPlus size={12} /> Add
                                            </button>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            {formData.impact.impactStatistics.length === 0 ? (
                                                <p className="text-center text-gray-400 py-4 text-sm italic">No statistics added yet.</p>
                                            ) : (
                                                formData.impact.impactStatistics.map((stat, index) => (
                                                    <div key={index} className="flex gap-3 items-start bg-gray-50 p-3 rounded-xl">
                                                        <input
                                                            type="text"
                                                            value={stat.value}
                                                            onChange={(e) => {
                                                                const newStats = [...formData.impact.impactStatistics];
                                                                newStats[index].value = e.target.value;
                                                                handleChange('impact', 'impactStatistics', newStats);
                                                            }}
                                                            className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                            placeholder="200+"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={stat.label}
                                                            onChange={(e) => {
                                                                const newStats = [...formData.impact.impactStatistics];
                                                                newStats[index].label = e.target.value;
                                                                handleChange('impact', 'impactStatistics', newStats);
                                                            }}
                                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                            placeholder="Students"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={stat.description}
                                                            onChange={(e) => {
                                                                const newStats = [...formData.impact.impactStatistics];
                                                                newStats[index].description = e.target.value;
                                                                handleChange('impact', 'impactStatistics', newStats);
                                                            }}
                                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                            placeholder="Will benefit"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newStats = formData.impact.impactStatistics.filter((_, i) => i !== index);
                                                                handleChange('impact', 'impactStatistics', newStats);
                                                            }}
                                                            className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <FaTrash size={14} />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Donation Impacts */}
                                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                                                    <FaHeart />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800">Donation Impacts</h3>
                                                    <p className="text-xs text-gray-500">What each amount achieves</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newImpacts = [...formData.impact.donationImpacts, { amount: '', description: '' }];
                                                    handleChange('impact', 'donationImpacts', newImpacts);
                                                }}
                                                className="flex items-center gap-1 px-4 py-2 border border-orange-200 text-orange-500 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors"
                                            >
                                                <FaPlus size={12} /> Add
                                            </button>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            {formData.impact.donationImpacts.length === 0 ? (
                                                <p className="text-center text-gray-400 py-4 text-sm italic">No donation impacts added yet.</p>
                                            ) : (
                                                formData.impact.donationImpacts.map((impact, index) => (
                                                    <div key={index} className="flex gap-3 items-start bg-gray-50 p-3 rounded-xl">
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-2 text-gray-400 text-sm">₹</span>
                                                            <input
                                                                type="text"
                                                                value={impact.amount}
                                                                onChange={(e) => {
                                                                    const newImpacts = [...formData.impact.donationImpacts];
                                                                    newImpacts[index].amount = e.target.value;
                                                                    handleChange('impact', 'donationImpacts', newImpacts);
                                                                }}
                                                                className="w-24 pl-6 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                                placeholder="500"
                                                            />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={impact.description}
                                                            onChange={(e) => {
                                                                const newImpacts = [...formData.impact.donationImpacts];
                                                                newImpacts[index].description = e.target.value;
                                                                handleChange('impact', 'donationImpacts', newImpacts);
                                                            }}
                                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                            placeholder="e.g., 10 bricks for construction"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newImpacts = formData.impact.donationImpacts.filter((_, i) => i !== index);
                                                                handleChange('impact', 'donationImpacts', newImpacts);
                                                            }}
                                                            className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <FaTrash size={14} />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Preview Sidebar */}
                                <div className="lg:col-span-1">
                                    <div className="sticky top-24 space-y-4">
                                        <h3 className="font-bold text-gray-800">Campaign Preview</h3>
                                        <p className="text-xs text-gray-500 -mt-2">How it will appear</p>

                                        <div className="bg-white border border-gray-100 rounded-3xl shadow-lg overflow-hidden max-w-sm mx-auto">
                                            <div className="relative h-48">
                                                {formData.basicInfo.coverImage ? (
                                                    <img src={formData.basicInfo.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                                        <FaImages size={48} />
                                                    </div>
                                                )}
                                                <div className="absolute top-4 left-4 flex gap-2">
                                                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                        {formData.basicInfo.category || 'Category'}
                                                    </span>
                                                    {formData.basicInfo.isFeatured && (
                                                        <span className="bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-4">
                                                <h4 className="font-bold text-gray-800 text-lg line-clamp-2">
                                                    {formData.basicInfo.title || 'Build a School in Rural Telangana'}
                                                </h4>
                                                <p className="text-gray-500 text-sm line-clamp-3">
                                                    {formData.basicInfo.subtitle || formData.basicInfo.shortDescription || 'Help us construct a school building for 200+ children in a remote village...'}
                                                </p>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-orange-500 font-bold text-sm">₹{formData.funds.raisedAmount || 0}</span>
                                                        <span className="text-gray-400 text-[10px]">of ₹{formData.funds.targetAmount || 0}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-orange-500"
                                                            style={{ width: `${Math.min(100, (Number(formData.funds.raisedAmount) / Number(formData.funds.targetAmount || 1)) * 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-medium text-left">
                                                        {Math.round((Number(formData.funds.raisedAmount) / Number(formData.funds.targetAmount || 1)) * 100)}% funded
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-[10px] text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <FaUsers />
                                                        <span>{formData.basicInfo.location || 'Komarolu, Telangana'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="bg-gray-100 px-2 py-0.5 rounded">{formData.basicInfo.deadline || '2025-03-31'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Funds Tab */}
                        {activeTab === 'funds' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Core Funding Details */}
                                    {/* Fund Utilization */}
                                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-500">
                                                    <FaMoneyBillWave />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800">Fund Utilization</h3>
                                                    <p className="text-xs text-gray-500">How funds will be used</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newUtilization = [...formData.funds.fundUtilization, { label: '', percentage: '', amount: '', description: '' }];
                                                    handleChange('funds', 'fundUtilization', newUtilization);
                                                }}
                                                className="flex items-center gap-1 px-4 py-2 border border-orange-200 text-orange-500 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors"
                                            >
                                                <FaPlus size={12} /> Add
                                            </button>
                                        </div>
                                        <div className="p-6 space-y-6">
                                            {formData.funds.fundUtilization.length === 0 ? (
                                                <p className="text-center text-gray-400 py-4 text-sm italic">No utilization details added yet.</p>
                                            ) : (
                                                formData.funds.fundUtilization.map((item, index) => (
                                                    <div key={index} className="bg-gray-50 p-4 rounded-2xl space-y-3 border border-gray-100">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Item #{index + 1}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newUtilization = formData.funds.fundUtilization.filter((_, i) => i !== index);
                                                                    handleChange('funds', 'fundUtilization', newUtilization);
                                                                }}
                                                                className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                                            >
                                                                <FaTrash size={14} />
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                            <input
                                                                type="text"
                                                                value={item.label}
                                                                onChange={(e) => {
                                                                    const newUtilization = [...formData.funds.fundUtilization];
                                                                    newUtilization[index].label = e.target.value;
                                                                    handleChange('funds', 'fundUtilization', newUtilization);
                                                                }}
                                                                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                                placeholder="Category name"
                                                            />
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    value={item.percentage}
                                                                    onChange={(e) => {
                                                                        const newUtilization = [...formData.funds.fundUtilization];
                                                                        newUtilization[index].percentage = e.target.value;
                                                                        handleChange('funds', 'fundUtilization', newUtilization);
                                                                    }}
                                                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                                    placeholder="Percentage"
                                                                />
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={item.amount}
                                                                onChange={(e) => {
                                                                    const newUtilization = [...formData.funds.fundUtilization];
                                                                    newUtilization[index].amount = e.target.value;
                                                                    handleChange('funds', 'fundUtilization', newUtilization);
                                                                }}
                                                                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                                placeholder="Amount"
                                                            />
                                                        </div>
                                                        <textarea
                                                            value={item.description}
                                                            onChange={(e) => {
                                                                const newUtilization = [...formData.funds.fundUtilization];
                                                                newUtilization[index].description = e.target.value;
                                                                handleChange('funds', 'fundUtilization', newUtilization);
                                                            }}
                                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                                                            placeholder="Description..."
                                                            rows="1"
                                                        />
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Preview Sidebar */}
                                <div className="lg:col-span-1">
                                    <div className="sticky top-24 space-y-4">
                                        <h3 className="font-bold text-gray-800">Campaign Preview</h3>
                                        <p className="text-xs text-gray-500 -mt-2">How it will appear</p>

                                        <div className="bg-white border border-gray-100 rounded-3xl shadow-lg overflow-hidden max-w-sm mx-auto">
                                            <div className="relative h-48">
                                                {formData.basicInfo.coverImage ? (
                                                    <img src={formData.basicInfo.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                                        <FaImages size={48} />
                                                    </div>
                                                )}
                                                <div className="absolute top-4 left-4 flex gap-2">
                                                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                        {formData.basicInfo.category || 'Category'}
                                                    </span>
                                                    {formData.basicInfo.isFeatured && (
                                                        <span className="bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-4">
                                                <h4 className="font-bold text-gray-800 text-lg line-clamp-2">
                                                    {formData.basicInfo.title || 'Build a School in Rural Telangana'}
                                                </h4>
                                                <p className="text-gray-500 text-sm line-clamp-3">
                                                    {formData.basicInfo.subtitle || formData.basicInfo.shortDescription || 'Help us construct a school building for 200+ children in a remote village...'}
                                                </p>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-orange-500 font-bold text-sm">₹{formData.funds.raisedAmount || 0}</span>
                                                        <span className="text-gray-400 text-[10px]">of ₹{formData.funds.targetAmount || 0}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-orange-500"
                                                            style={{ width: `${Math.min(100, (Number(formData.funds.raisedAmount) / Number(formData.funds.targetAmount || 1)) * 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-medium text-left">
                                                        {Math.round((Number(formData.funds.raisedAmount) / Number(formData.funds.targetAmount || 1)) * 100)}% funded
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-[10px] text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <FaUsers />
                                                        <span>{formData.basicInfo.location || 'Komarolu, Telangana'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="bg-gray-100 px-2 py-0.5 rounded">{formData.basicInfo.deadline || '2025-03-31'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Testimonials Tab */}
                        {activeTab === 'testimonials' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 space-y-6 text-left">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                                                    <FaUsers size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800">Testimonials</h3>
                                                    <p className="text-xs text-gray-500">What others are saying about the cause</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => addToArray('testimonials', { name: '', quote: '', image: '', designation: '' })}
                                                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                                            >
                                                <FaPlus /> Add Testimonial
                                            </button>
                                        </div>

                                        {formData.testimonials.length === 0 ? (
                                            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                    <FaUsers className="text-2xl text-gray-300" />
                                                </div>
                                                <p className="text-gray-500 text-sm">No testimonials yet. Add one to get started.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {formData.testimonials.map((testimonial, index) => (
                                                    <div key={index} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 relative group transition-all hover:shadow-md">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFromArray('testimonials', index)}
                                                            className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <FaTrash size={14} />
                                                        </button>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Name</label>
                                                                <input
                                                                    type="text"
                                                                    value={testimonial.name}
                                                                    onChange={(e) => updateArrayItem('testimonials', index, 'name', e.target.value)}
                                                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                                    placeholder="John Doe"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Designation</label>
                                                                <input
                                                                    type="text"
                                                                    value={testimonial.designation}
                                                                    onChange={(e) => updateArrayItem('testimonials', index, 'designation', e.target.value)}
                                                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                                    placeholder="Local Volunteer"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 space-y-1">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Testimonial Quote</label>
                                                            <textarea
                                                                value={testimonial.quote}
                                                                onChange={(e) => updateArrayItem('testimonials', index, 'quote', e.target.value)}
                                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                                                                rows="3"
                                                                placeholder="Share their experience..."
                                                            />
                                                        </div>
                                                        <div className="mt-4 space-y-1">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Image URL</label>
                                                            <div className="flex gap-4 items-center">
                                                                <input
                                                                    type="text"
                                                                    value={testimonial.image}
                                                                    onChange={(e) => updateArrayItem('testimonials', index, 'image', e.target.value)}
                                                                    className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                                    placeholder="https://images.unsplash.com/..."
                                                                />
                                                                {testimonial.image && (
                                                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-white">
                                                                        <img src={testimonial.image} alt="Avatar" className="w-full h-full object-cover" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Preview Sidebar */}
                                <div className="lg:col-span-1">
                                    <div className="sticky top-24 space-y-4">
                                        <h3 className="font-bold text-gray-800">Campaign Preview</h3>
                                        <p className="text-xs text-gray-500 -mt-2">How it will appear</p>

                                        <div className="bg-white border border-gray-100 rounded-3xl shadow-lg overflow-hidden max-w-sm mx-auto">
                                            <div className="relative h-48">
                                                {formData.basicInfo.coverImage ? (
                                                    <img src={formData.basicInfo.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                                        <FaImages size={48} />
                                                    </div>
                                                )}
                                                <div className="absolute top-4 left-4 flex gap-2">
                                                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                        {formData.basicInfo.category || 'Category'}
                                                    </span>
                                                    {formData.basicInfo.isFeatured && (
                                                        <span className="bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-4 text-left">
                                                <h4 className="font-bold text-gray-800 text-lg line-clamp-2">
                                                    {formData.basicInfo.title || 'Build a School in Rural Telangana'}
                                                </h4>
                                                <p className="text-gray-500 text-sm line-clamp-3">
                                                    {formData.basicInfo.subtitle || formData.basicInfo.shortDescription || 'Help us construct a school building for 200+ children in a remote village...'}
                                                </p>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-orange-500 font-bold text-sm">₹{formData.funds.raisedAmount || 0}</span>
                                                        <span className="text-gray-400 text-[10px]">of ₹{formData.funds.targetAmount || 0}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-orange-500"
                                                            style={{ width: `${Math.min(100, (Number(formData.funds.raisedAmount) / Number(formData.funds.targetAmount || 1)) * 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-medium">
                                                        {Math.round((Number(formData.funds.raisedAmount) / Number(formData.funds.targetAmount || 1)) * 100)}% funded
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-[10px] text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <FaUsers />
                                                        <span>{formData.basicInfo.location || 'Komarolu, Telangana'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="bg-gray-100 px-2 py-0.5 rounded">{formData.basicInfo.deadline || '2025-03-31'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Gallery Tab */}
                        {activeTab === 'gallery' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Albums Section */}
                                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
                                                    <FaFolderOpen />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800">Albums</h3>
                                                    <p className="text-xs text-gray-500">Organize your photos into albums</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const name = prompt('Enter album name:');
                                                    if (name && !formData.albums.includes(name)) {
                                                        handleChange(null, 'albums', [...formData.albums, name]);
                                                    }
                                                }}
                                                className="flex items-center gap-1 px-4 py-2 border border-orange-200 text-orange-500 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors"
                                            >
                                                <FaPlus size={12} /> New Album
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {formData.albums.map((album, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-600"
                                                >
                                                    {album}
                                                    {album !== 'General' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newAlbums = formData.albums.filter((_, i) => i !== idx);
                                                                handleChange(null, 'albums', newAlbums);
                                                            }}
                                                            className="text-gray-400 hover:text-red-500"
                                                        >
                                                            <FaTimes size={10} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Photo Gallery Section */}
                                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-500">
                                                    <FaImages />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800">Photo Gallery</h3>
                                                    <p className="text-xs text-gray-500">Add images to showcase the campaign</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => addToArray('gallery', { url: '', caption: '', category: 'General' })}
                                                className="flex items-center gap-1 px-4 py-2 border border-orange-200 text-orange-500 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors"
                                            >
                                                <FaPlus size={12} /> Add Image
                                            </button>
                                        </div>

                                        <div className="p-6 space-y-6">
                                            {formData.gallery.length === 0 ? (
                                                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                                    <FaImages className="text-4xl text-gray-300 mx-auto mb-3" />
                                                    <p className="text-gray-500 text-sm">No images yet. Add photos to showcase your work.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {formData.gallery.map((image, index) => (
                                                        <div key={index} className="bg-gray-50 p-4 rounded-2xl space-y-4 border border-gray-100 relative group">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFromArray('gallery', index)}
                                                                className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                            >
                                                                <FaTrash size={14} />
                                                            </button>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-4">
                                                                    <div className="relative">
                                                                        <input
                                                                            type="text"
                                                                            value={image.url}
                                                                            onChange={(e) => updateArrayItem('gallery', index, 'url', e.target.value)}
                                                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                                            placeholder="Image URL"
                                                                        />
                                                                    </div>
                                                                    <div className="relative">
                                                                        <select
                                                                            value={image.category}
                                                                            onChange={(e) => updateArrayItem('gallery', index, 'category', e.target.value)}
                                                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none appearance-none"
                                                                        >
                                                                            {formData.albums.map(album => (
                                                                                <option key={album} value={album}>{album}</option>
                                                                            ))}
                                                                        </select>
                                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                                            <FaChevronDown size={12} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <textarea
                                                                        value={image.caption}
                                                                        onChange={(e) => updateArrayItem('gallery', index, 'caption', e.target.value)}
                                                                        className="w-full h-full min-h-[95px] px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                                                                        placeholder="Image caption..."
                                                                    />
                                                                </div>
                                                            </div>
                                                            {image.url && (
                                                                <div className="mt-2 rounded-xl overflow-hidden h-32 w-full max-w-xs border border-gray-100 bg-white">
                                                                    <img src={image.url} alt="Gallery Preview" className="w-full h-full object-cover" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Preview Sidebar */}
                                <div className="lg:col-span-1">
                                    <div className="sticky top-24 space-y-4">
                                        <h3 className="font-bold text-gray-800">Campaign Preview</h3>
                                        <p className="text-xs text-gray-500 -mt-2">How it will appear</p>

                                        <div className="bg-white border border-gray-100 rounded-3xl shadow-lg overflow-hidden max-w-sm mx-auto">
                                            <div className="relative h-48">
                                                {formData.basicInfo.coverImage ? (
                                                    <img src={formData.basicInfo.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                                        <FaImages size={48} />
                                                    </div>
                                                )}
                                                <div className="absolute top-4 left-4 flex gap-2">
                                                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                        {formData.basicInfo.category || 'Category'}
                                                    </span>
                                                    {formData.basicInfo.isFeatured && (
                                                        <span className="bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-4">
                                                <h4 className="font-bold text-gray-800 text-lg line-clamp-2">
                                                    {formData.basicInfo.title || 'Build a School in Rural Telangana'}
                                                </h4>
                                                <p className="text-gray-500 text-sm line-clamp-3">
                                                    {formData.basicInfo.subtitle || formData.basicInfo.shortDescription || 'Help us construct a school building for 200+ children in a remote village...'}
                                                </p>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-orange-500 font-bold text-sm">₹{formData.funds.raisedAmount || 0}</span>
                                                        <span className="text-gray-400 text-[10px]">of ₹{formData.funds.targetAmount || 0}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-orange-500"
                                                            style={{ width: `${Math.min(100, (Number(formData.funds.raisedAmount) / Number(formData.funds.targetAmount || 1)) * 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-medium text-left">
                                                        {Math.round((Number(formData.funds.raisedAmount) / Number(formData.funds.targetAmount || 1)) * 100)}% funded
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-[10px] text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <FaUsers />
                                                        <span>{formData.basicInfo.location || 'Komarolu, Telangana'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="bg-gray-100 px-2 py-0.5 rounded">{formData.basicInfo.deadline || '2025-03-31'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Videos Tab */}
                        {activeTab === 'videos' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                                                    <FaVideo />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800">Video Gallery</h3>
                                                    <p className="text-xs text-gray-500">Add event & campaign videos</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => addToArray('videos', { url: '', title: '', thumbnail: '' })}
                                                className="flex items-center gap-1 px-4 py-2 border border-orange-200 text-orange-500 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors"
                                            >
                                                <FaPlus size={12} /> Add Video
                                            </button>
                                        </div>

                                        <div className="p-6 space-y-6">
                                            {formData.videos.length === 0 ? (
                                                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                                    <FaVideo className="text-4xl text-gray-300 mx-auto mb-3" />
                                                    <p className="text-gray-500 text-sm">No videos yet. Add YouTube or other video links.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {formData.videos.map((video, index) => (
                                                        <div key={index} className="bg-gray-50 p-6 rounded-2xl space-y-4 border border-gray-100 relative group">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFromArray('videos', index)}
                                                                className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                            >
                                                                <FaTrash size={14} />
                                                            </button>

                                                            <div className="space-y-4 pr-8 text-left">
                                                                <div>
                                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Video Title</label>
                                                                    <input
                                                                        type="text"
                                                                        value={video.title}
                                                                        onChange={(e) => updateArrayItem('videos', index, 'title', e.target.value)}
                                                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                                        placeholder="Campaign Launch"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Video URL (YouTube, Vimeo, etc.)</label>
                                                                    <input
                                                                        type="text"
                                                                        value={video.url}
                                                                        onChange={(e) => updateArrayItem('videos', index, 'url', e.target.value)}
                                                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                                        placeholder="https://www.youtube.com/watch?v=example"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Thumbnail URL (optional)</label>
                                                                    <input
                                                                        type="text"
                                                                        value={video.thumbnail}
                                                                        onChange={(e) => updateArrayItem('videos', index, 'thumbnail', e.target.value)}
                                                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                                        placeholder="https://images.unsplash.com/..."
                                                                    />
                                                                </div>
                                                                {video.thumbnail && (
                                                                    <div className="mt-2 rounded-xl overflow-hidden h-32 w-48 border border-gray-100 bg-white">
                                                                        <img src={video.thumbnail} alt="Video Thumbnail" className="w-full h-full object-cover" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Preview Sidebar */}
                                <div className="lg:col-span-1">
                                    <div className="sticky top-24 space-y-4">
                                        <h3 className="font-bold text-gray-800">Campaign Preview</h3>
                                        <p className="text-xs text-gray-500 -mt-2">How it will appear</p>

                                        <div className="bg-white border border-gray-100 rounded-3xl shadow-lg overflow-hidden max-w-sm mx-auto">
                                            <div className="relative h-48">
                                                {formData.basicInfo.coverImage ? (
                                                    <img src={formData.basicInfo.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                                        <FaImages size={48} />
                                                    </div>
                                                )}
                                                <div className="absolute top-4 left-4 flex gap-2">
                                                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                        {formData.basicInfo.category || 'Category'}
                                                    </span>
                                                    {formData.basicInfo.isFeatured && (
                                                        <span className="bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-4">
                                                <h4 className="font-bold text-gray-800 text-lg line-clamp-2">
                                                    {formData.basicInfo.title || 'Build a School in Rural Telangana'}
                                                </h4>
                                                <p className="text-gray-500 text-sm line-clamp-3">
                                                    {formData.basicInfo.subtitle || formData.basicInfo.shortDescription || 'Help us construct a school building for 200+ children in a remote village...'}
                                                </p>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-orange-500 font-bold text-sm">₹{formData.funds.raisedAmount || 0}</span>
                                                        <span className="text-gray-400 text-[10px]">of ₹{formData.funds.targetAmount || 0}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-orange-500"
                                                            style={{ width: `${Math.min(100, (Number(formData.funds.raisedAmount) / Number(formData.funds.targetAmount || 1)) * 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-medium text-left">
                                                        {Math.round((Number(formData.funds.raisedAmount) / Number(formData.funds.targetAmount || 1)) * 100)}% funded
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-[10px] text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <FaUsers />
                                                        <span>{formData.basicInfo.location || 'Komarolu, Telangana'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="bg-gray-100 px-2 py-0.5 rounded">{formData.basicInfo.deadline || '2025-03-31'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Donor Wall Tab */}
                        {activeTab === 'donorWall' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                                                <FaHeart size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-800">Donor Wall Settings</h2>
                                                <p className="text-gray-500">Configure donor visibility & recognition</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Enable Donor Wall */}
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div>
                                                    <h4 className="font-bold text-gray-800">Enable Donor Wall</h4>
                                                    <p className="text-xs text-gray-500">Show a wall of donors on the campaign page</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={formData.donorWall.showDonorWall}
                                                        onChange={(e) => handleChange('donorWall', 'showDonorWall', e.target.checked)}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                                </label>
                                            </div>

                                            {/* Show Donor Names */}
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div>
                                                    <h4 className="font-bold text-gray-800">Show Donor Names</h4>
                                                    <p className="text-xs text-gray-500">Display names of donors (opt-in only)</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={formData.donorWall.showDonorNames}
                                                        onChange={(e) => handleChange('donorWall', 'showDonorNames', e.target.checked)}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                                </label>
                                            </div>

                                            {/* Show Donation Amounts */}
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div>
                                                    <h4 className="font-bold text-gray-800">Show Donation Amounts</h4>
                                                    <p className="text-xs text-gray-500">Display the amount each donor contributed</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={formData.donorWall.showDonationAmounts}
                                                        onChange={(e) => handleChange('donorWall', 'showDonationAmounts', e.target.checked)}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                                </label>
                                            </div>

                                            {/* Minimum Amount */}
                                            <div className="pt-4">
                                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                                    Minimum Amount to Display (₹)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.donorWall.minAmountToDisplay}
                                                    onChange={(e) => handleChange('donorWall', 'minAmountToDisplay', e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                                    placeholder="500"
                                                />
                                                <p className="mt-2 text-xs text-gray-400">Only show donors who contributed at least this amount</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview Sidebar */}
                                <div className="lg:col-span-1">
                                    <div className="sticky top-24 space-y-4">
                                        <h3 className="font-bold text-gray-800">Campaign Preview</h3>
                                        <p className="text-xs text-gray-500 -mt-2">How it will appear</p>

                                        <div className="bg-white border border-gray-100 rounded-3xl shadow-lg overflow-hidden max-w-sm mx-auto">
                                            <div className="relative h-48">
                                                {formData.basicInfo.coverImage ? (
                                                    <img src={formData.basicInfo.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                                        <FaImages size={48} />
                                                    </div>
                                                )}
                                                <div className="absolute top-4 left-4 flex gap-2">
                                                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                        {formData.basicInfo.category || 'Category'}
                                                    </span>
                                                    {formData.basicInfo.isFeatured && (
                                                        <span className="bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-4">
                                                <h4 className="font-bold text-gray-800 text-lg line-clamp-2">
                                                    {formData.basicInfo.title || 'Build a School in Rural Telangana'}
                                                </h4>
                                                <p className="text-gray-500 text-sm line-clamp-3">
                                                    {formData.basicInfo.subtitle || formData.basicInfo.shortDescription || 'Help us construct a school building for 200+ children in a remote village...'}
                                                </p>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-orange-500 font-bold text-sm">₹{formData.funds.raisedAmount || 0}</span>
                                                        <span className="text-gray-400 text-[10px]">of ₹{formData.funds.targetAmount || 0}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-orange-500"
                                                            style={{ width: `${Math.min(100, (Number(formData.funds.raisedAmount) / Number(formData.funds.targetAmount || 1)) * 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-medium text-left">
                                                        {Math.round((Number(formData.funds.raisedAmount) / Number(formData.funds.targetAmount || 1)) * 100)}% funded
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-[10px] text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <FaUsers />
                                                        <span>{formData.basicInfo.location || 'Komarolu, Telangana'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="bg-gray-100 px-2 py-0.5 rounded">{formData.basicInfo.deadline || '2025-03-31'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Contact Tab */}
                        {activeTab === 'contact' && (
                            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 space-y-6">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                                        <FaEnvelope size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Contact Information</h3>
                                        <p className="text-xs text-gray-500">How donors can reach you</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                            <input
                                                type="email"
                                                value={formData.contact.email}
                                                onChange={(e) => handleChange('contact', 'email', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                placeholder="contact@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                                            <input
                                                type="tel"
                                                value={formData.contact.phone}
                                                onChange={(e) => handleChange('contact', 'phone', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                                        <textarea
                                            value={formData.contact.address}
                                            onChange={(e) => handleChange('contact', 'address', e.target.value)}
                                            rows="3"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                                            placeholder="Full address..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Action Buttons */}
                        <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
                            <div className="flex gap-2">
                                {TABS.findIndex(t => t.id === activeTab) > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab(TABS[TABS.findIndex(t => t.id === activeTab) - 1].id)}
                                        className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>
                                )}
                                {TABS.findIndex(t => t.id === activeTab) < TABS.length - 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab(TABS[TABS.findIndex(t => t.id === activeTab) + 1].id)}
                                        className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                    >
                                        Next
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <Link
                                    to="/donation-kit-management"
                                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-8 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 font-medium shadow-md ${loading ? 'opacity-70' : ''}`}
                                >
                                    <FaSave />
                                    {loading ? 'Saving...' : isEditMode ? 'Update Campaign' : 'Create Campaign'}
                                </button>
                            </div>
                        </div>
                    </div>


                </form>
            </div>
        </div>
    );
};

export default CampaignForm;

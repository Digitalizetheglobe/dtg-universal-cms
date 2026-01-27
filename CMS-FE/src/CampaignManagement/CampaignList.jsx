import React, { useState, useEffect } from 'react';
import { FaBullseye, FaEdit, FaTrash, FaPlus, FaArrowLeft, FaEye, FaStar, FaMapMarkerAlt, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = 'http://localhost:5000/api';

const CampaignList = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/campaign-management`);
            if (response.data.success) {
                setCampaigns(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            toast.error('Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this campaign?')) {
            try {
                await axios.delete(`${API_BASE_URL}/campaign-management/${id}`);
                toast.success('Campaign deleted successfully');
                fetchCampaigns();
            } catch (error) {
                console.error('Error deleting campaign:', error);
                toast.error('Failed to delete campaign');
            }
        }
    };

    const handleToggleFeatured = async (id) => {
        try {
            const response = await axios.patch(`${API_BASE_URL}/campaign-management/${id}/featured`);
            if (response.data.success) {
                toast.success(response.data.message);
                fetchCampaigns();
            }
        } catch (error) {
            console.error('Error toggling featured:', error);
            toast.error('Failed to update featured status');
        }
    };

    const calculateProgress = (raised, target) => {
        if (!target || target === 0) return 0;
        return Math.min((raised / target) * 100, 100);
    };

    const formatAmount = (amount) => {
        const lakhs = Number(amount) / 100000;
        return lakhs.toFixed(2) + 'L';
    };

    const formatAmountShort = (amount) => {
        const lakhs = Number(amount) / 100000;
        return lakhs.toFixed(1) + 'L';
    };

    const calculateDaysLeft = (deadline) => {
        if (!deadline) return 0;
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    // Calculate summary statistics
    const totalCampaigns = campaigns.length;
    const totalRaised = campaigns.reduce((sum, campaign) => sum + (campaign.raisedAmount || 0), 0);
    const totalSupporters = campaigns.reduce((sum, campaign) => sum + (campaign.supporters || 0), 0);
    const featuredCount = campaigns.filter(campaign => campaign.featured).length;

    return (
        <div className="p-8 bg-[#F5F5DC] min-h-screen">
            <ToastContainer />
            {/* Header Section */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/donation-kit-management')}
                    className="flex items-center text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                >
                    <FaArrowLeft className="mr-2" /> Back to Dashboard
                </button>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Campaign Management</h1>
                <p className="text-gray-600 text-lg">Manage "Choose a Cause - Make Real Impact" campaigns.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="text-3xl font-bold text-gray-800 mb-2">{totalCampaigns}</div>
                    <div className="text-sm text-gray-500">Total Campaigns</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="text-3xl font-bold text-gray-800 mb-2">₹{formatAmountShort(totalRaised)}</div>
                    <div className="text-sm text-gray-500">Total Raised</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="text-3xl font-bold text-gray-800 mb-2">{totalSupporters}</div>
                    <div className="text-sm text-gray-500">Total Supporters</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="text-3xl font-bold text-gray-800 mb-2">{featuredCount}</div>
                    <div className="text-sm text-gray-500">Featured</div>
                </div>
            </div>

            {/* Add New Campaign Button */}
            <div className="flex justify-end mb-6">
                <Link
                    to="/campaign-management/campaigns/create"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg flex items-center font-medium transition-colors shadow-sm"
                >
                    <FaPlus className="mr-2" /> Add New Campaign
                </Link>
            </div>

            {/* Campaign List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading campaigns...</div>
                ) : campaigns.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                        No campaigns found. Create one to get started!
                    </div>
                ) : (
                    campaigns.map((campaign) => {
                        const progress = calculateProgress(campaign.raisedAmount || 0, campaign.goalAmount || 0);
                        const daysLeft = calculateDaysLeft(campaign.deadline);
                        return (
                            <div
                                key={campaign._id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 transition-all hover:shadow-md"
                            >
                                {/* Left Side - Image with Tags */}
                                <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0">
                                    <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100">
                                        {campaign.heroImage ? (
                                            <img
                                                src={campaign.heroImage}
                                                alt={campaign.campaignTitle}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-gray-400 text-sm">No Image</span>
                                            </div>
                                        )}
                                        {/* Category Tag */}
                                        {campaign.category && (
                                            <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                                {campaign.category}
                                            </div>
                                        )}
                                        {/* Featured Tag */}
                                        {campaign.featured && (
                                            <div className="absolute top-3 right-3 bg-yellow-400 text-gray-800 px-2 py-1 rounded-md text-xs font-bold">
                                                ★ Featured
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Middle Section - Campaign Details */}
                                <div className="flex-grow flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{campaign.campaignTitle}</h3>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {campaign.shortDescription || campaign.subtitle || 'No description available'}
                                        </p>

                                        {/* Funding Progress */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-orange-500 font-bold text-lg">
                                                    ₹{formatAmountShort(campaign.raisedAmount || 0)} raised
                                                </span>
                                                <span className="text-gray-500 text-sm">
                                                    of ₹{formatAmountShort(campaign.goalAmount || 0)}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className="bg-orange-500 h-2.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Metadata */}
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                            {campaign.supporters > 0 && (
                                                <span>{campaign.supporters} supporters</span>
                                            )}
                                            <span>{daysLeft} days left</span>
                                            {campaign.location && (
                                                <div className="flex items-center gap-1">
                                                    <FaMapMarkerAlt className="text-xs" />
                                                    <span>{campaign.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side - Action Buttons */}
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => navigate(`/campaign-management/campaigns/view/${campaign._id}`)}
                                        className="flex items-center justify-center text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                                    >
                                        <FaEye className="mr-2" /> View
                                    </button>
                                    <Link
                                        to={`/campaign-management/campaigns/edit/${campaign._id}`}
                                        className="flex items-center justify-center text-blue-600 border border-blue-300 px-4 py-2 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors"
                                    >
                                        <FaEdit className="mr-2" /> Edit
                                    </Link>
                                    <button
                                        onClick={() => handleToggleFeatured(campaign._id)}
                                        className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            campaign.featured
                                                ? 'text-yellow-600 border border-yellow-300 hover:bg-yellow-50'
                                                : 'text-gray-600 border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <FaStar className={`mr-2 ${campaign.featured ? 'text-yellow-500' : ''}`} />
                                        {campaign.featured ? 'Unfeature' : 'Feature'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(campaign._id)}
                                        className="flex items-center justify-center text-red-600 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors"
                                    >
                                        <FaTrash className="mr-2" /> Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default CampaignList;


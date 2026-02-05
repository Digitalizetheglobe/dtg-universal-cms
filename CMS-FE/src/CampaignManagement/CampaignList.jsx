import React, { useState, useEffect } from 'react';
import { FaBullseye, FaEdit, FaTrash, FaPlus, FaArrowLeft, FaEye, FaToggleOn, FaToggleOff, FaUsers } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { API_BASE_URL_API } from '../api/api';

const CampaignList = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL_API}/campaign-management`);
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
                await axios.delete(`${API_BASE_URL_API}/campaign-management/${id}`);
                toast.success('Campaign deleted successfully');
                fetchCampaigns();
            } catch (error) {
                console.error('Error deleting campaign:', error);
                toast.error('Failed to delete campaign');
            }
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            await axios.patch(`${API_BASE_URL_API}/campaign-management/${id}/toggle-status`, {
                isActive: !currentStatus
            });
            toast.success(`Campaign ${currentStatus ? 'deactivated' : 'activated'} successfully`);
            fetchCampaigns();
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Failed to update campaign status');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const calculateProgress = (raised, target) => {
        if (!target || target === 0) return 0;
        return Math.min((raised / target) * 100, 100);
    };

    const calculateStats = () => {
        const total = campaigns.length;
        const totalRaised = campaigns.reduce((sum, camp) => sum + (camp.funds?.raisedAmount || 0), 0);
        // Mocking supporters count for now as it might not be in the basic list response
        const totalSupporters = campaigns.reduce((sum, camp) => sum + (camp.impact?.beneficiaries ? parseInt(camp.impact.beneficiaries) || 0 : 0), 0);
        const featured = campaigns.filter(c => c.basicInfo?.isActive).length;

        return { total, totalRaised, totalSupporters, featured };
    };

    const stats = calculateStats();

    const formatAmount = (amount) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
        return `₹${amount}`;
    };

    return (
        <div className="p-8 bg-[#F9F9F9] min-h-screen font-sans">
            <ToastContainer />

            {/* Breadcrumb & Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center text-sm text-gray-500">
                    <button onClick={() => navigate('/donation-kit-management')} className="hover:text-gray-700 flex items-center">
                        <FaArrowLeft className="mr-1" /> Back to Dashboard
                    </button>
                    <span className="mx-2">/</span>
                    <span className="text-orange-500 font-semibold">Campaigns</span>
                </div>
                <Link
                    to="/campaign-management/create"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-medium flex items-center shadow-sm transition-all"
                >
                    <FaPlus className="mr-2" /> New Campaign
                </Link>
            </div>

            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-800">Campaign Management</h1>
                <p className="text-gray-500 mt-1">Manage "Choose a Cause - Make Real Impact" campaigns</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.total}</h3>
                    <p className="text-gray-500 text-sm">Total Campaigns</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-3xl font-bold text-orange-500 mb-1">{formatAmount(stats.totalRaised)}</h3>
                    <p className="text-gray-500 text-sm">Total Raised</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.totalSupporters}</h3>
                    <p className="text-gray-500 text-sm">Total Supporters</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-3xl font-bold text-orange-500 mb-1">{stats.featured}</h3>
                    <p className="text-gray-500 text-sm">Active / Featured</p>
                </div>
            </div>

            {/* Campaign List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading campaigns...</p>
                </div>
            ) : campaigns.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <FaBullseye className="text-5xl text-gray-200 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700">No campaigns found</h3>
                    <p className="text-gray-500 mt-2 mb-6">Create your first campaign to start making an impact.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {campaigns.map((campaign) => {
                        const progress = calculateProgress(campaign.funds?.raisedAmount, campaign.funds?.targetAmount);
                        return (
                            <div key={campaign._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col md:flex-row gap-6 transition-shadow hover:shadow-md">
                                {/* Image Section */}
                                <div className="md:w-64 h-48 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden relative group">
                                    <img
                                        src={campaign.basicInfo?.coverImage || 'https://via.placeholder.com/400x300?text=No+Image'}
                                        alt={campaign.basicInfo?.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {/* Labels */}
                                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                                        {campaign.basicInfo?.category && (
                                            <span className="bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                                                {campaign.basicInfo.category}
                                            </span>
                                        )}
                                    </div>
                                    {campaign.basicInfo?.isActive && (
                                        <div className="absolute top-3 right-3">
                                            <span className="bg-yellow-400 text-xs font-bold px-2 py-1 rounded-md flex items-center text-gray-800">
                                                <span className="mr-1">★</span> Featured
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content Section */}
                                <div className="flex-grow flex flex-col justify-between py-1">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 mb-2 leading-tight">
                                            {campaign.basicInfo?.title}
                                        </h2>
                                        <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                                            {campaign.basicInfo?.shortDescription}
                                        </p>

                                        {/* Progress Bar */}
                                        <div className="mb-2">
                                            <div className="flex justify-between items-end mb-1">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-lg font-bold text-orange-500">
                                                        {formatAmount(campaign.funds?.raisedAmount)}
                                                    </span>
                                                    <span className="text-xs text-gray-500 font-medium">raised</span>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    of {formatAmount(campaign.funds?.targetAmount)} goal
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-orange-500 rounded-full"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Meta Info */}
                                    <div className="flex items-center gap-6 mt-4 text-xs text-gray-400 font-medium border-t border-gray-100 pt-3">
                                        <div className="flex items-center gap-1.5">
                                            <FaUsers className="text-gray-400" />
                                            <span>
                                                <strong className="text-gray-600 font-semibold">{campaign.impact?.impactMetrics?.length || 0}</strong> Supporters
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-gray-400">📅</span>
                                            <span>
                                                <strong className="text-gray-600 font-semibold">Active</strong>
                                            </span>
                                        </div>
                                        {/* <div className="flex items-center gap-1.5">
                                            <span className="text-gray-400">📍</span>
                                            <span>Global</span>
                                        </div> */}
                                    </div>
                                </div>

                                {/* Actions Section */}
                                <div className="flex md:flex-col gap-3 md:border-l md:border-gray-100 md:pl-6 justify-center md:justify-start">
                                    <button
                                        onClick={() => navigate(`/campaign-management/view/${campaign._id}`)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50 transition-colors w-full md:w-32"
                                    >
                                        <FaEye /> View
                                    </button>
                                    <button
                                        onClick={() => navigate(`/campaign-management/edit/${campaign._id}`)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full md:w-32"
                                    >
                                        <FaEdit /> Edit
                                    </button>
                                    <button
                                        onClick={() => toggleStatus(campaign._id, campaign.basicInfo?.isActive)}
                                        className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-colors w-full md:w-32 ${campaign.basicInfo?.isActive
                                            ? 'text-yellow-600 border-yellow-400 hover:bg-yellow-50'
                                            : 'text-gray-500 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-sm">★</span> {campaign.basicInfo?.isActive ? 'Unfeature' : 'Feature'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(campaign._id)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors w-full md:w-32"
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CampaignList;

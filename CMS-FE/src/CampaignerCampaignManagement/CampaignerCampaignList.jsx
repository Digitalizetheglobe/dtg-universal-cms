import React, { useState, useEffect } from 'react';
import { FaUsers, FaEdit, FaTrash, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { API_BASE_URL_API } from '../api/api';

const CampaignerCampaignList = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL_API}/campaigner-campaign-management`);
            if (response.data.success) {
                setCampaigns(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            toast.error('Failed to load campaigner campaigns');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this campaign?')) {
            try {
                await axios.delete(`${API_BASE_URL_API}/campaigner-campaign-management/${id}`);
                toast.success('Campaigner campaign deleted successfully');
                fetchCampaigns();
            } catch (error) {
                console.error('Error deleting campaign:', error);
                toast.error('Failed to delete campaigner campaign');
            }
        }
    };

    const calculateProgress = (raised, target) => {
        if (!target || target === 0) return 0;
        return Math.min((raised / target) * 100, 100);
    };

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
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Campaigner Campaigns</h1>
                <p className="text-gray-600 text-lg">Manage personal fundraising campaigns.</p>
            </div>

            {/* Add New Campaign Button */}
            <div className="flex justify-end mb-6">
                <Link
                    to="/campaigner-campaign-management/campaigns/create"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg flex items-center font-medium transition-colors shadow-sm"
                >
                    <FaPlus className="mr-2" /> Add New Campaign
                </Link>
            </div>

            {/* List Section */}
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading campaigns...</div>
                ) : campaigns.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                        No campaigner campaigns found. Create one to get started!
                    </div>
                ) : (
                    campaigns.map((campaign) => {
                        const progress = calculateProgress(campaign.raisedAmount || 0, campaign.targetAmount || 0);
                        return (
                            <div
                                key={campaign._id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 transition-all hover:shadow-md"
                            >
                                {/* Campaign Image with Category Tag */}
                                <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0">
                                    <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100">
                                        {campaign.campaignImage ? (
                                            <img
                                                src={campaign.campaignImage}
                                                alt={campaign.fundraiserName}
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
                                            <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-md text-sm font-semibold">
                                                {campaign.category}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-grow flex flex-col justify-between">
                                    <div>
                                        {/* Campaigner Info */}
                                        <div className="flex items-center gap-3 mb-4">
                                            {campaign.fundraiserPhoto ? (
                                                <img
                                                    src={campaign.fundraiserPhoto}
                                                    alt={campaign.fundraiserName}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/50?text=' + (campaign.fundraiserName?.charAt(0) || 'U');
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg border-2 border-gray-200">
                                                    {campaign.fundraiserName?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-lg">{campaign.fundraiserName}</h3>
                                                <p className="text-gray-500 text-sm">{campaign.location}</p>
                                            </div>
                                        </div>

                                        {/* Campaign Story */}
                                        <p className="text-gray-700 mb-4 line-clamp-2">
                                            {campaign.campaignStory}
                                        </p>

                                        {/* Funding Progress */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-orange-500 font-bold text-xl">
                                                    ₹{Number(campaign.raisedAmount || 0).toLocaleString()}
                                                </span>
                                                <span className="text-gray-500 text-sm">
                                                    of ₹{Number(campaign.targetAmount || 0).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className="bg-orange-500 h-2.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Supporters Count */}
                                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                                            <FaUsers className="text-gray-400" />
                                            <span>{campaign.supportersCount || 0} supporters</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                        <Link
                                            to={`/campaigner-campaign-management/campaigns/edit/${campaign._id}`}
                                            className="flex items-center text-orange-500 border border-orange-500 px-4 py-2 rounded-lg hover:bg-orange-50 text-sm font-medium transition-colors"
                                        >
                                            <FaEdit className="mr-2" /> Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(campaign._id)}
                                            className="flex items-center text-red-500 border border-red-500 px-4 py-2 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors"
                                        >
                                            <FaTrash className="mr-2" /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default CampaignerCampaignList;


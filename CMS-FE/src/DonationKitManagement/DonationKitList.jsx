import React, { useState, useEffect } from 'react';
import { FaHeart, FaEdit, FaTrash, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { API_BASE_URL_API, normalizeImageUrl } from '../api/api';

const DonationKitList = () => {
    const [kits, setKits] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchKits();
    }, []);

    const fetchKits = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL_API}/donation-kit-management`);
            if (response.data.success) {
                setKits(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching kits:', error);
            toast.error('Failed to load donation kits');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this kit?')) {
            try {
                await axios.delete(`${API_BASE_URL_API}/donation-kit-management/${id}`);
                toast.success('Donation kit deleted successfully');
                fetchKits();
            } catch (error) {
                console.error('Error deleting kit:', error);
                toast.error('Failed to delete donation kit');
            }
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <ToastContainer />
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <button
                        onClick={() => navigate('/donation-kit-management')}
                        className="flex items-center text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">Donation Kits</h1>
                    <p className="text-gray-500 mt-1">Manage the "Donate to a Cause" section kits</p>
                </div>
                <Link
                    to="/donation-kit-management/kits/create"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg flex items-center font-medium transition-colors shadow-sm"
                >
                    <FaPlus className="mr-2" /> Add New Kit
                </Link>
            </div>

            {/* List Section */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading kits...</div>
                ) : kits.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                        No donation kits found. Create one to get started!
                    </div>
                ) : (
                    kits.map((kit) => (
                        <div key={kit._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-6 transition-all hover:shadow-md">
                            {/* Image */}
                            <div className="w-full md:w-64 h-48 md:h-auto flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                    src={normalizeImageUrl(kit.img)}
                                    alt={kit.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=No+Image' }}
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-grow flex flex-col justify-between py-2">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FaHeart className="text-orange-500" />
                                            <h3 className="text-lg font-bold text-gray-800">{kit.title}</h3>
                                        </div>

                                        <div className="flex gap-2">
                                            <Link
                                                to={`/donation-kit-management/kits/edit/${kit._id}`}
                                                className="flex items-center text-orange-500 border border-orange-500 px-3 py-1.5 rounded-lg hover:bg-orange-50 text-sm font-medium transition-colors"
                                            >
                                                <FaEdit className="mr-2" /> Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(kit._id)}
                                                className="flex items-center text-red-500 border border-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors"
                                            >
                                                <FaTrash className="mr-2" /> Delete
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                                        {kit.description}
                                    </p>
                                </div>

                                <div className="flex items-center gap-6 text-sm">
                                    <span className="text-orange-500 font-bold text-lg">
                                        ₹{kit.price.toLocaleString()}
                                    </span>
                                    <span className="text-gray-400">|</span>
                                    <span className="text-gray-500">
                                        {kit.included ? kit.included.length : 0} items
                                    </span>
                                    <span className="text-gray-400">|</span>
                                    <span className="text-gray-500">
                                        Kit: {kit.highlight}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DonationKitList;

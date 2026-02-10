import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaSave, FaHeart, FaInfoCircle, FaDollarSign, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

const DonorWallForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        amount: '',
        donationDate: new Date().toISOString().split('T')[0],
        campaign: 'General Donation',
        tier: '',
        isVisible: true,
        isAnonymous: false,
        showAmount: true,
        message: '',
        avatarColor: '#FF6B6B',
        address: '',
        panNumber: '',
        notes: ''
    });

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [error, setError] = useState('');

    const tiers = ['Platinum', 'Gold', 'Silver', 'Bronze', 'Supporter'];
    const avatarColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'];

    useEffect(() => {
        if (isEditMode) {
            fetchDonorDetails();
        }
    }, [id]);

    const fetchDonorDetails = async () => {
        try {
            setFetchLoading(true);
            const response = await fetch(`https://api.harekrishnavidya.org/api/donor-wall/${id}`);

            if (!response.ok) {
                throw new Error('Failed to fetch donor details');
            }

            const result = await response.json();
            const donor = result.data;

            setFormData({
                fullName: donor.fullName,
                email: donor.email,
                phone: donor.phone || '',
                amount: donor.amount,
                donationDate: donor.donationDate ? donor.donationDate.split('T')[0] : new Date().toISOString().split('T')[0],
                campaign: donor.campaign || 'General Donation',
                tier: donor.tier || '',
                isVisible: donor.isVisible,
                isAnonymous: donor.isAnonymous,
                showAmount: donor.showAmount,
                message: donor.message || '',
                avatarColor: donor.avatarColor || '#FF6B6B',
                address: donor.address || '',
                panNumber: donor.panNumber || '',
                notes: donor.notes || ''
            });
        } catch (err) {
            console.error('Error fetching donor:', err);
            setError('Failed to load donor details');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation
        if (!formData.fullName.trim()) {
            setError('Full name is required');
            setLoading(false);
            return;
        }

        if (!formData.email.trim()) {
            setError('Email is required');
            setLoading(false);
            return;
        }

        if (!formData.amount || formData.amount <= 0) {
            setError('Please enter a valid donation amount');
            setLoading(false);
            return;
        }

        try {
            const url = isEditMode
                ? `https://api.harekrishnavidya.org/api/donor-wall/${id}`
                : 'https://api.harekrishnavidya.org/api/donor-wall';

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'add'} donor`);
            }

            const result = await response.json();
            console.log(`Donor ${isEditMode ? 'updated' : 'added'} successfully:`, result);

            // Navigate back to donor wall list
            navigate('/donor-wall');
        } catch (err) {
            console.error('Error saving donor:', err);
            setError(err.message || `Failed to ${isEditMode ? 'update' : 'add'} donor. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const names = name.trim().split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    if (fetchLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/donor-wall')}
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <FaArrowLeft className="text-xl" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <FaHeart className="text-red-500" />
                            {isEditMode ? 'Edit Donor' : 'Add New Donor'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {isEditMode ? 'Update donor details' : 'Add a new donor to the wall'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => navigate('/donor-wall')}
                        className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                        <FaSave />
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Donor Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FaInfoCircle className="text-orange-500" />
                                <h2 className="text-base sm:text-lg font-semibold text-gray-800">Donor Information</h2>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Basic details about the donor</p>

                            <div className="space-y-4">
                                {/* Full Name */}


                                {/* Email and Phone */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Rajesh Kumar"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="rajesh@example.com"
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                                                required
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Donation Details */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FaDollarSign className="text-orange-500" />
                                <h2 className="text-base sm:text-lg font-semibold text-gray-800">Donation Details</h2>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Information about the donation</p>

                            <div className="space-y-4">
                                {/* Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Donation Amount (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        placeholder="10000"
                                        min="0"
                                        step="100"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Tier will be auto-assigned: Platinum (₹1L+), Gold (₹50K+), Silver (₹25K+), Bronze (₹10K+)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Campaign
                                    </label>

                                    <select
                                        name="campaign"
                                        value={formData.campaign}
                                        onChange={handleInputChange}
                                        className="w-full cursor-pointer px-4 py-2.5 border border-gray-300 rounded-lg
               focus:ring-2 focus:ring-orange-500 focus:border-transparent
               outline-none transition-all text-sm sm:text-base bg-white"
                                    >
                                        <option value="">Select campaign (optional)</option>
                                        <option value="Build a School">Build a School</option>
                                        <option value="Education Support">Education Support</option>
                                        <option value="Nutritious Meals">Nutritious Meals</option>
                                        <option value="Learning Center">Learning Center</option>
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Skill Development">Skill Development</option>
                                    </select>
                                </div>

                                {/* Auto-Calculate Tier Toggle */}
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-800">Auto-Calculate Tier</h3>
                                            <p className="text-xs text-gray-500 mt-1">Automatically assign tier based on amount</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!formData.tier}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData(prev => ({ ...prev, tier: '' }));
                                                    } else {
                                                        setFormData(prev => ({ ...prev, tier: 'Platinum' }));
                                                    }
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                        </label>
                                    </div>

                                    {/* Manual Tier Selection */}
                                    {formData.tier && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-800 mb-3">
                                                Donor Tier
                                            </label>

                                            {/* Tier Dropdown Display */}
                                            <div className="relative mb-4">
                                                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        <span className="text-gray-800 font-medium">
                                                            {formData.tier}
                                                            <span className="text-gray-400 ml-2">
                                                                ({formData.tier === 'Platinum' ? '₹100K+' :
                                                                    formData.tier === 'Gold' ? '₹50K+' :
                                                                        formData.tier === 'Silver' ? '₹15K+' :
                                                                            formData.tier === 'Bronze' ? '₹5K+' :
                                                                                'Any'})
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Tier Selection Buttons */}
                                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                                {[
                                                    { name: 'Platinum', threshold: '₹100K+', color: 'purple' },
                                                    { name: 'Gold', threshold: '₹50K+', color: 'yellow' },
                                                    { name: 'Silver', threshold: '₹15K+', color: 'gray' },
                                                    { name: 'Bronze', threshold: '₹5K+', color: 'orange' },
                                                    { name: 'Supporter', threshold: 'Any', color: 'blue' }
                                                ].map((tier) => (
                                                    <button
                                                        key={tier.name}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, tier: tier.name }))}
                                                        className={`p-3 rounded-lg border-2 transition-all text-center ${formData.tier === tier.name
                                                            ? tier.color === 'purple' ? 'border-purple-500 bg-purple-50' :
                                                                tier.color === 'yellow' ? 'border-yellow-500 bg-yellow-50' :
                                                                    tier.color === 'gray' ? 'border-gray-400 bg-gray-50' :
                                                                        tier.color === 'orange' ? 'border-orange-500 bg-orange-50' :
                                                                            'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <div className={`text-sm font-semibold ${formData.tier === tier.name
                                                            ? tier.color === 'purple' ? 'text-purple-700' :
                                                                tier.color === 'yellow' ? 'text-yellow-700' :
                                                                    tier.color === 'gray' ? 'text-gray-700' :
                                                                        tier.color === 'orange' ? 'text-orange-700' :
                                                                            'text-blue-700'
                                                            : 'text-gray-700'
                                                            }`}>
                                                            {tier.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">{tier.threshold}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* Donor Message */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Donor Message</h2>
                            <p className="text-xs sm:text-sm text-gray-500 mb-4">Optional message to display on the wall</p>

                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                placeholder="Happy to support this noble cause..."
                                rows="4"
                                maxLength="500"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none text-sm sm:text-base"
                            />
                            <p className="text-xs text-gray-500 mt-2">{formData.message.length}/500 characters</p>
                        </div>
                    </div>

                    {/* Right Column - Card Preview */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 sticky top-6">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Card Preview</h2>
                            <p className="text-xs sm:text-sm text-gray-500 mb-4">How it will appear on the wall</p>

                            {/* Preview Card */}
                            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 text-center">
                                {/* Avatar */}
                                <div
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg"
                                    style={{ backgroundColor: formData.avatarColor }}
                                >
                                    {getInitials(formData.fullName)}
                                </div>

                                {/* Name */}
                                <h3 className="font-bold text-gray-800 text-base sm:text-lg mb-1">
                                    {formData.isAnonymous ? 'Anonymous Donor' : (formData.fullName || 'Donor Name')}
                                </h3>

                                {/* Amount */}
                                {formData.showAmount && formData.amount && (
                                    <div className="text-orange-600 font-semibold text-lg sm:text-xl mb-2">
                                        ₹{parseInt(formData.amount).toLocaleString('en-IN')}
                                    </div>
                                )}

                                {/* Tier Badge */}
                                {formData.tier && (
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${formData.tier === 'Platinum' ? 'bg-purple-100 text-purple-700' :
                                        formData.tier === 'Gold' ? 'bg-yellow-100 text-yellow-700' :
                                            formData.tier === 'Silver' ? 'bg-gray-200 text-gray-700' :
                                                formData.tier === 'Bronze' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-blue-100 text-blue-700'
                                        }`}>
                                        {formData.tier}
                                    </span>
                                )}

                                {/* Message */}
                                {formData.message && (
                                    <p className="text-xs sm:text-sm text-gray-600 italic line-clamp-3 mb-3">
                                        "{formData.message}"
                                    </p>
                                )}

                                {/* Date */}
                                <p className="text-xs text-gray-500">
                                    {new Date(formData.donationDate).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonorWallForm;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaHeart,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaRupeeSign,
  FaEdit,
  FaSave,
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaCreditCard,
  FaCalendarAlt,
  FaFileAlt
} from 'react-icons/fa';

const DonationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    amount: '',
    currency: 'INR',
    description: '',
    campaign: '',
    isAnonymous: false,
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      fetchDonation();
    }
  }, [id]);

  const fetchDonation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.harekrishnavidya.org/api/donations/${id}`);
      const data = await response.json();

      if (data.success) {
        setFormData({
          donorName: data.donation.donorName || '',
          donorEmail: data.donation.donorEmail || '',
          donorPhone: data.donation.donorPhone || '',
          amount: data.donation.amount || '',
          currency: data.donation.currency || 'INR',
          description: data.donation.description || '',
          campaign: data.donation.campaign || '',
          isAnonymous: data.donation.isAnonymous || false,
          notes: data.donation.notes || ''
        });
      }
    } catch (error) {
      console.error('Error fetching donation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.donorName.trim() && !formData.isAnonymous) {
      newErrors.donorName = 'Donor name is required';
    }

    if (!formData.donorEmail.trim()) {
      newErrors.donorEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.donorEmail)) {
      newErrors.donorEmail = 'Please enter a valid email';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      if (isEditing) {
        // Update existing donation notes
        const response = await fetch(`https://api.harekrishnavidya.org/api/donations/${id}/notes`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notes: formData.notes
          })
        });

        if (response.ok) {
          navigate('/donation-management');
        }
      } else {
        // Create new donation order
        const response = await fetch('https://api.harekrishnavidya.org/api/donations/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            notes: formData.description
          })
        });

        const data = await response.json();

        if (data.success) {
          // Here you would typically redirect to Razorpay payment page
          // For now, we'll just show a success message
          alert('Donation order created successfully! Payment integration would be handled here.');
          navigate('/donation-management');
        }
      }
    } catch (error) {
      console.error('Error saving donation:', error);
      setErrors({ submit: 'Failed to save donation. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/donation-management')}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            {isEditing ? <FaEdit className="w-6 h-6 text-white" /> : <FaHeart className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Donation' : 'Create New Donation'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update donation details and notes' : 'Set up a new donation campaign'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Donor Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaUser className="w-5 h-5 text-blue-600" />
                    Donor Information
                  </h3>

                  <div className="space-y-4">
                    {/* Anonymous Toggle */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isAnonymous"
                        name="isAnonymous"
                        checked={formData.isAnonymous}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="isAnonymous" className="text-sm font-medium text-gray-700">
                        Anonymous Donation
                      </label>
                    </div>

                    {/* Donor Name */}
                    {!formData.isAnonymous && (
                      <div>
                        <label htmlFor="donorName" className="block text-sm font-medium text-gray-700 mb-2">
                          Donor Name *
                        </label>
                        <div className="relative">
                          <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            id="donorName"
                            name="donorName"
                            value={formData.donorName}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.donorName ? 'border-red-300' : 'border-gray-300'
                              }`}
                            placeholder="Enter donor name"
                          />
                        </div>
                        {errors.donorName && (
                          <p className="mt-1 text-sm text-red-600">{errors.donorName}</p>
                        )}
                      </div>
                    )}

                    {/* Email */}
                    <div>
                      <label htmlFor="donorEmail" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="email"
                          id="donorEmail"
                          name="donorEmail"
                          value={formData.donorEmail}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.donorEmail ? 'border-red-300' : 'border-gray-300'
                            }`}
                          placeholder="Enter email address"
                        />
                      </div>
                      {errors.donorEmail && (
                        <p className="mt-1 text-sm text-red-600">{errors.donorEmail}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="donorPhone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="tel"
                          id="donorPhone"
                          name="donorPhone"
                          value={formData.donorPhone}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Donation Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaRupeeSign className="w-5 h-5 text-green-600" />
                    Donation Details
                  </h3>

                  <div className="space-y-4">
                    {/* Amount */}
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                        Donation Amount *
                      </label>
                      <div className="relative">
                        <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="number"
                          id="amount"
                          name="amount"
                          value={formData.amount}
                          onChange={handleInputChange}
                          min="1"
                          step="1"
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.amount ? 'border-red-300' : 'border-gray-300'
                            }`}
                          placeholder="Enter amount"
                        />
                      </div>
                      {errors.amount && (
                        <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                      )}
                    </div>

                    {/* Currency */}
                    <div>
                      <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        id="currency"
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="INR">Indian Rupee (₹)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>

                    {/* Campaign */}
                    <div>
                      <label htmlFor="campaign" className="block text-sm font-medium text-gray-700 mb-2">
                        Campaign
                      </label>
                      <input
                        type="text"
                        id="campaign"
                        name="campaign"
                        value={formData.campaign}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter campaign name"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter donation description"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaFileAlt className="w-5 h-5 text-purple-600" />
                    Additional Notes
                  </h3>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add any additional notes or comments"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/donation-management')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    {isEditing ? <FaSave className="w-4 h-4" /> : <FaHeart className="w-4 h-4" />}
                    {isEditing ? 'Update Donation' : 'Create Donation'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DonationForm;

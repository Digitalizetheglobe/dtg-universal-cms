import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaHeart, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaRupeeSign, 
  FaEdit, 
  FaArrowLeft,
  FaCalendarAlt,
  FaCreditCard,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaExclamationTriangle,
  FaFileAlt,
  FaEye,
  FaEyeSlash,
  FaDownload,
  FaPrint
} from 'react-icons/fa';

const DonationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchDonation();
  }, [id]);

  const fetchDonation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://dtg-universal-cms.onrender.com/api/donations/${id}`);
      const data = await response.json();

      if (data.success) {
        setDonation(data.donation);
        setNotes(data.donation.notes || '');
      }
    } catch (error) {
      console.error('Error fetching donation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotes = async () => {
    try {
      const response = await fetch(`https://dtg-universal-cms.onrender.com/api/donations/${id}/notes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        setEditingNotes(false);
        fetchDonation(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating notes:', error);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <FaClock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <FaTimesCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FaExclamationTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'card':
        return <FaCreditCard className="w-4 h-4" />;
      case 'upi':
        return <FaRupeeSign className="w-4 h-4" />;
      case 'netbanking':
        return <FaCreditCard className="w-4 h-4" />;
      default:
        return <FaCreditCard className="w-4 h-4" />;
    }
  };

  const printDonation = () => {
    window.print();
  };

  const downloadReceipt = () => {
    // Implementation for downloading receipt
    console.log('Downloading receipt...');
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

  if (!donation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="text-center py-12">
          <FaHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Donation not found</h3>
          <p className="text-gray-600">The donation you're looking for doesn't exist.</p>
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
            Back to Donations
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <FaHeart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Donation Details</h1>
              <p className="text-gray-600">Payment ID: {donation.razorpayPaymentId}</p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={printDonation}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200"
            >
              <FaPrint className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={downloadReceipt}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <FaDownload className="w-4 h-4" />
              Download Receipt
            </button>
            {/* <button
              onClick={() => navigate(`/donation-management/edit/${id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <FaEdit className="w-4 h-4" />
              Edit
            </button> */}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Status Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Payment Status</h2>
                {getStatusIcon(donation.paymentStatus)}
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(donation.paymentStatus)}`}>
                  {donation.paymentStatus.toUpperCase()}
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(donation.amount)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Payment Method</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    {getPaymentMethodIcon(donation.paymentMethod)}
                    {donation.paymentMethod ? donation.paymentMethod.toUpperCase() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Currency</p>
                  <p className="font-medium text-gray-900">{donation.currency}</p>
                </div>
              </div>
            </div>

            {/* Donor Information */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser className="w-5 h-5 text-blue-600" />
                Donor Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Donor Name</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <FaUser className="w-4 h-4 text-gray-400" />
                    {donation.isAnonymous ? 'Anonymous Donor' : donation.donorName}
                    {donation.isAnonymous && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        Anonymous
                      </span>
                    )}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email Address</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <FaEnvelope className="w-4 h-4 text-gray-400" />
                    {donation.donorEmail}
                  </p>
                </div>
                
                {donation.donorPhone && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      <FaPhone className="w-4 h-4 text-gray-400" />
                      {donation.donorPhone}
                    </p>
                  </div>
                )}
                
                {donation.campaign && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Campaign</p>
                    <p className="font-medium text-gray-900">{donation.campaign}</p>
                  </div>
                )}
              </div>
              
              {donation.description && (
                <div className="mt-6">
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-gray-900">{donation.description}</p>
                </div>
              )}
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaCreditCard className="w-5 h-5 text-green-600" />
                Payment Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment ID</p>
                  <p className="font-mono text-sm text-gray-900">{donation.razorpayPaymentId}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order ID</p>
                  <p className="font-mono text-sm text-gray-900">{donation.razorpayOrderId}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Receipt</p>
                  <p className="font-mono text-sm text-gray-900">{donation.receipt || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Created At</p>
                  <p className="text-gray-900 flex items-center gap-2">
                    <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                    {formatDate(donation.createdAt)}
                  </p>
                </div>
              </div>
              
              {donation.metadata && (
                <div className="mt-6">
                  <p className="text-sm text-gray-600 mb-2">Additional Payment Info</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-xs text-gray-700 overflow-x-auto">
                      {JSON.stringify(donation.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notes Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaFileAlt className="w-5 h-5 text-purple-600" />
                  Notes
                </h3>
                <button
                  onClick={() => setEditingNotes(!editingNotes)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {editingNotes ? 'Cancel' : 'Edit'}
                </button>
              </div>
              
              {editingNotes ? (
                <div className="space-y-3">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add notes about this donation..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateNotes}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingNotes(false);
                        setNotes(donation.notes || '');
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {notes ? (
                    <p className="text-gray-900 whitespace-pre-wrap">{notes}</p>
                  ) : (
                    <p className="text-gray-500 italic">No notes added yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                {/* <button
                  onClick={() => navigate(`/donation-management/edit/${id}`)}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <FaEdit className="w-4 h-4" />
                  Edit Donation
                </button> */}
                
                <button
                  onClick={downloadReceipt}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <FaDownload className="w-4 h-4" />
                  Download Receipt
                </button>
                
                <button
                  onClick={printDonation}
                  className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <FaPrint className="w-4 h-4" />
                  Print Details
                </button>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Timeline</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Payment Completed</p>
                    <p className="text-sm text-gray-600">{formatDate(donation.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Order Created</p>
                    <p className="text-sm text-gray-600">{formatDate(donation.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationView;

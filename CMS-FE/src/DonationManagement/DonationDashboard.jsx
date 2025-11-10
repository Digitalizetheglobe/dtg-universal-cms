import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaHeart, 
  FaUsers, 
  FaRupeeSign, 
  FaChartLine, 
  FaPlus, 
  FaSync, 
  FaEye,
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaDownload
} from 'react-icons/fa';
import DonationList from './DonationList';
import DonationStats from './DonationStats';
import DonationChart from './DonationChart';
import { FcMoneyTransfer } from "react-icons/fc";
import { FcOk } from "react-icons/fc";
import { getApiUrl } from '../api/api';

const DonationDashboard = () => {
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    avgAmount: 0,
    completedDonations: 0,
    completedAmount: 0
  });
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [syncMessage, setSyncMessage] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await fetch(getApiUrl('api/donations/stats'));
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch recent donations
      const donationsResponse = await fetch(getApiUrl('api/donations?limit=5'));
      const donationsData = await donationsResponse.json();
      
      if (donationsData.success) {
        setRecentDonations(donationsData.donations);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sync donations from Razorpay
  const syncFromRazorpay = async () => {
    try {
      setSyncing(true);
      setSyncMessage('Syncing donations from Razorpay...');
      
      const response = await fetch(getApiUrl('api/donations/sync-razorpay'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSyncMessage(`✅ Successfully synced ${data.syncedCount} new donations from Razorpay!`);
        // Refresh dashboard data after sync
        await fetchDashboardData();
      } else {
        setSyncMessage('❌ Failed to sync from Razorpay');
      }
    } catch (error) {
      console.error('Error syncing from Razorpay:', error);
      setSyncMessage('❌ Error syncing from Razorpay');
    } finally {
      setSyncing(false);
      // Clear message after 5 seconds
      setTimeout(() => setSyncMessage(''), 5000);
    }
  };

  const handleDownloadDonationFormData = async () => {
    try {
      setExporting(true);
      setExportMessage('Preparing donation form data export...');

      const response = await fetch(getApiUrl('api/donations/export/form-submissions'), {
        method: 'GET',
        headers: {
          Accept: 'text/csv'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download donation form data');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const disposition = response.headers.get('Content-Disposition');
      let filename = `donation-form-submissions-${new Date().toISOString().split('T')[0]}.csv`;

      if (disposition) {
        const match = disposition.match(/filename="?([^";]+)"?/i);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setExportMessage('✅ Donation form data download started.');
    } catch (error) {
      console.error('Error downloading donation form data:', error);
      setExportMessage('❌ Failed to download donation form data.');
    } finally {
      setExporting(false);
      setTimeout(() => setExportMessage(''), 5000);
    }
  };

  // Get detailed Razorpay payment info
  const getRazorpayPaymentDetails = async (paymentId) => {
    try {
      const response = await fetch(getApiUrl(`api/donations/payment/${paymentId}`));
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      return null;
    }
  };

  // Test Razorpay connection
  const testRazorpayConnection = async () => {
    try {
      setSyncing(true);
      setSyncMessage('Testing Razorpay connection...');
      
      const response = await fetch(getApiUrl('api/donations/test-connection'));
      const data = await response.json();
      
      if (data.success) {
        setSyncMessage(`✅ Razorpay connected! Found ${data.recentPayments} recent payments`);
        console.log('Razorpay connection test:', data);
      } else {
        setSyncMessage(`❌ Razorpay connection failed: ${data.message}`);
        console.error('Razorpay connection test failed:', data);
      }
    } catch (error) {
      console.error('Error testing Razorpay connection:', error);
      setSyncMessage('❌ Error testing Razorpay connection');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(''), 8000);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Donation Management
            </h1>
            <p className="text-gray-600">
              Manage and track all your donation campaigns and contributions
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200"
            >
              <FaSync className="w-4 h-4" />
              Refresh
            </button>
            {/* <button
              onClick={testRazorpayConnection}
              disabled={syncing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-all duration-200 border ${
                syncing 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:shadow-md'
              }`}
            >
              <FaEye className="w-4 h-4" />
              Test Connection
            </button> */}
            {/* <button
              onClick={syncFromRazorpay}
              disabled={syncing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-all duration-200 border ${
                syncing 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:shadow-md'
              }`}
            >
              <FaSync className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Razorpay'}
            </button> */}
            <button
              onClick={handleDownloadDonationFormData}
              disabled={exporting}
              className={[
                'flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-all duration-200 border',
                exporting
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:shadow-md'
              ].join(' ')}
            >
              <FaDownload className="w-4 h-4" />
              {exporting ? 'Preparing...' : 'Donation Form Data'}
            </button>
            <Link
              to="/donation-management/create"
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:from-blue-700 hover:to-indigo-700"
            >
              <FaPlus className="w-4 h-4" />
              New Donation
            </Link>
          </div>
        </div>
      </div>

      {/* Sync Message */}
      {syncMessage && (
        <div className={`mb-6 p-4 rounded-lg border ${
          syncMessage.includes('✅') 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{syncMessage}</span>
          </div>
        </div>
      )}

      {exportMessage && (
        <div className={`mb-6 p-4 rounded-lg border ${
          exportMessage.includes('✅')
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{exportMessage}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Donations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaHeart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">
              +{stats.completedDonations} completed
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalAmount)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaRupeeSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">
              {formatCurrency(stats.completedAmount)} received
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Donation</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.avgAmount)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FaChartLine className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-purple-600 font-medium">
              Per donation
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Donors</p>
              <p className="text-2xl font-bold text-gray-900">
                {recentDonations.length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <FaUsers className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-orange-600 font-medium">
              Recent donors
            </span>
          </div>
        </div>
      </div>

      {/* Razorpay Integration Status */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Razorpay Integration Status
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600 font-medium">Connected</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaSync className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Last Sync</p>
                <p className="text-sm text-gray-900">
                  {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaHeart className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-sm text-gray-900">{stats.totalDonations}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaRupeeSign className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-sm text-gray-900">{formatCurrency(stats.totalAmount)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: FaChartLine },
              { id: 'donations', label: 'All Donations', icon: FaHeart },
              { id: 'analytics', label: 'Analytics', icon: FaChartLine },
              { id: 'razorpay', label: 'Razorpay Data', icon: FaSync }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Chart */}
              {/* <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Donation Trends
                </h3>
                <DonationChart />
              </div> */}

              {/* Recent Donations */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Donations
                  </h3>
                  <button
              onClick={handleDownloadDonationFormData}
              disabled={exporting}
              className={[
                'flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-all duration-200 border',
                exporting
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:shadow-md'
              ].join(' ')}
            >
              <FaDownload className="w-4 h-4" />
              {exporting ? 'Preparing...' : 'Donation Form Data'}
            </button>
            <Link
                    to="/donation-management/list"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View all
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentDonations.map((donation) => (
                    <div
                      key={donation._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FcOk className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {donation.isAnonymous ? 'Anonymous Donor' : donation.donorName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {donation.donorEmail}
                          </p>
                          {donation.razorpayPaymentId && (
                            <p className="text-xs text-gray-500">
                              Payment ID: {donation.razorpayPaymentId}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(donation.amount)}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(donation.paymentStatus)}`}>
                          {donation.paymentStatus}
                        </span>
                        {donation.paymentMethod && (
                          <p className="text-xs text-gray-500 mt-1">
                            {donation.paymentMethod.toUpperCase()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'donations' && (
            <DonationList />
          )}

          {activeTab === 'analytics' && (
            <DonationStats />
          )}

          {activeTab === 'razorpay' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Razorpay Payment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-medium text-gray-900 mb-2">Payment Methods</h4>
                    <div className="space-y-2">
                      {Object.entries(recentDonations.reduce((acc, donation) => {
                        const method = donation.paymentMethod || 'Unknown';
                        acc[method] = (acc[method] || 0) + 1;
                        return acc;
                      }, {})).map(([method, count]) => (
                        <div key={method} className="flex justify-between text-sm">
                          <span className="text-gray-600">{method.toUpperCase()}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-medium text-gray-900 mb-2">Recent Payment IDs</h4>
                    <div className="space-y-2">
                      {recentDonations.slice(0, 5).map((donation) => (
                        <div key={donation._id} className="text-sm">
                          <span className="text-gray-600">{donation.razorpayPaymentId}</span>
                          <span className="float-right text-green-600 font-medium">
                            {formatCurrency(donation.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Sync Controls
                  </h3>
                  <button
                    onClick={syncFromRazorpay}
                    disabled={syncing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      syncing 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <FaSync className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Sync from Razorpay'}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{stats.totalDonations}</p>
                    <p className="text-sm text-gray-600">Total Payments</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{stats.completedDonations}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalAmount)}</p>
                    <p className="text-sm text-gray-600">Total Amount</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationDashboard;





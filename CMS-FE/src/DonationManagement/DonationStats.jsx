import React, { useState, useEffect } from 'react';
import { 
  FaChartBar, 
  FaChartLine, 
  FaChartPie, 
  FaCalendarAlt,
  FaRupeeSign,
  FaUsers,
  FaHeart,
  FaDownload
} from 'react-icons/fa';

const DonationStats = () => {
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    avgAmount: 0,
    completedDonations: 0,
    completedAmount: 0,
    statusBreakdown: [],
    monthlyBreakdown: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (dateRange.startDate) queryParams.append('startDate', dateRange.startDate);
      if (dateRange.endDate) queryParams.append('endDate', dateRange.endDate);

      const response = await fetch(`http://localhost:5000/api/donations/stats?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
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
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      case 'refunded':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      case 'refunded':
        return 'text-gray-600';
      default:
        return 'text-blue-600';
    }
  };

  const exportStats = () => {
    // Implementation for exporting statistics
    console.log('Exporting stats...');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Donation Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into your donation performance</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={exportStats}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <FaDownload className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Donations</p>
              <p className="text-3xl font-bold">{stats.totalDonations}</p>
            </div>
            <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
              <FaHeart className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-blue-100 text-sm">
              {stats.completedDonations} completed
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Amount</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <div className="p-3 bg-green-400 bg-opacity-30 rounded-full">
              <FaRupeeSign className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-100 text-sm">
              {formatCurrency(stats.completedAmount)} received
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Average Donation</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.avgAmount)}</p>
            </div>
            <div className="p-3 bg-purple-400 bg-opacity-30 rounded-full">
              <FaChartBar className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-purple-100 text-sm">
              Per donation
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Success Rate</p>
              <p className="text-3xl font-bold">
                {stats.totalDonations > 0 
                  ? Math.round((stats.completedDonations / stats.totalDonations) * 100)
                  : 0}%
              </p>
            </div>
            <div className="p-3 bg-orange-400 bg-opacity-30 rounded-full">
              <FaChartLine className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-orange-100 text-sm">
              Completed payments
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Payment Status Breakdown</h3>
            <FaChartPie className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {stats.statusBreakdown.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(item._id)}`}></div>
                  <span className="font-medium text-gray-900 capitalize">{item._id}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{item.count}</p>
                  <p className="text-sm text-gray-600">{formatCurrency(item.amount)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pie Chart Visualization */}
          <div className="mt-6">
            <div className="flex justify-center">
              <div className="relative w-32 h-32">
                {stats.statusBreakdown.map((item, index) => {
                  const total = stats.statusBreakdown.reduce((sum, i) => sum + i.count, 0);
                  const percentage = total > 0 ? (item.count / total) * 100 : 0;
                  const rotation = stats.statusBreakdown
                    .slice(0, index)
                    .reduce((sum, i) => sum + (i.count / total) * 360, 0);
                  
                  return (
                    <div
                      key={item._id}
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(${getStatusColor(item._id)} ${rotation}deg, transparent ${rotation}deg ${rotation + (percentage * 3.6)}deg)`
                      }}
                    ></div>
                  );
                })}
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-900">
                    {stats.totalDonations}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
            <FaChartLine className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {stats.monthlyBreakdown.slice(0, 6).map((item) => {
              const monthName = new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short' });
              const maxAmount = Math.max(...stats.monthlyBreakdown.map(i => i.amount));
              const percentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
              
              return (
                <div key={`${item._id.year}-${item._id.month}`} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">{monthName} {item._id.year}</span>
                    <span className="text-gray-600">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{item.count} donations</span>
                    <span>{percentage.toFixed(1)}% of peak</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaUsers className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Donor Engagement</h4>
            <p className="text-sm text-gray-600">
              {stats.totalDonations > 0 ? Math.round(stats.avgAmount) : 0} average donation amount
            </p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaHeart className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Success Rate</h4>
            <p className="text-sm text-gray-600">
              {stats.totalDonations > 0 
                ? Math.round((stats.completedDonations / stats.totalDonations) * 100)
                : 0}% payment success rate
            </p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaCalendarAlt className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Monthly Growth</h4>
            <p className="text-sm text-gray-600">
              {stats.monthlyBreakdown.length > 1 
                ? `${stats.monthlyBreakdown.length} months of data`
                : 'Insufficient data for trend analysis'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationStats;

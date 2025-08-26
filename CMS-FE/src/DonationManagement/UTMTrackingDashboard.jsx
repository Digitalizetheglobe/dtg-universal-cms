import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, 
  FaSearch, 
  FaUndo, 
  FaDownload, 
  FaSignOutAlt,
  FaChartBar,
  FaUsers,
  FaMoneyBillWave,
  FaFilter,
  FaGlobe
} from 'react-icons/fa';
import { MdCampaign } from 'react-icons/md';

const UTMTrackingDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [summaryStats, setSummaryStats] = useState({
    sevaNames: [],
    utmSources: [],
    utmMediums: [],
    utmCampaigns: []
  });

  useEffect(() => {
    fetchDonations();
  }, []);

  useEffect(() => {
    filterDonations();
  }, [donations, startDate, endDate, searchTerm]);

  useEffect(() => {
    calculateSummaryStats();
  }, [filteredDonations]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/donations?limit=1000');
      const data = await response.json();
      
      if (data.success) {
        setDonations(data.donations);
        setFilteredDonations(data.donations);
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDonations = () => {
    let filtered = [...donations];

    // Filter by date range
    if (startDate || endDate) {
      filtered = filtered.filter(donation => {
        const donationDate = new Date(donation.createdAt);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && end) {
          return donationDate >= start && donationDate <= end;
        } else if (start) {
          return donationDate >= start;
        } else if (end) {
          return donationDate <= end;
        }
        return true;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(donation => 
        donation.donorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.donorEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.sevaName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.campaign?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.donorPhone?.includes(searchTerm)
      );
    }

    setFilteredDonations(filtered);
  };

  const calculateSummaryStats = () => {
    const stats = {
      sevaNames: {},
      utmSources: {},
      utmMediums: {},
      utmCampaigns: {}
    };

    filteredDonations.forEach(donation => {
      // Seva Names
      const sevaName = donation.sevaName || 'Unknown';
      if (!stats.sevaNames[sevaName]) {
        stats.sevaNames[sevaName] = { count: 0, amount: 0 };
      }
      stats.sevaNames[sevaName].count++;
      stats.sevaNames[sevaName].amount += donation.amount || 0;

      // UTM Source (using campaign as source for now)
      const utmSource = donation.campaign || 'Direct';
      if (!stats.utmSources[utmSource]) {
        stats.utmSources[utmSource] = { count: 0, amount: 0 };
      }
      stats.utmSources[utmSource].count++;
      stats.utmSources[utmSource].amount += donation.amount || 0;

      // UTM Medium (using payment method as medium)
      const utmMedium = donation.paymentMethod || 'Direct';
      if (!stats.utmMediums[utmMedium]) {
        stats.utmMediums[utmMedium] = { count: 0, amount: 0 };
      }
      stats.utmMediums[utmMedium].count++;
      stats.utmMediums[utmMedium].amount += donation.amount || 0;

      // UTM Campaign (using donor phone as campaign)
      const utmCampaign = donation.donorPhone || 'Direct';
      if (!stats.utmCampaigns[utmCampaign]) {
        stats.utmCampaigns[utmCampaign] = { count: 0, amount: 0 };
      }
      stats.utmCampaigns[utmCampaign].count++;
      stats.utmCampaigns[utmCampaign].amount += donation.amount || 0;
    });

    setSummaryStats({
      sevaNames: Object.entries(stats.sevaNames).map(([name, data]) => ({
        name,
        count: data.count,
        amount: data.amount
      })),
      utmSources: Object.entries(stats.utmSources).map(([source, data]) => ({
        source,
        count: data.count,
        amount: data.amount
      })),
      utmMediums: Object.entries(stats.utmMediums).map(([medium, data]) => ({
        medium,
        count: data.count,
        amount: data.amount
      })),
      utmCampaigns: Object.entries(stats.utmCampaigns).map(([campaign, data]) => ({
        campaign,
        count: data.count,
        amount: data.amount
      }))
    });
  };

  const resetDates = () => {
    setStartDate('');
    setEndDate('');
  };

  const exportData = (type) => {
    const dataToExport = type === 'success' 
      ? filteredDonations.filter(d => d.paymentStatus === 'completed')
      : filteredDonations.filter(d => d.paymentStatus !== 'completed');

    const csvContent = convertToCSV(dataToExport);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_donations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    const headers = [
      'S.No', 'Source', 'Medium', 'Campaign', 'Seva Name', 'Seva Amount', 
      'RazorPay Order ID', 'Phone Number', 'Receipt Number', 'Date', 'Status'
    ];

    const csvData = data.map((donation, index) => [
      index + 1,
      donation.campaign || 'Direct',
      donation.paymentMethod || 'Direct',
      donation.donorPhone || 'Direct',
      donation.sevaName || 'Unknown',
      donation.amount || 0,
      donation.razorpayOrderId || 'N/A',
      donation.donorPhone || 'N/A',
      donation.razorpayPaymentId || 'N/A',
      new Date(donation.createdAt).toLocaleDateString('en-GB'),
      donation.paymentStatus || 'pending'
    ]);

    return [headers, ...csvData].map(row => row.join(',')).join('\n');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const SummaryCard = ({ title, icon: Icon, data, totalCount, totalAmount }) => (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Icon className="mr-2 text-blue-600" />
          {title}
        </h3>
        <div className="text-right">
          <div className="text-sm text-gray-600">{totalCount} sevas</div>
          <div className="text-lg font-bold text-green-600">{formatCurrency(totalAmount)}</div>
        </div>
      </div>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded cursor-pointer hover:bg-blue-50 transition-colors">
            <span className="text-sm font-medium text-gray-700">{item.name || item.source || item.medium || item.campaign}</span>
            <div className="text-right">
              <div className="text-xs text-gray-600">{item.count} sevas</div>
              <div className="text-sm font-semibold text-green-600">{formatCurrency(item.amount)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading donation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaChartBar className="mr-3 text-blue-600" />
              HK Vidya UTM Tracking Dashboard
            </h1>
            <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Date Range and Search Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2 text-gray-500" />
              <label className="mr-2 text-sm font-medium text-gray-700">Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2 text-gray-500" />
              <label className="mr-2 text-sm font-medium text-gray-700">End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => filterDonations()}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaSearch className="mr-2" />
              Search
            </button>
            <button
              onClick={resetDates}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <FaUndo className="mr-2" />
              Reset Dates
            </button>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <SummaryCard
            title="Seva Names List"
            icon={FaMoneyBillWave}
            data={summaryStats.sevaNames}
            totalCount={summaryStats.sevaNames.reduce((sum, item) => sum + item.count, 0)}
            totalAmount={summaryStats.sevaNames.reduce((sum, item) => sum + item.amount, 0)}
          />
          <SummaryCard
            title="UTM Source List"
            icon={FaGlobe}
            data={summaryStats.utmSources}
            totalCount={summaryStats.utmSources.reduce((sum, item) => sum + item.count, 0)}
            totalAmount={summaryStats.utmSources.reduce((sum, item) => sum + item.amount, 0)}
          />
          <SummaryCard
            title="UTM Medium List"
            icon={FaFilter}
            data={summaryStats.utmMediums}
            totalCount={summaryStats.utmMediums.reduce((sum, item) => sum + item.count, 0)}
            totalAmount={summaryStats.utmMediums.reduce((sum, item) => sum + item.amount, 0)}
          />
          <SummaryCard
            title="UTM Campaign List"
            icon={MdCampaign}
            data={summaryStats.utmCampaigns}
            totalCount={summaryStats.utmCampaigns.reduce((sum, item) => sum + item.count, 0)}
            totalAmount={summaryStats.utmCampaigns.reduce((sum, item) => sum + item.amount, 0)}
          />
        </div>

        {/* Export Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => exportData('success')}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaDownload className="mr-2" />
            Export Donation Success Data
          </button>
          <button
            onClick={() => exportData('failed')}
            className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FaDownload className="mr-2" />
            Export Donation Failed Data
          </button>
        </div>

        {/* Detailed Donation Records */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-5xl mx-auto">
          <div className="bg-green-600 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">Detailed Donation Records</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medium</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seva Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seva Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RazorPay Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDonations.map((donation, index) => (
                  <tr key={donation._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.campaign || 'Direct'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.paymentMethod || 'Direct'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.donorPhone || 'Direct'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.sevaName || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{formatCurrency(donation.amount || 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{donation.razorpayOrderId || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.donorPhone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{donation.razorpayPaymentId || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(donation.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        donation.paymentStatus === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : donation.paymentStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {donation.paymentStatus || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredDonations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No donations found for the selected criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UTMTrackingDashboard;

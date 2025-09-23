import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaSearch,
  FaUndo,
  FaDownload,
  FaChartBar,
  FaUsers,
  FaMoneyBillWave,
  FaFilter,
  FaGlobe,
} from "react-icons/fa";
import { MdCampaign } from "react-icons/md";
import Sidebar from "../components/Sidebar";

const UTMTrackingDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDefaultView, setIsDefaultView] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [summaryStats, setSummaryStats] = useState({
    sevaNames: [],
    utmSources: [],
    utmMediums: [],
    utmCampaigns: [],
    totalAmount: 0,
    totalDonations: 0,
  });
  const [activeFilters, setActiveFilters] = useState({
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    sevaName: null,
  });

  useEffect(() => {
    fetchDonations();
    // Set default view to today's date
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  }, []);

  useEffect(() => {
    filterDonations();
  }, [donations, startDate, endDate, searchTerm, activeFilters]);

  useEffect(() => {
    calculateSummaryStats();
  }, [filteredDonations]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      // Fetch all donations by setting a very high limit
      const response = await fetch(
        //https://api.harekrishnavidya.org
        "https://api.harekrishnavidya.org/api/donations?limit=10000"
      );
      const data = await response.json();

      if (data.success) {
        console.log(`Fetched ${data.donations.length} donations from database`);
        setDonations(data.donations);
        setFilteredDonations(data.donations);
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
    } finally {
      setLoading(false);
    }
  };

  const syncDonationsFromRazorpay = async () => {
    try {
      setSyncing(true);
      console.log("Syncing donations from Razorpay...");
      
      // Use current date range or default to last 7 days
      const syncStartDate = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const syncEndDate = endDate || new Date().toISOString().split('T')[0];
      
      console.log(`Syncing from ${syncStartDate} to ${syncEndDate}`);
      
      const response = await fetch(
        `https://api.harekrishnavidya.org/api/donations/sync-razorpay?startDate=${syncStartDate}&endDate=${syncEndDate}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`Sync completed: ${data.syncedCount} new donations synced`);
        console.log('Status breakdown:', data.statusBreakdown);
        
        const statusText = data.statusBreakdown ? 
          `\nPayment Status Breakdown:\n• Captured: ${data.statusBreakdown.captured}\n• Failed: ${data.statusBreakdown.failed}\n• Authorized: ${data.statusBreakdown.authorized}\n• Other: ${data.statusBreakdown.other}` : '';
        
        alert(`Sync completed!\n${data.syncedCount} new donations synced from Razorpay\n${data.skippedCount} donations already existed\n\nTotal found: ${data.totalFound}${statusText}`);
        
        // Refresh the donations list
        await fetchDonations();
      } else {
        console.error("Sync failed:", data.message);
        alert(`Sync failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error syncing donations:", error);
      alert("Error syncing donations. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const forceSyncAllPayments = async () => {
    try {
      setSyncing(true);
      console.log("Force syncing ALL payments from Razorpay...");
      
      // Use current date range or default to last 7 days
      const syncStartDate = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const syncEndDate = endDate || new Date().toISOString().split('T')[0];
      
      console.log(`Force syncing from ${syncStartDate} to ${syncEndDate}`);
      
      const response = await fetch(
        `https://api.harekrishnavidya.org/api/donations/force-sync-razorpay?startDate=${syncStartDate}&endDate=${syncEndDate}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`Force sync completed: ${data.syncedCount} new, ${data.updatedCount} updated`);
        console.log('Status breakdown:', data.statusBreakdown);
        
        const statusText = data.statusBreakdown ? 
          `\nPayment Status Breakdown:\n• Captured: ${data.statusBreakdown.captured}\n• Failed: ${data.statusBreakdown.failed}\n• Authorized: ${data.statusBreakdown.authorized}\n• Other: ${data.statusBreakdown.other}` : '';
        
        alert(`Force sync completed!\n${data.syncedCount} new donations created\n${data.updatedCount} existing donations updated\n\nTotal found: ${data.totalFound}${statusText}`);
        
        // Refresh the donations list
        await fetchDonations();
      } else {
        console.error("Force sync failed:", data.message);
        alert(`Force sync failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error force syncing donations:", error);
      alert("Error force syncing donations. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const filterDonations = () => {
    let filtered = [...donations];

    // Filter by date range
    if (startDate || endDate) {
      filtered = filtered.filter((donation) => {
        // Convert donation date to YYYY-MM-DD format for comparison
        const donationDate = new Date(donation.createdAt);
        const donationDateStr = donationDate.toISOString().split('T')[0];
        
        // Handle date range filtering
        if (startDate && endDate) {
          // Both start and end date provided
          return donationDateStr >= startDate && donationDateStr <= endDate;
        } else if (startDate) {
          // Only start date provided
          return donationDateStr >= startDate;
        } else if (endDate) {
          // Only end date provided
          return donationDateStr <= endDate;
        }
        return true;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (donation) =>
          donation.donorName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          donation.donorEmail
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          donation.sevaName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          donation.campaign?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          donation.donorPhone?.includes(searchTerm) ||
          donation.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          donation.village?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          donation.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          donation.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          donation.pinCode?.includes(searchTerm) ||
          donation.panNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by UTM parameters
    if (activeFilters.utmSource) {
      filtered = filtered.filter((donation) => 
        (donation.utmSource || "Direct") === activeFilters.utmSource
      );
    }

    if (activeFilters.utmMedium) {
      filtered = filtered.filter((donation) => 
        (donation.utmMedium || "Direct") === activeFilters.utmMedium
      );
    }

    if (activeFilters.utmCampaign) {
      filtered = filtered.filter((donation) => 
        (donation.utmCampaign || "Direct") === activeFilters.utmCampaign
      );
    }

    if (activeFilters.sevaName) {
      filtered = filtered.filter((donation) => 
        (donation.sevaName || "Unknown") === activeFilters.sevaName
      );
    }

    // Filter out pending donations by default
    filtered = filtered.filter((donation) => 
      donation.paymentStatus !== "pending"
    );

    setFilteredDonations(filtered);
  };

  const calculateSummaryStats = () => {
    const stats = {
      sevaNames: {},
      utmSources: {},
      utmMediums: {},
      utmCampaigns: {},
    };

    let totalAmount = 0;
    let totalDonations = 0;

    filteredDonations.forEach((donation) => {
      const donationAmount = donation.amount || 0;
      totalAmount += donationAmount;
      totalDonations++;

      // Seva Names
      const sevaName = donation.sevaName || "Unknown";
      if (!stats.sevaNames[sevaName]) {
        stats.sevaNames[sevaName] = { count: 0, amount: 0 };
      }
      stats.sevaNames[sevaName].count++;
      stats.sevaNames[sevaName].amount += donationAmount;

      // UTM Source
      const utmSource = donation.utmSource || "Direct";
      if (!stats.utmSources[utmSource]) {
        stats.utmSources[utmSource] = { count: 0, amount: 0 };
      }
      stats.utmSources[utmSource].count++;
      stats.utmSources[utmSource].amount += donationAmount;

      // UTM Medium
      const utmMedium = donation.utmMedium || "Direct";
      if (!stats.utmMediums[utmMedium]) {
        stats.utmMediums[utmMedium] = { count: 0, amount: 0 };
      }
      stats.utmMediums[utmMedium].count++;
      stats.utmMediums[utmMedium].amount += donationAmount;

      // UTM Campaign
      const utmCampaign = donation.utmCampaign || "Direct";
      if (!stats.utmCampaigns[utmCampaign]) {
        stats.utmCampaigns[utmCampaign] = { count: 0, amount: 0 };
      }
      stats.utmCampaigns[utmCampaign].count++;
      stats.utmCampaigns[utmCampaign].amount += donationAmount;
    });

    setSummaryStats({
      sevaNames: Object.entries(stats.sevaNames).map(([name, data]) => ({
        name,
        count: data.count,
        amount: data.amount,
      })),
      utmSources: Object.entries(stats.utmSources).map(([source, data]) => ({
        source,
        count: data.count,
        amount: data.amount,
      })),
      utmMediums: Object.entries(stats.utmMediums).map(([medium, data]) => ({
        medium,
        count: data.count,
        amount: data.amount,
      })),
      utmCampaigns: Object.entries(stats.utmCampaigns).map(
        ([campaign, data]) => ({
          campaign,
          count: data.count,
          amount: data.amount,
        })
      ),
      totalAmount,
      totalDonations,
    });
  };

  const resetDates = () => {
    // Reset to today's date (default view)
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    setSearchTerm("");
    setIsDefaultView(true);
    setActiveFilters({
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      sevaName: null,
    });
  };

  const handleFilterClick = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType] === value ? null : value
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      sevaName: null,
    });
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    setIsDefaultView(false);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    setIsDefaultView(false);
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).filter(value => value !== null).length;
  };

  const exportData = (type) => {
    const dataToExport =
      type === "success"
        ? filteredDonations.filter((d) => d.paymentStatus === "completed")
        : filteredDonations.filter((d) => d.paymentStatus !== "completed");

    const csvContent = convertToCSV(dataToExport);
    
    // Add BOM (Byte Order Mark) for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;
    
    const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_donations_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    const headers = [
      "S.No",
      "Seva Name",
      "Seva Amount",
      "Seva Type",
      "Donor Name",
      "Donor Mobile",
      "Donor Email",
      "Nationality",
      "Need Maha Prasadam",
      "Need 80G",
      "PAN Number",
      "Address",
      "House/Apartment",
      "Village/City",
      "District",
      "State",
      "PIN Code",
      "Landmark",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "RazorPay Order ID",
      "Receipt Number",
      "Payment Method",
      "Date",
      "Status",
    ];

    const csvData = data.map((donation, index) => {
      // Helper function to escape CSV values
      const escapeCSV = (value) => {
        if (value === null || value === undefined) return "N/A";
        const str = String(value);
        // If the value contains comma, newline, or quote, wrap it in quotes and escape internal quotes
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      // Debug log for first few records to check data integrity
      if (index < 3) {
        console.log(`Donation ${index + 1} data:`, {
          sevaName: donation.sevaName,
          donorName: donation.donorName,
          donorPhone: donation.donorPhone,
          address: donation.address,
          wantsMahaPrasadam: donation.wantsMahaPrasadam,
          wants80G: donation.wants80G,
          panNumber: donation.panNumber
        });
      }

      return [
        index + 1,
        escapeCSV(donation.sevaName),
        escapeCSV(donation.amount),
        escapeCSV(donation.sevaType),
        escapeCSV(donation.donorName),
        escapeCSV(donation.donorPhone),
        escapeCSV(donation.donorEmail),
        escapeCSV(donation.donorType),
        donation.wantsMahaPrasadam ? "Yes" : "No",
        donation.wants80G ? "Yes" : "No",
        escapeCSV(donation.panNumber),
        escapeCSV(donation.address),
        escapeCSV(donation.houseApartment),
        escapeCSV(donation.village),
        escapeCSV(donation.district),
        escapeCSV(donation.state),
        escapeCSV(donation.pinCode),
        escapeCSV(donation.landmark),
        escapeCSV(donation.utmSource),
        escapeCSV(donation.utmMedium),
        escapeCSV(donation.utmCampaign),
        escapeCSV(donation.razorpayOrderId),
        escapeCSV(donation.razorpayPaymentId),
        escapeCSV(donation.paymentMethod),
        escapeCSV(new Date(donation.createdAt).toLocaleDateString("en-GB")),
        escapeCSV(donation.paymentStatus),
      ];
    });

    return [headers, ...csvData].map((row) => row.join(",")).join("\n");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const SummaryCard = ({ title, icon: Icon, data, filterType }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3">
        <h3 className="text-lg font-semibold flex items-center">
          <Icon className="mr-2" />
          {title}
        </h3>
      </div>

      {/* Table Content */}
      <div className="max-h-64 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {title.includes("Seva")
                  ? "Seva Name"
                  : title.includes("Source")
                  ? "UTM Source"
                  : title.includes("Medium")
                  ? "UTM Medium"
                  : "UTM Campaign"}
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                No. Sevas
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => {
              const itemValue = item.name || item.source || item.medium || item.campaign;
              const isActive = activeFilters[filterType] === itemValue;
              
              return (
                <tr 
                  key={index} 
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                    isActive ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => handleFilterClick(filterType, itemValue)}
                >
                  <td className="px-4 py-2 text-sm font-medium text-gray-900 flex items-center">
                    {itemValue}
                    {isActive && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600 text-center">
                    {item.count}
                  </td>
                  <td className="px-4 py-2 text-sm font-semibold text-gray-900 text-right">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              );
            })}
            {/* Total Row */}
            <tr className="bg-gray-100 border-t-2 border-gray-300">
              <td className="px-4 py-2 text-sm font-bold text-gray-900">
                Total
              </td>
              <td className="px-4 py-2 text-sm font-bold text-gray-900 text-center">
                {data.reduce((sum, item) => sum + item.count, 0)}
              </td>
              <td className="px-4 py-2 text-sm font-bold text-gray-900 text-right">
                {formatCurrency(data.reduce((sum, item) => sum + item.amount, 0))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading donation data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FaChartBar className="mr-3 text-blue-600" />
                  HK Vidya UTM Tracking Dashboard
                </h1>
                {/* Total Amount Display */}
                <div className="mt-2 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-green-600" />
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(summaryStats.totalAmount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-blue-600" />
                    <span className="text-sm text-gray-600">Total Donations:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {summaryStats.totalDonations}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {getActiveFilterCount() > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {getActiveFilterCount()} filter{getActiveFilterCount() > 1 ? 's' : ''} active
                    </span>
                    <button
                      onClick={clearAllFilters}
                      className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                    >
                      <FaFilter className="w-3 h-3" />
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Date Range and Search Controls */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2 text-gray-500" />
                <label className="mr-2 text-sm font-medium text-gray-700">
                  Start Date:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2 text-gray-500" />
                <label className="mr-2 text-sm font-medium text-gray-700">
                  End Date:
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <FaSearch className="mr-2 text-gray-500" />
                <label className="mr-2 text-sm font-medium text-gray-700">
                  Search:
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, phone, address, PAN..."
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              <button
                onClick={resetDates}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <FaUndo className="mr-2" />
                Reset All
              </button>
              <button
                onClick={syncDonationsFromRazorpay}
                disabled={syncing}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <FaDownload className="mr-2" />
                )}
                {syncing ? 'Syncing...' : 'Sync from Razorpay'}
              </button>
              <button
                onClick={() => {
                  setStartDate('2025-09-21');
                  setEndDate('2025-09-21');
                  syncDonationsFromRazorpay();
                }}
                disabled={syncing}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <FaDownload className="mr-2" />
                )}
                {syncing ? 'Syncing...' : 'Sync Sep 21st'}
              </button>
              <button
                onClick={forceSyncAllPayments}
                disabled={syncing}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <FaDownload className="mr-2" />
                )}
                {syncing ? 'Force Syncing...' : 'Force Sync All'}
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {getActiveFilterCount() > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Active Filters:</h3>
              <div className="flex flex-wrap gap-2">
                {activeFilters.utmSource && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    UTM Source: {activeFilters.utmSource}
                    <button
                      onClick={() => handleFilterClick('utmSource', activeFilters.utmSource)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {activeFilters.utmMedium && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    UTM Medium: {activeFilters.utmMedium}
                    <button
                      onClick={() => handleFilterClick('utmMedium', activeFilters.utmMedium)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {activeFilters.utmCampaign && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    UTM Campaign: {activeFilters.utmCampaign}
                    <button
                      onClick={() => handleFilterClick('utmCampaign', activeFilters.utmCampaign)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {activeFilters.sevaName && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Seva Name: {activeFilters.sevaName}
                    <button
                      onClick={() => handleFilterClick('sevaName', activeFilters.sevaName)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Missing Donations Warning */}
          {donations.length < 400 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Warning:</strong> Only {donations.length} donations found in database. 
                    If you're expecting more donations (e.g., 430+ for Sep 21st), 
                    please use the "Sync from Razorpay" button to fetch missing transactions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Total Amount Summary Card */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Total Collection Summary</h2>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-2xl" />
                    <div>
                      <p className="text-green-100 text-sm">Total Amount Collected</p>
                      <p className="text-3xl font-bold">{formatCurrency(summaryStats.totalAmount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-2xl" />
                    <div>
                      <p className="text-green-100 text-sm">Total Donations</p>
                      <p className="text-3xl font-bold">{summaryStats.totalDonations}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaChartBar className="text-2xl" />
                    <div>
                      <p className="text-green-100 text-sm">Average per Donation</p>
                      <p className="text-3xl font-bold">
                        {summaryStats.totalDonations > 0 
                          ? formatCurrency(summaryStats.totalAmount / summaryStats.totalDonations)
                          : formatCurrency(0)
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <SummaryCard
              title="Seva Names List"
              icon={FaMoneyBillWave}
              data={summaryStats.sevaNames}
              filterType="sevaName"
            />
            <SummaryCard
              title="UTM Source List"
              icon={FaGlobe}
              data={summaryStats.utmSources}
              filterType="utmSource"
            />
            <SummaryCard
              title="UTM Medium List"
              icon={FaFilter}
              data={summaryStats.utmMediums}
              filterType="utmMedium"
            />
            <SummaryCard
              title="UTM Campaign List"
              icon={MdCampaign}
              data={summaryStats.utmCampaigns}
              filterType="utmCampaign"
            />
          </div>

          {/* Export Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => exportData("success")}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaDownload className="mr-2" />
              Export Donation Success Data
            </button>
            <button
              onClick={() => exportData("failed")}
              className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaDownload className="mr-2" />
              Export Donation Failed Data
            </button>
          </div>

          {/* Detailed Donation Records */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-5xl mx-auto">
            <div className="bg-orange-500 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Detailed Donation Records</h2>
                  <div className="mt-1 flex items-center gap-4 text-sm">
                    <span>Showing {filteredDonations.length} of {donations.length} donations</span>
                    <span className="font-semibold">
                      Total: {formatCurrency(summaryStats.totalAmount)}
                    </span>
                  </div>
                </div>
                <div className="text-sm">
                  {isDefaultView ? (
                    <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full">
                      Today's Donations
                    </span>
                  ) : getActiveFilterCount() > 0 ? (
                    <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full">
                      Filtered
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full">
                      Date Range
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      S.No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medium
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seva Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seva Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Donor Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nationality
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Need Maha Prasadam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Need 80G
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PAN Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      House/Apartment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Village/City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      District
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      State
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PIN Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Landmark
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RazorPay Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receipt Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDonations.map((donation, index) => (
                    <tr key={donation._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {donation.utmSource || "Direct"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {donation.utmMedium || "Direct"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {donation.utmCampaign || "Direct"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {donation.sevaName || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatCurrency(donation.amount || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {donation.donorName || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {donation.donorPhone || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {donation.donorEmail || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {donation.donorType || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          donation.wantsMahaPrasadam ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {donation.wantsMahaPrasadam ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          donation.wants80G ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {donation.wants80G ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {donation.panNumber || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={donation.address || "N/A"}>
                          {donation.address || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {donation.houseApartment || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {donation.village || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {donation.district || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {donation.state || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {donation.pinCode || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {donation.landmark || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {donation.razorpayOrderId || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {donation.razorpayPaymentId || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(donation.createdAt).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            donation.paymentStatus === "completed"
                              ? "bg-green-100 text-green-800"
                              : donation.paymentStatus === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {donation.paymentStatus || "pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredDonations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {isDefaultView ? (
                  <div>
                    <p className="text-lg font-medium mb-2">No donations found for today</p>
                    <p className="text-sm">Try selecting a different date range to view historical donations.</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2">No donations found for the selected criteria</p>
                    <p className="text-sm">Try adjusting your date range or filters.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UTMTrackingDashboard;

import React, { useState, useEffect } from 'react';
import { FaChartLine } from 'react-icons/fa';

const DonationChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://dtg-universal-cms.onrender.com/api/donations/stats');
      const data = await response.json();

      if (data.success && data.stats.monthlyBreakdown) {
        setChartData(data.stats.monthlyBreakdown.slice(0, 6));
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
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

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="text-center py-12">
        <FaChartLine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No chart data available</h3>
        <p className="text-gray-600">Donation data will appear here once you have transactions.</p>
      </div>
    );
  }

  const maxAmount = Math.max(...chartData.map(item => item.amount));
  const maxCount = Math.max(...chartData.map(item => item.count));

  return (
    <div className="space-y-6">
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Monthly Donation Trends</h4>
          <p className="text-sm text-gray-600">Amount and count over the last 6 months</p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <div className="flex items-end justify-between h-48 gap-2">
          {chartData.map((item, index) => {
            const monthName = new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short' });
            const amountHeight = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
            const countHeight = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            
            return (
              <div key={`${item._id.year}-${item._id.month}`} className="flex-1 flex flex-col items-center">
                {/* Amount Bar */}
                <div className="relative w-full">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-500"
                    style={{ height: `${amountHeight}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                </div>
                
                {/* Count Bar */}
                <div className="relative w-full mt-2">
                  <div
                    className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg transition-all duration-300 hover:from-green-700 hover:to-green-500"
                    style={{ height: `${countHeight}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      {item.count} donations
                    </div>
                  </div>
                </div>
                
                {/* Month Label */}
                <div className="mt-2 text-xs text-gray-600 font-medium text-center">
                  {monthName}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          <span>{formatCurrency(maxAmount)}</span>
          <span>{formatCurrency(Math.round(maxAmount * 0.75))}</span>
          <span>{formatCurrency(Math.round(maxAmount * 0.5))}</span>
          <span>{formatCurrency(Math.round(maxAmount * 0.25))}</span>
          <span>₹0</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-blue-400 rounded"></div>
          <span className="text-gray-700">Amount</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-green-600 to-green-400 rounded"></div>
          <span className="text-gray-700">Count</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(chartData.reduce((sum, item) => sum + item.amount, 0))}
          </p>
          <p className="text-sm text-gray-600">Total Amount</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {chartData.reduce((sum, item) => sum + item.count, 0)}
          </p>
          <p className="text-sm text-gray-600">Total Donations</p>
        </div>
      </div>
    </div>
  );
};

export default DonationChart;

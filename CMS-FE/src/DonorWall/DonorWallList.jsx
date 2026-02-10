import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaHeart, FaSearch, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const DonorWallList = () => {
    const navigate = useNavigate();
    const [donors, setDonors] = useState([]);
    const [stats, setStats] = useState({
        totalDonors: 0,
        visibleDonors: 0,
        hiddenDonors: 0,
        totalRaised: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState({
        tier: '',
        isVisible: '',
        search: ''
    });

    const tiers = ['Platinum', 'Gold', 'Silver', 'Bronze', 'Supporter'];

    useEffect(() => {
        fetchDonors();
        fetchStats();
    }, [filter]);

    const fetchStats = async () => {
        try {
            const response = await fetch('https://api.harekrishnavidya.org/api/donor-wall/stats');
            if (!response.ok) throw new Error('Failed to fetch stats');
            const result = await response.json();
            setStats(result.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const fetchDonors = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filter.tier) queryParams.append('tier', filter.tier);
            if (filter.isVisible) queryParams.append('isVisible', filter.isVisible);
            if (filter.search) queryParams.append('search', filter.search);

            const response = await fetch(`https://api.harekrishnavidya.org/api/donor-wall?${queryParams}`);
            if (!response.ok) throw new Error('Failed to fetch donors');

            const data = await response.json();
            setDonors(data.data || []);
        } catch (err) {
            console.error('Error fetching donors:', err);
            setError('Failed to load donors');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this donor?')) return;

        try {
            const response = await fetch(`https://api.harekrishnavidya.org/api/donor-wall/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete donor');

            setDonors(donors.filter(donor => donor._id !== id));
            fetchStats(); // Refresh stats after deletion
        } catch (err) {
            console.error('Error deleting donor:', err);
            alert('Failed to delete donor');
        }
    };

    const handleToggleVisibility = async (id) => {
        try {
            const response = await fetch(`https://api.harekrishnavidya.org/api/donor-wall/${id}/toggle-visibility`, {
                method: 'PUT'
            });

            if (!response.ok) throw new Error('Failed to toggle visibility');

            const result = await response.json();

            // Update the donor in the list
            setDonors(donors.map(donor =>
                donor._id === id ? result.data : donor
            ));

            fetchStats(); // Refresh stats
        } catch (err) {
            console.error('Error toggling visibility:', err);
            alert('Failed to toggle visibility');
        }
    };

    const getTierColor = (tier) => {
        switch (tier) {
            case 'Platinum': return 'bg-purple-100 text-purple-700';
            case 'Gold': return 'bg-yellow-100 text-yellow-700';
            case 'Silver': return 'bg-gray-200 text-gray-700';
            case 'Bronze': return 'bg-orange-100 text-orange-700';
            default: return 'bg-blue-100 text-blue-700';
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <FaHeart className="text-red-500" />
                            Donor Wall
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage donors and contributions</p>
                    </div>
                    <button
                        onClick={() => navigate('/donor-wall/create')}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                        <FaPlus />
                        Add Donor
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="px-4 sm:px-6 py-4 sm:py-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.totalDonors}</div>
                        <div className="text-xs sm:text-sm text-gray-500 mt-1">Total Donors</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.visibleDonors}</div>
                        <div className="text-xs sm:text-sm text-gray-500 mt-1">Visible</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-orange-600">{stats.hiddenDonors}</div>
                        <div className="text-xs sm:text-sm text-gray-500 mt-1">Hidden</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center col-span-2 lg:col-span-1">
                        <div className="text-2xl sm:text-3xl font-bold text-blue-600">₹{stats.totalRaised.toLocaleString('en-IN')}</div>
                        <div className="text-xs sm:text-sm text-gray-500 mt-1">Total Raised</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                                type="text"
                                placeholder="Search donors, emails, campaigns..."
                                value={filter.search}
                                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm sm:text-base"
                            />
                        </div>

                        {/* Tier Filter */}
                        <select
                            value={filter.tier}
                            onChange={(e) => setFilter({ ...filter, tier: e.target.value })}
                            className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm sm:text-base"
                        >
                            <option value="">All Tiers</option>
                            {tiers.map(tier => (
                                <option key={tier} value={tier}>{tier}</option>
                            ))}
                        </select>

                        {/* Visibility Filter */}
                        <select
                            value={filter.isVisible}
                            onChange={(e) => setFilter({ ...filter, isVisible: e.target.value })}
                            className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm sm:text-base"
                        >
                            <option value="">All</option>
                            <option value="true">Visible</option>
                            <option value="false">Hidden</option>
                        </select>
                    </div>
                </div>

                {/* Donors Table/List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                        <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading donors...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm sm:text-base">
                        {error}
                    </div>
                ) : donors.length === 0 ? (
                    <div className="text-center py-12">
                        <FaHeart className="text-5xl sm:text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-sm sm:text-base">No donors found</p>
                        <button
                            onClick={() => navigate('/donor-wall/create')}
                            className="mt-4 px-4 sm:px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm sm:text-base"
                        >
                            Add Your First Donor
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visible</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {donors.map((donor) => (
                                        <tr key={donor._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div
                                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3"
                                                        style={{ backgroundColor: donor.avatarColor }}
                                                    >
                                                        {getInitials(donor.fullName)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {donor.isAnonymous ? 'Anonymous Donor' : donor.fullName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{donor.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {donor.showAmount ? `₹${donor.amount.toLocaleString('en-IN')}` : 'Hidden'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTierColor(donor.tier)}`}>
                                                    {donor.tier}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {donor.campaign}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(donor.donationDate).toLocaleDateString('en-IN')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleToggleVisibility(donor._id)}
                                                    className={`p-2 rounded-lg transition-colors ${donor.isVisible
                                                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                    title={donor.isVisible ? 'Hide from wall' : 'Show on wall'}
                                                >
                                                    {donor.isVisible ? <FaEye /> : <FaEyeSlash />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/donor-wall/edit/${donor._id}`)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(donor._id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-4">
                            {donors.map((donor) => (
                                <div key={donor._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                                                style={{ backgroundColor: donor.avatarColor }}
                                            >
                                                {getInitials(donor.fullName)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-sm">
                                                    {donor.isAnonymous ? 'Anonymous Donor' : donor.fullName}
                                                </h3>
                                                <p className="text-xs text-gray-500">{donor.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleToggleVisibility(donor._id)}
                                            className={`p-2 rounded-lg transition-colors ${donor.isVisible
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            {donor.isVisible ? <FaEye className="text-sm" /> : <FaEyeSlash className="text-sm" />}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Amount</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {donor.showAmount ? `₹${donor.amount.toLocaleString('en-IN')}` : 'Hidden'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Tier</p>
                                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(donor.tier)}`}>
                                                {donor.tier}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Campaign</p>
                                            <p className="text-sm text-gray-900">{donor.campaign}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Date</p>
                                            <p className="text-sm text-gray-900">
                                                {new Date(donor.donationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                                        <button
                                            onClick={() => navigate(`/donor-wall/edit/${donor._id}`)}
                                            className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <FaEdit />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(donor._id)}
                                            className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <FaTrash />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DonorWallList;

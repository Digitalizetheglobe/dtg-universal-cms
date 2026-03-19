import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaChartBar, FaSort } from 'react-icons/fa';

const StatManagement = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStat, setCurrentStat] = useState(null);
  const [formData, setFormData] = useState({
    number: '',
    label: '',
    order: 0
  });

  const API_URL = 'https://api.harekrishnavidya.org/api/stats/';

  // Fetch all stats
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        toast.error('Failed to fetch statistics');
      }
      setLoading(false);
    } catch (error) {
      toast.error('Error connecting to server');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'order' ? parseInt(value) || 0 : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = currentStat
        ? `${API_URL}${currentStat._id}`
        : API_URL;

      const method = currentStat ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        if (currentStat) {
          setStats(stats.map(s => s._id === currentStat._id ? result.data : s));
          toast.success('Statistic updated successfully');
        } else {
          setStats([...stats, result.data]);
          toast.success('Statistic added successfully');
        }
        setIsModalOpen(false);
        resetForm();
      } else {
        throw new Error(result.error || 'Operation failed');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (stat) => {
    setCurrentStat(stat);
    setFormData({
      number: stat.number,
      label: stat.label,
      order: stat.order || 0
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this statistic?')) {
      try {
        const response = await fetch(`${API_URL}${id}`, {
          method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
          setStats(stats.filter(s => s._id !== id));
          toast.success('Statistic deleted successfully');
        } else {
          throw new Error(result.error || 'Deletion failed');
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      number: '',
      label: '',
      order: stats.length
    });
    setCurrentStat(null);
  };

  const openNewModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <FaChartBar className="text-blue-600" />
            Statistics Management
          </h1>
          <p className="text-gray-500 mt-2">Manage impact numbers shown on the website</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center px-6 py-2 font-semibold text-white transition duration-300 rounded-lg shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
        >
          <FaPlus className="mr-2" />
          Add Statistic
        </button>
      </div>

      {/* Stats Table */}
      <div className="overflow-hidden bg-white shadow-xl rounded-xl border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Number</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Label</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {stats.sort((a,b) => a.order - b.order).map((stat) => (
              <tr key={stat._id} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-lg">
                    {stat.number}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-900 font-medium">{stat.label}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-500">{stat.order}</span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button
                    onClick={() => handleEdit(stat)}
                    className="text-indigo-600 hover:text-indigo-900 transition-colors"
                    title="Edit"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(stat._id)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                    title="Delete"
                  >
                    <FaTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {stats.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-500 italic">
                  No statistics found. Click "Add Statistic" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex items-center justify-between text-white">
              <h2 className="text-xl font-bold">
                {currentStat ? 'Edit Statistic' : 'New Statistic'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Number Value (e.g. 10+, 1.5K+)</label>
                  <input
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="100+"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Label (e.g. Happy Donors)</label>
                  <input
                    type="text"
                    name="label"
                    value={formData.label}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Successful Campaigns"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Display Order</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end mt-8 gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition-all active:scale-95"
                >
                  {currentStat ? 'Save Changes' : 'Create Statistic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatManagement;

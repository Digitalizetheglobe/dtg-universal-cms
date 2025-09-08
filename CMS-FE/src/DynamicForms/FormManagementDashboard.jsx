import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, Card, CardContent, Grid, 
  IconButton, Chip, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, CircularProgress, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ListAltIcon from '@mui/icons-material/ListAlt';
// import DashboardLayout from './DashboardLayout';

const FormManagementDashboard = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  // Fetch all forms
  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('https://dtg-universal-cms.onrender.com/api/forms/forms');
        if (!response.ok) {
          throw new Error('Failed to load forms');
        }
        
        const data = await response.json();
        setForms(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchForms();
  }, []);

  // Filter forms based on search and filter
  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         form.page.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && form.isActive) || 
                         (filter === 'inactive' && !form.isActive);
    return matchesSearch && matchesFilter;
  });

  // Delete form
  const openDeleteDialog = (form) => {
    setFormToDelete(form);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setFormToDelete(null);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`https://dtg-universal-cms.onrender.com/api/forms/forms/${formToDelete._id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete form');
      }
      
      // Remove from list
      setForms(forms.filter(f => f._id !== formToDelete._id));
      closeDeleteDialog();
    } catch (err) {
      setError(err.message);
      closeDeleteDialog();
    }
  };

  if (loading && forms.length === 0) {
    return (
      // <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <CircularProgress />
        </div>
      // </DashboardLayout>
    );
  }

  return (
    // <DashboardLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Form Management</h1>
            <p className="text-gray-600 mt-2">
              Create, manage, and track your dynamic forms
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outlined"
              className="border-green-600 text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg shadow-md transition-colors duration-300"
              onClick={() => navigate('/leads-management')}
            >
              View Leads
            </Button>
            <Button
              variant="contained"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-colors duration-300"
              startIcon={<AddIcon />}
              onClick={() => navigate('/form-management/create')}
            >
              Create New Form
            </Button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search forms..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Status:</span>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <Alert severity="error" className="rounded-lg shadow-sm">
              {error}
            </Alert>
          </div>
        )}

        {/* Forms Grid */}
        {filteredForms.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No forms found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating a new form'}
            </p>
            <div className="mt-6">
              <Button
                variant="contained"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md"
                startIcon={<AddIcon />}
                onClick={() => navigate('/form-management/create')}
              >
                Create New Form
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <div key={form._id} className="bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 truncate">{form.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">Page: {form.page}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      form.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {form.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <svg
                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    {form.fields.length} {form.fields.length === 1 ? 'field' : 'fields'}
                  </div>
                </div>

                <div className="bg-gray-50 px-5 py-3 flex justify-end space-x-2 border-t border-gray-200">
                  <button
                    onClick={() => navigate(`/form-management/preview/${form._id}`)}
                    className="p-2 text-gray-500 hover:text-blue-600 rounded-md hover:bg-gray-100 transition-colors"
                    title="Preview Form"
                  >
                    <VisibilityIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => navigate(`/form-management/submissions/${form._id}`)}
                    className="p-2 text-gray-500 hover:text-green-600 rounded-md hover:bg-gray-100 transition-colors"
                    title="View Submissions"
                  >
                    <ListAltIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => navigate(`/form-management/edit/${form._id}`)}
                    className="p-2 text-gray-500 hover:text-yellow-600 rounded-md hover:bg-gray-100 transition-colors"
                    title="Edit Form"
                  >
                    <EditIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => openDeleteDialog(form)}
                    className="p-2 text-gray-500 hover:text-red-600 rounded-md hover:bg-gray-100 transition-colors"
                    title="Delete Form"
                  >
                    <DeleteIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={closeDeleteDialog}
          PaperProps={{
            className: "rounded-xl"
          }}
        >
          <DialogTitle className="text-lg font-semibold text-gray-800">
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            <DialogContentText className="text-gray-600">
              Are you sure you want to delete the form "{formToDelete?.title}"? 
              This will also delete all submissions for this form. This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions className="px-6 py-4 border-t border-gray-200">
            <button
              onClick={closeDeleteDialog}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-colors"
            >
              Delete
            </button>
          </DialogActions>
        </Dialog>
      </div>
    // </DashboardLayout>
  );
};

export default FormManagementDashboard;
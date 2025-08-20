import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Card, CardContent, Grid, 
  IconButton, Chip, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, TextField, Select, MenuItem, FormControl,
  InputLabel
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';

const LeadsManagement = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('all');
  const [filterForm, setFilterForm] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);

  // Fetch leads from API
  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/forms/forms');
      if (!response.ok) {
        throw new Error('Failed to load forms');
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // Extract all submissions from all forms
        const allSubmissions = [];
        result.data.forEach(form => {
          if (form.submissions && Array.isArray(form.submissions)) {
            // Add form information to each submission
            const submissionsWithFormInfo = form.submissions.map(submission => ({
              ...submission,
              formId: form._id,
              formTitle: form.title || 'Untitled Form',
              formPage: form.page || 'Unknown Page',
              formDescription: form.description || '',
              formIsActive: form.isActive,
              formFields: form.fields || []
            }));
            allSubmissions.push(...submissionsWithFormInfo);
          }
        });
        
        setLeads(allSubmissions);
      } else {
        setLeads([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Get all unique field names from leads for filtering
  const getAllFieldNames = () => {
    const fieldNames = new Set();
    leads.forEach(lead => {
      if (lead.data) {
        Object.keys(lead.data).forEach(key => fieldNames.add(key));
      }
    });
    return Array.from(fieldNames);
  };

  // Get all unique form titles for filtering
  const getAllFormTitles = () => {
    const formTitles = new Set();
    leads.forEach(lead => {
      if (lead.formTitle) {
        formTitles.add(lead.formTitle);
      }
    });
    return Array.from(formTitles);
  };

  // Filter leads based on search and filter
  const filteredLeads = leads.filter(lead => {
    if (!lead.data) return false;
    
    const searchMatch = Object.values(lead.data).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    ) || 
    (lead.formTitle && lead.formTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (lead.formPage && lead.formPage.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const filterMatch = filterField === 'all' || 
                       (lead.data[filterField] !== undefined);
    
    const formMatch = filterForm === 'all' || 
                     (lead.formTitle === filterForm);
    
    const statusMatch = filterStatus === 'all' || 
                       (filterStatus === 'active' && lead.formIsActive) ||
                       (filterStatus === 'inactive' && !lead.formIsActive);
    
    return searchMatch && filterMatch && formMatch && statusMatch;
  });

  // Open lead detail dialog
  const openLeadDetail = (lead) => {
    setSelectedLead(lead);
    setDetailDialogOpen(true);
  };

  // Close lead detail dialog
  const closeLeadDetail = () => {
    setDetailDialogOpen(false);
    setSelectedLead(null);
  };

  // Open delete dialog
  const openDeleteDialog = (lead) => {
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setLeadToDelete(null);
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      // Remove from list
      setLeads(leads.filter(l => l._id !== leadToDelete._id));
      closeDeleteDialog();
    } catch (err) {
      setError(err.message);
      closeDeleteDialog();
    }
  };

  // Export leads to CSV
  const exportToCSV = () => {
    if (filteredLeads.length === 0) return;

    const fieldNames = getAllFieldNames();
    const csvHeaders = [
      'Form Title',
      'Form Page', 
      'Form Description',
      'Form Status',
      'Form ID',
      'Submission Date',
      'IP Address',
      ...fieldNames.map(field => field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
    ];

    const csvContent = [
      csvHeaders.join(','),
      ...filteredLeads.map(lead => {
        const row = [
          `"${(lead.formTitle || 'Untitled Form').replace(/"/g, '""')}"`,
          `"${(lead.formPage || 'Unknown').replace(/"/g, '""')}"`,
          `"${(lead.formDescription || 'No description').replace(/"/g, '""')}"`,
          `"${lead.formIsActive ? 'Active' : 'Inactive'}"`,
          `"${(lead.formId || 'N/A').replace(/"/g, '""')}"`,
          `"${new Date(lead.createdAt).toLocaleString().replace(/"/g, '""')}"`,
          `"${(lead.ipAddress || 'N/A').replace(/"/g, '""')}"`,
          ...fieldNames.map(field => {
            const value = lead.data[field] || '';
            return `"${String(value).replace(/"/g, '""')}"`;
          })
        ];
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && leads.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Leads Management</h1>
          <p className="text-gray-600 mt-2">
            View and manage form submissions and leads
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button
            variant="outlined"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
            startIcon={<RefreshIcon />}
            onClick={fetchLeads}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            className="bg-green-600 hover:bg-green-700 text-white"
            startIcon={<DownloadIcon />}
            onClick={exportToCSV}
            disabled={filteredLeads.length === 0}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <TextField
                fullWidth
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon className="text-gray-400 mr-2" />
                }}
                className="rounded-lg"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FilterListIcon className="text-gray-600" />
            <FormControl className="min-w-[200px]">
              <InputLabel>Filter by Field</InputLabel>
              <Select
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
                label="Filter by Field"
              >
                <MenuItem value="all">All Fields</MenuItem>
                {getAllFieldNames().map(field => (
                  <MenuItem key={field} value={field}>
                    {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl className="min-w-[200px]">
              <InputLabel>Filter by Form</InputLabel>
              <Select
                value={filterForm}
                onChange={(e) => setFilterForm(e.target.value)}
                label="Filter by Form"
              >
                <MenuItem value="all">All Forms</MenuItem>
                {getAllFormTitles().map(formTitle => (
                  <MenuItem key={formTitle} value={formTitle}>
                    {formTitle}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl className="min-w-[150px]">
              <InputLabel>Form Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Form Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Submissions
            </Typography>
            <Typography variant="h4" className="text-blue-600 font-bold">
              {leads.length}
            </Typography>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Filtered Results
            </Typography>
            <Typography variant="h4" className="text-green-600 font-bold">
              {filteredLeads.length}
            </Typography>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Active Forms
            </Typography>
            <Typography variant="h4" className="text-purple-600 font-bold">
              {leads.filter(lead => lead.formIsActive).length > 0 ? 
                new Set(leads.filter(lead => lead.formIsActive).map(lead => lead.formId)).size : 0}
            </Typography>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Forms
            </Typography>
            <Typography variant="h4" className="text-orange-600 font-bold">
              {new Set(leads.map(lead => lead.formId)).size}
            </Typography>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Unique Fields
            </Typography>
            <Typography variant="h4" className="text-red-600 font-bold">
              {getAllFieldNames().length}
            </Typography>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      {filteredLeads.length === 0 ? (
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
          <h3 className="mt-2 text-lg font-medium text-gray-900">No leads found</h3>
          <p className="mt-1 text-gray-500">
            {searchTerm || filterField !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'No form submissions available yet'}
          </p>
        </div>
      ) : (
        <Card className="bg-white rounded-xl shadow-sm overflow-hidden">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow className="bg-gray-50">
                  <TableCell className="font-semibold">Form Info</TableCell>
                  <TableCell className="font-semibold">Lead Data</TableCell>
                  <TableCell className="font-semibold">Submission Info</TableCell>
                  <TableCell className="font-semibold">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLeads.map((lead, index) => (
                  <TableRow key={lead._id || index} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-800">
                          {lead.formTitle || 'Untitled Form'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Page: {lead.formPage || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {lead.formId?.slice(-8) || 'N/A'}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                          lead.formIsActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.formIsActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 max-w-xs">
                        {lead.data && Object.entries(lead.data).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-gray-600 min-w-[80px]">
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                            </span>
                            <span className="text-xs text-gray-800 truncate">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-600">
                          {new Date(lead.createdAt).toLocaleTimeString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          IP: {lead.ipAddress || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <IconButton
                          size="small"
                          onClick={() => openLeadDetail(lead)}
                          className="text-blue-600 hover:bg-blue-50"
                          title="View Details"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => openDeleteDialog(lead)}
                          className="text-red-600 hover:bg-red-50"
                          title="Delete Lead"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Lead Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={closeLeadDetail}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "rounded-xl"
        }}
      >
        <DialogTitle className="text-lg font-semibold text-gray-800">
          Lead Details
        </DialogTitle>
        <DialogContent>
          {selectedLead && (
            <div className="space-y-6">
              {/* Form Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <Typography variant="h6" className="text-blue-800 font-semibold mb-3">
                  Form Information
                </Typography>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography variant="subtitle2" className="text-gray-600 font-medium">
                      Form Title
                    </Typography>
                    <Typography variant="body1" className="text-gray-800">
                      {selectedLead.formTitle || 'Untitled Form'}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2" className="text-gray-600 font-medium">
                      Page
                    </Typography>
                    <Typography variant="body1" className="text-gray-800">
                      {selectedLead.formPage || 'Unknown'}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2" className="text-gray-600 font-medium">
                      Description
                    </Typography>
                    <Typography variant="body1" className="text-gray-800">
                      {selectedLead.formDescription || 'No description'}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2" className="text-gray-600 font-medium">
                      Status
                    </Typography>
                    <Typography variant="body1" className="text-gray-800">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        selectedLead.formIsActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedLead.formIsActive ? 'Active' : 'Inactive'}
                      </span>
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2" className="text-gray-600 font-medium">
                      Form ID
                    </Typography>
                    <Typography variant="body1" className="text-gray-800 font-mono">
                      {selectedLead.formId || 'N/A'}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2" className="text-gray-600 font-medium">
                      Fields Count
                    </Typography>
                    <Typography variant="body1" className="text-gray-800">
                      {selectedLead.formFields?.length || 0} fields
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Form Fields Information */}
              {selectedLead.formFields && selectedLead.formFields.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <Typography variant="h6" className="text-green-800 font-semibold mb-3">
                    Form Fields
                  </Typography>
                  <div className="space-y-2">
                    {selectedLead.formFields.map((field, index) => (
                      <div key={field._id || index} className="border-b border-green-200 pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <Typography variant="subtitle2" className="text-green-700 font-medium">
                              {field.label} ({field.type})
                            </Typography>
                            <Typography variant="body2" className="text-green-600">
                              Field: {field.name}
                            </Typography>
                            {field.placeholder && (
                              <Typography variant="body2" className="text-green-600">
                                Placeholder: {field.placeholder}
                              </Typography>
                            )}
                          </div>
                          <div className="text-right">
                            <Typography variant="caption" className={`px-2 py-1 rounded-full text-xs ${
                              field.validation?.required 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {field.validation?.required ? 'Required' : 'Optional'}
                            </Typography>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lead Data */}
              {selectedLead.data && (
                <div>
                  <Typography variant="h6" className="text-gray-800 font-semibold mb-3">
                    Lead Data
                  </Typography>
                  <div className="space-y-3">
                    {Object.entries(selectedLead.data).map(([key, value]) => {
                      // Find the corresponding field to get the label
                      const field = selectedLead.formFields?.find(f => f.name === key);
                      const label = field?.label || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                      
                      return (
                        <div key={key} className="border-b border-gray-200 pb-3">
                          <Typography variant="subtitle2" className="text-gray-600 font-medium">
                            {label}
                          </Typography>
                          <Typography variant="body1" className="text-gray-800 mt-1">
                            {String(value) || '(Empty)'}
                          </Typography>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submission Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <Typography variant="h6" className="text-gray-800 font-semibold mb-3">
                  Submission Information
                </Typography>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography variant="subtitle2" className="text-gray-600 font-medium">
                      Submitted On
                    </Typography>
                    <Typography variant="body1" className="text-gray-800">
                      {new Date(selectedLead.createdAt).toLocaleDateString()} at {new Date(selectedLead.createdAt).toLocaleTimeString()}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2" className="text-gray-600 font-medium">
                      IP Address
                    </Typography>
                    <Typography variant="body1" className="text-gray-800 font-mono">
                      {selectedLead.ipAddress || 'N/A'}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2" className="text-gray-600 font-medium">
                      User Agent
                    </Typography>
                    <Typography variant="body2" className="text-gray-800 text-sm">
                      {selectedLead.userAgent || 'N/A'}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2" className="text-gray-600 font-medium">
                      Submission ID
                    </Typography>
                    <Typography variant="body1" className="text-gray-800 font-mono">
                      {selectedLead._id || 'N/A'}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions className="px-6 py-4 border-t border-gray-200">
          <Button onClick={closeLeadDetail} className="text-gray-600">
            Close
          </Button>
        </DialogActions>
      </Dialog>

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
            Are you sure you want to delete this lead? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="px-6 py-4 border-t border-gray-200">
          <Button onClick={closeDeleteDialog} className="text-gray-600">
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LeadsManagement;

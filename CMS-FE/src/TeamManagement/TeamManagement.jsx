import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Card, CardContent, Grid, 
  IconButton, Chip, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, TextField, Select, MenuItem, FormControl,
  InputLabel, Avatar, Switch, FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import RefreshIcon from '@mui/icons-material/Refresh';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PersonIcon from '@mui/icons-material/Person';

const TeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    designation: '',
    linkedinUrl: '',
    isActive: true
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Fetch team members from API
  const fetchTeamMembers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://dtg-universal-cms.onrender.com/api/team');
      if (!response.ok) {
        throw new Error('Failed to load team members');
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setTeamMembers(result.data);
      } else {
        setTeamMembers([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Filter team members based on search and filter
  const filteredMembers = teamMembers.filter(member => {
    // Add null checks to prevent errors
    if (!member || !member.fullName || !member.designation) {
      return false;
    }
    
    const searchMatch = member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       member.designation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = filterStatus === 'all' || 
                       (filterStatus === 'active' && member.isActive) ||
                       (filterStatus === 'inactive' && !member.isActive);
    
    return searchMatch && statusMatch;
  });

  // Open member detail dialog
  const openMemberDetail = (member) => {
    setSelectedMember(member);
    setDetailDialogOpen(true);
  };

  // Close member detail dialog
  const closeMemberDetail = () => {
    setDetailDialogOpen(false);
    setSelectedMember(null);
  };

  // Open delete dialog
  const openDeleteDialog = (member) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setMemberToDelete(null);
  };

  // Open form dialog for create/edit
  const openFormDialog = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        fullName: member.fullName,
        designation: member.designation,
        linkedinUrl: member.linkedinUrl || '',
        isActive: member.isActive
      });
      setPhotoPreview(member.photo ? `https://dtg-universal-cms.onrender.com/uploads/team/${member.photo}` : null);
    } else {
      setEditingMember(null);
      setFormData({
        fullName: '',
        designation: '',
        linkedinUrl: '',
        isActive: true
      });
      setPhotoPreview(null);
    }
    setPhotoFile(null);
    setFormDialogOpen(true);
  };

  // Close form dialog
  const closeFormDialog = () => {
    setFormDialogOpen(false);
    setEditingMember(null);
    setFormData({
      fullName: '',
      designation: '',
      linkedinUrl: '',
      isActive: true
    });
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // Handle photo file change
  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      
      if (photoFile) {
        // Upload with photo
        const formDataToSend = new FormData();
        formDataToSend.append('photo', photoFile);
        formDataToSend.append('fullName', formData.fullName);
        formDataToSend.append('designation', formData.designation);
        formDataToSend.append('linkedinUrl', formData.linkedinUrl);
        formDataToSend.append('isActive', formData.isActive);
        
        response = await fetch(`https://dtg-universal-cms.onrender.com/api/team${editingMember ? `/${editingMember._id}` : ''}`, {
          method: editingMember ? 'PUT' : 'POST',
          body: formDataToSend
        });
      } else {
        // Upload without photo
        response = await fetch(`https://dtg-universal-cms.onrender.com/api/team${editingMember ? `/${editingMember._id}` : ''}`, {
          method: editingMember ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
      }
      
      const result = await response.json();
      
      if (result.success) {
        closeFormDialog();
        fetchTeamMembers();
      } else {
        setError(result.message || 'Failed to save team member');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      const response = await fetch(`https://dtg-universal-cms.onrender.com/api/team/${memberToDelete._id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTeamMembers(teamMembers.filter(m => m._id !== memberToDelete._id));
        closeDeleteDialog();
      } else {
        setError(result.message || 'Failed to delete team member');
      }
    } catch (err) {
      setError(err.message);
      closeDeleteDialog();
    }
  };

  // Toggle active status
  const toggleStatus = async (member) => {
    try {
      const response = await fetch(`https://dtg-universal-cms.onrender.com/api/team/${member._id}/toggle-status`, {
        method: 'PATCH'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTeamMembers(teamMembers.map(m => 
          m._id === member._id ? { ...m, isActive: result.data.isActive } : m
        ));
      } else {
        setError(result.message || 'Failed to toggle status');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading && teamMembers.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-800">Team Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your team members and their profiles
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button
            variant="outlined"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
            startIcon={<RefreshIcon />}
            onClick={fetchTeamMembers}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            startIcon={<AddIcon />}
            onClick={() => openFormDialog()}
          >
            Add Team Member
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <TextField
              fullWidth
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-lg"
            />
          </div>
          <FormControl className="min-w-[200px]">
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Filter by Status"
            >
              <MenuItem value="all">All Members</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Members
            </Typography>
            <Typography variant="h4" className="text-blue-600 font-bold">
              {teamMembers.length}
            </Typography>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Active Members
            </Typography>
            <Typography variant="h4" className="text-green-600 font-bold">
              {teamMembers.filter(m => m.isActive).length}
            </Typography>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Inactive Members
            </Typography>
            <Typography variant="h4" className="text-gray-600 font-bold">
              {teamMembers.filter(m => !m.isActive).length}
            </Typography>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Filtered Results
            </Typography>
            <Typography variant="h4" className="text-purple-600 font-bold">
              {filteredMembers.length}
            </Typography>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Table */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <PersonIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No team members found</h3>
          <p className="mt-1 text-gray-500">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first team member'}
          </p>
          <div className="mt-6">
            <Button
              variant="contained"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              startIcon={<AddIcon />}
              onClick={() => openFormDialog()}
            >
              Add Team Member
            </Button>
          </div>
        </div>
      ) : (
        <Card className="bg-white rounded-xl shadow-sm overflow-hidden">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow className="bg-gray-50">
                  <TableCell className="font-semibold">Photo</TableCell>
                  <TableCell className="font-semibold">Name & Designation</TableCell>
                  <TableCell className="font-semibold">LinkedIn</TableCell>
                  <TableCell className="font-semibold">Status</TableCell>
                  <TableCell className="font-semibold">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member._id || Math.random()} className="hover:bg-gray-50">
                    <TableCell>
                      <Avatar
                        src={member.photo ? `https://dtg-universal-cms.onrender.com/uploads/team/${member.photo}` : undefined}
                        className="w-12 h-12"
                      >
                        {member.fullName ? member.fullName.charAt(0) : '?'}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{member.fullName || 'Unknown Name'}</div>
                        <div className="text-sm text-gray-500">{member.designation || 'Unknown Designation'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {member.linkedinUrl ? (
                        <a
                          href={member.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <LinkedInIcon />
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.isActive ? 'Active' : 'Inactive'}
                        color={member.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <IconButton
                          size="small"
                          onClick={() => openMemberDetail(member)}
                          className="text-blue-600 hover:bg-blue-50"
                          title="View Details"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => openFormDialog(member)}
                          className="text-yellow-600 hover:bg-yellow-50"
                          title="Edit Member"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => openDeleteDialog(member)}
                          className="text-red-600 hover:bg-red-50"
                          title="Delete Member"
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

      {/* Member Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={closeMemberDetail}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "rounded-xl"
        }}
      >
        <DialogTitle className="text-lg font-semibold text-gray-800">
          Team Member Details
        </DialogTitle>
        <DialogContent>
          {selectedMember && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar
                  src={selectedMember.photo ? `https://dtg-universal-cms.onrender.com/uploads/team/${selectedMember.photo}` : undefined}
                  className="w-20 h-20"
                >
                  {selectedMember.fullName ? selectedMember.fullName.charAt(0) : '?'}
                </Avatar>
                <div>
                  <Typography variant="h5" className="font-semibold">
                    {selectedMember.fullName || 'Unknown Name'}
                  </Typography>
                  <Typography variant="subtitle1" className="text-gray-600">
                    {selectedMember.designation || 'Unknown Designation'}
                  </Typography>
                  <Chip
                    label={selectedMember.isActive ? 'Active' : 'Inactive'}
                    color={selectedMember.isActive ? 'success' : 'default'}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="subtitle2" className="text-gray-600 font-medium">
                    Full Name
                  </Typography>
                  <Typography variant="body1" className="text-gray-800">
                    {selectedMember.fullName || 'Not provided'}
                  </Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" className="text-gray-600 font-medium">
                    Designation
                  </Typography>
                  <Typography variant="body1" className="text-gray-800">
                    {selectedMember.designation || 'Not provided'}
                  </Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" className="text-gray-600 font-medium">
                    LinkedIn Profile
                  </Typography>
                  <Typography variant="body1" className="text-gray-800">
                    {selectedMember.linkedinUrl ? (
                      <a
                        href={selectedMember.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View Profile
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" className="text-gray-600 font-medium">
                    Member ID
                  </Typography>
                  <Typography variant="body1" className="text-gray-800 font-mono">
                    {selectedMember._id}
                  </Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" className="text-gray-600 font-medium">
                    Created On
                  </Typography>
                  <Typography variant="body1" className="text-gray-800">
                    {new Date(selectedMember.createdAt).toLocaleDateString()}
                  </Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" className="text-gray-600 font-medium">
                    Last Updated
                  </Typography>
                  <Typography variant="body1" className="text-gray-800">
                    {new Date(selectedMember.updatedAt).toLocaleDateString()}
                  </Typography>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions className="px-6 py-4 border-t border-gray-200">
          <Button onClick={closeMemberDetail} className="text-gray-600">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Form Dialog for Create/Edit */}
      <Dialog
        open={formDialogOpen}
        onClose={closeFormDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "rounded-xl"
        }}
      >
        <DialogTitle className="text-lg font-semibold text-gray-800">
          {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
        </DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent>
            <div className="space-y-4">
              {/* Photo Upload */}
              <div className="flex items-center space-x-4">
                <Avatar
                  src={photoPreview}
                  className="w-20 h-20"
                >
                  <PhotoCameraIcon />
                </Avatar>
                <div>
                  <input
                    accept="image/*"
                    type="file"
                    id="photo-upload"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <label htmlFor="photo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCameraIcon />}
                    >
                      Upload Photo
                    </Button>
                  </label>
                  <Typography variant="caption" className="block text-gray-500 mt-1">
                    {editingMember ? 'Leave empty to keep current photo' : 'Photo is required for new members'}
                  </Typography>
                </div>
              </div>

              {/* Form Fields */}
              <TextField
                fullWidth
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Designation"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="LinkedIn URL"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active Member"
              />
            </div>
          </DialogContent>
          <DialogActions className="px-6 py-4 border-t border-gray-200">
            <Button onClick={closeFormDialog} className="text-gray-600">
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="contained"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {editingMember ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
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
            Are you sure you want to delete "{memberToDelete?.fullName || 'this team member'}"? This action cannot be undone.
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

export default TeamManagement;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, IconButton, Button, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle,
  CircularProgress, Alert, Chip, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const FormSubmissionsView = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [formConfig, setFormConfig] = useState(null);

  // Fetch form configuration and submissions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch form configuration
        const formResponse = await fetch(`http://localhost:5000/api/forms/forms/${formId}`);
        if (!formResponse.ok) {
          throw new Error('Failed to load form configuration');
        }
        const formData = await formResponse.json();
        setFormConfig(formData.data);
        
        // Fetch submissions
        const submissionsResponse = await fetch(`http://localhost:5000/api/forms/forms/${formId}/submissions`);
        if (!submissionsResponse.ok) {
          throw new Error('Failed to load submissions');
        }
        const submissionsData = await submissionsResponse.json();
        setSubmissions(submissionsData.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [formId]);

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle delete
  const openDeleteDialog = (submission) => {
    setSubmissionToDelete(submission);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSubmissionToDelete(null);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/submissions/${submissionToDelete._id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete submission');
      }
      
      // Remove from list
      setSubmissions(submissions.filter(s => s._id !== submissionToDelete._id));
      closeDeleteDialog();
    } catch (err) {
      setError(err.message);
      closeDeleteDialog();
    }
  };

  // Handle view
  const openViewDialog = (submission) => {
    setCurrentSubmission(submission);
    setViewDialogOpen(true);
  };

  const closeViewDialog = () => {
    setViewDialogOpen(false);
    setCurrentSubmission(null);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!submissions || submissions.length === 0 || !formConfig) return;
    
    // Get all field names from form config
    const fields = formConfig.fields.map(field => field.name);
    
    // Create CSV header
    let csv = ['Submission Date', ...fields].join(',') + '\n';
    
    // Add data rows
    submissions.forEach(submission => {
      const date = new Date(submission.createdAt).toLocaleString();
      const values = fields.map(field => {
        const value = submission.data[field];
        // Handle CSV special characters
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        return value;
      });
      
      csv += [date, ...values].join(',') + '\n';
    });
    
    // Create and download CSV file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${formConfig.title}-submissions.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/form-management')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">
          Form Submissions {formConfig && `- ${formConfig.title}`}
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<FileDownloadIcon />}
          onClick={exportToCSV}
          disabled={submissions.length === 0}
        >
          Export CSV
        </Button>
      </Box>
      
      {submissions.length === 0 ? (
        <Alert severity="info">No submissions found for this form.</Alert>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="submissions table">
              <TableHead>
                <TableRow>
                  <TableCell>Submission Date</TableCell>
                  {formConfig && formConfig.fields.slice(0, 3).map(field => (
                    <TableCell key={field.name}>{field.label}</TableCell>
                  ))}
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((submission) => (
                    <TableRow key={submission._id}>
                      <TableCell>
                        {new Date(submission.createdAt).toLocaleString()}
                      </TableCell>
                      
                      {formConfig && formConfig.fields.slice(0, 3).map(field => (
                        <TableCell key={field.name}>
                          {submission.data[field.name] !== undefined
                            ? String(submission.data[field.name]).substring(0, 50)
                            : '-'}
                        </TableCell>
                      ))}
                      
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton onClick={() => openViewDialog(submission)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => openDeleteDialog(submission)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={submissions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this submission? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
      {/* View Submission Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={closeViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Submission Details</DialogTitle>
        <DialogContent>
          {currentSubmission && formConfig && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Submitted on {new Date(currentSubmission.createdAt).toLocaleString()}
              </Typography>
              
              <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                <Table>
                  <TableBody>
                    {formConfig.fields.map(field => (
                      <TableRow key={field.name}>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '30%' }}>
                          {field.label}
                        </TableCell>
                        <TableCell>
                          {currentSubmission.data[field.name] !== undefined
                            ? String(currentSubmission.data[field.name])
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormSubmissionsView;
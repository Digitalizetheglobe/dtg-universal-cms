const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const path = require('path');

// Serve static files from the blogimages directory
app.use('/blogimages', express.static(path.join(__dirname, 'blogimages')));

// Upload single image
router.post('/single', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Create URL for the uploaded file
    const host = req.get('host');
    const protocol = req.protocol;
    const url = `${protocol}://${host}/blogimages/${req.file.filename}`;
    
    res.status(200).json({ 
      url: url,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

module.exports = router;
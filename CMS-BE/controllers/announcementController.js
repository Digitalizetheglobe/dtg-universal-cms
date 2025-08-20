const Announcement = require('../models/Announcement');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = 'public/AnnouncementImage';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'announcement-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and GIF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Private
const createAnnouncement = [
  upload.single('announcementImage'),
  async (req, res) => {
    try {
      const { title, content, departments, isPublished, showOnFrontend } = req.body;
      
      let announcementImage = '';
      if (req.file) {
        announcementImage = `/AnnouncementImage/${req.file.filename}`;
      }

      const announcement = new Announcement({
        title,
        content,
        departments: Array.isArray(departments) ? departments : [departments],
        isPublished: isPublished === 'true',
        showOnFrontend: showOnFrontend !== 'false',
        announcementImage
      });

      await announcement.save();
      res.status(201).json(announcement);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
];

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public
const getAnnouncements = async (req, res) => {
  try {
    const { department, published } = req.query;
    let query = {};

    if (department) {
      query.departments = department;
    }
    
    if (published === 'true') {
      query.isPublished = true;
      query.showOnFrontend = true;
    }

    const announcements = await Announcement.find(query).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Public
const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private
const updateAnnouncement = [
  upload.single('announcementImage'),
  async (req, res) => {
    try {
      const { title, content, departments, isPublished, showOnFrontend } = req.body;
      const updateData = {
        title,
        content,
        departments: Array.isArray(departments) ? departments : [departments],
        isPublished: isPublished === 'true',
        showOnFrontend: showOnFrontend !== 'false',
        updatedAt: Date.now()
      };

      // Handle new image upload if exists
      if (req.file) {
        updateData.announcementImage = `/AnnouncementImage/${req.file.filename}`;
        
        // Delete old image if exists
        const oldAnnouncement = await Announcement.findById(req.params.id);
        if (oldAnnouncement.announcementImage) {
          const oldImagePath = path.join(__dirname, '..', 'public', oldAnnouncement.announcementImage);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
      }

      const announcement = await Announcement.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!announcement) {
        return res.status(404).json({ message: 'Announcement not found' });
      }

      res.json(announcement);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
];

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Delete associated image if exists
    if (announcement.announcementImage) {
      const imagePath = path.join(__dirname, '..', 'public', announcement.announcementImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ message: 'Announcement removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  upload
};

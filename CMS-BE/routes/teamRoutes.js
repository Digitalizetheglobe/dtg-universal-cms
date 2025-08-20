const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/team/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Public routes (for frontend display)
router.get('/active', teamController.getActiveTeamMembers);

// Temporarily making routes public for testing (remove protect, admin middleware)
router.get('/', teamController.getAllTeamMembers);
router.get('/:id', teamController.getTeamMemberById);
router.post('/', upload.single('photo'), teamController.createTeamMember);
router.put('/:id', upload.single('photo'), teamController.updateTeamMember);
router.delete('/:id', teamController.deleteTeamMember);
router.patch('/:id/toggle-status', teamController.toggleActiveStatus);

module.exports = router;

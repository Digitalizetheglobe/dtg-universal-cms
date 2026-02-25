const Event = require('../models/Event');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getBaseUrl } = require('../utils/urlHelper'); // Add this import

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/\s+/g, '-')
      .replace(/[^\w.-]/g, '');
    cb(null, `${Date.now()}-${baseName}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, GIF, and WebP files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Handle multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: 'File upload error', error: err.message });
  } else if (err) {
    return res.status(400).json({ message: 'File validation error', error: err.message });
  }
  next();
};

// Create new event with 3 images
// POST /api/events
exports.createEvent = [
  upload.fields([
    { name: 'image', maxCount: 1 },           // uploadImage
    { name: 'coverImage1', maxCount: 1 },     // coverImage1
    { name: 'coverImage2', maxCount: 1 }      // coverImage2
  ]),
  handleMulterError,
  async (req, res) => {
    try {
      const { title, start, end, description, slug } = req.body;
      const files = req.files;

      // Check all required fields and required image
      if (!title || !start || !end || !description || !slug || !files?.image?.[0]) {
        return res.status(400).json({
          message: 'Required fields: title, start, end, description, slug, and main image'
        });
      }

      // Use the same base URL helper as blogController
      const baseUrl = getBaseUrl(req);

      const newEvent = new Event({
        title,
        start,
        end,
        description,
        slug,
        uploadImage: `${baseUrl}/uploads/${files.image[0].filename}`,
        coverImage1: files.coverImage1?.[0] ? `${baseUrl}/uploads/${files.coverImage1[0].filename}` : undefined,
        coverImage2: files.coverImage2?.[0] ? `${baseUrl}/uploads/${files.coverImage2[0].filename}` : undefined
      });

      const savedEvent = await newEvent.save();
      res.status(201).json(savedEvent);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Slug already exists' });
      }
      res.status(400).json({ message: 'Failed to create event', error: error.message });
    }
  }
];



// Get all events
// GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single event by ID
// GET /api/events/:id
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getEventBySlug = async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




// Update event
// PUT /api/events/:id
exports.updateEvent = [
  upload.single('image'), // Must match frontend field name
  handleMulterError,
  async (req, res) => {
    try {
      const { title, start, end, description, slug } = req.body;

      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Update fields
      event.title = title || event.title;
      event.start = start || event.start;
      event.end = end || event.end;
      event.description = description || event.description;
      event.slug = slug || event.slug;

      if (req.file) {
        // Use the same base URL helper as blogController
        const baseUrl = getBaseUrl(req);
        const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
        event.uploadImage = imageUrl;
      }

      const updated = await event.save();
      res.status(200).json(updated);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Slug already exists' });
      }
      res.status(400).json({ message: 'Failed to update event', error: error.message });
    }
  }
];

// Delete event
// DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);

    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get events by country
// GET /api/events/country/:country


// Get events by month
// GET /api/events/month/:month

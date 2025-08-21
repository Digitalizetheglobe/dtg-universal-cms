const Blog = require('../models/Blog');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Use the correct uploads directory path
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Create a unique filename
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, GIF, and WebP files are allowed'), false);
  }
};

// Initialize multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
});
// Get all blogs
// GET /api/blogs
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single blog by ID
// GET /api/blogs/:id
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get blog by slug
// GET /api/blogs/slug/:slug
exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new blog
// POST /api/blogs
exports.createBlog = [
  upload.any(), // Accept any file field name
  (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'File upload error', error: err.message });
    } else if (err) {
      return res.status(400).json({ message: 'File validation error', error: err.message });
    }
    next();
  },
  async (req, res) => {
    try {
      console.log('Request Body:', req.body); // Log the request body
      console.log('Uploaded Files:', req.files); // Log the uploaded files
      console.log('Request Headers:', req.headers['content-type']); // Log content type

      const { title, content, slug, tags, excerpt, coverImage, author, categories, metaTitle, metaDescription, ogTitle, ogDescription, ogImage, readTime } = req.body;

      let uploadImage = null;
      let coverImageUrl = coverImage; // Use coverImage from request body if provided
      
      if (req.files && req.files.length > 0) {
        // Use the first uploaded file
        const file = req.files[0];
        uploadImage = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
        
        // If no coverImage was provided, use the uploaded file as coverImage
        if (!coverImageUrl) {
          coverImageUrl = uploadImage;
        }
      }

      const newBlog = new Blog({
        
        title,
        content,
        slug,
        tags,
        excerpt,
        coverImage: coverImageUrl,
        author,
        categories,
        metaTitle,
        metaDescription,
        ogTitle,
        ogDescription,
        ogImage,
        readTime,
        uploadImage,
      });

      const savedBlog = await newBlog.save();
      res.status(201).json(savedBlog);
    } catch (error) {
      console.error('Error creating blog:', error.message); // Log the error
      res.status(400).json({ message: 'Failed to create blog', error: error.message });
    }
  },
];

// Update blog
// PUT /api/blogs/:id
exports.updateBlog = async (req, res) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update blog', error: error.message });
  }
};

// Delete blog
// DELETE /api/blogs/:id
exports.deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!deletedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Increment blog views
// PATCH /api/blogs/:id/views
exports.incrementViews = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle like blog
// PATCH /api/blogs/:id/like
exports.toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Simple increment - in a real app you'd track which users liked the post
    blog.likes += 1;
    await blog.save();
    
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
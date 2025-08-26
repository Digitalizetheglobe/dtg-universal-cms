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
  upload.any(),
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
      const {
        title,
        slug,
        content,
        excerpt,
        author,
        tags,
        categories,
        publishedAt,
        isPublished,
        metaTitle,
        metaDescription,
        ogTitle,
        ogDescription,
        ogImage,
        readTime,
      } = req.body;

      // Handle uploaded images
      let uploadImage = null;
      let coverImage1 = null;
      let coverImage2 = null;

      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

          if (file.fieldname === 'uploadImage') {
            uploadImage = fileUrl;
          } else if (file.fieldname === 'coverImage1') {
            coverImage1 = fileUrl;
          } else if (file.fieldname === 'coverImage2') {
            coverImage2 = fileUrl;
          }
        });
      }

      if (!uploadImage) {
        return res.status(400).json({ message: "uploadImage is required" });
      }

      const newBlog = new Blog({
        title,
        slug,
        content,
        excerpt,
        author,
        uploadImage,
        coverImage1,
        coverImage2,
        publishedAt,
        metaTitle,
        metaDescription,
        ogTitle,
        ogDescription,
        ogImage,
        // Convert stringified types:
        tags: JSON.parse(tags || "[]"),
        categories: JSON.parse(categories || "[]"),
        isPublished: isPublished === "true" || isPublished === true,
        readTime: parseInt(readTime) || 0,
      });

      const savedBlog = await newBlog.save();
      res.status(201).json(savedBlog);
    } catch (error) {
      console.error("Error creating blog:", error.message);
      res.status(400).json({ message: "Failed to create blog", error: error.message });
    }
  },
];


// Update blog
// PUT /api/blogs/:id
exports.updateBlog = [
  upload.any(), // Handle file uploads
  async (req, res) => {
    try {
      const blogId = req.params.id;

      const updateFields = { ...req.body };

      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

          if (file.fieldname === 'uploadImage') {
            updateFields.uploadImage = fileUrl;
          } else if (file.fieldname === 'coverImage1') {
            updateFields.coverImage1 = fileUrl;
          } else if (file.fieldname === 'coverImage2') {
            updateFields.coverImage2 = fileUrl;
          }
        });
      }

      const updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        updateFields,
        { new: true, runValidators: true }
      );

      if (!updatedBlog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      res.status(200).json(updatedBlog);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update blog', error: error.message });
    }
  }
];

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
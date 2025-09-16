const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
console.log('Environment variables loaded:');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/forms', require('./routes/formRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/email-templates', require('./routes/emailTemplateRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/team', require('./routes/teamRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));

// Root
app.get('/', (req, res) => {
  res.send('Universal CMS Backend Running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving static files from ${path.join(__dirname, 'public')}`);
});

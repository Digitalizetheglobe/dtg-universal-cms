const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.error('❌ MONGO_URI is not defined in environment variables');
      console.log('Available environment variables:', Object.keys(process.env).filter(key => key.includes('MONGO')));
      process.exit(1);
    }

    console.log('🔗 Attempting to connect to MongoDB...');
    console.log('📡 Connection string:', mongoUri.substring(0, 20) + '...');

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 50, // Increase pool size for heavy traffic
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('🔍 Error details:', err);
    process.exit(1);
  }
};

module.exports = connectDB;

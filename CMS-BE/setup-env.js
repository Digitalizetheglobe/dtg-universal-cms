const fs = require('fs');
const path = require('path');

const envContent = `# Database Configuration
MONGO_URI=mongodb://localhost:27017/dtg_universal_cms

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
JWT_EXPIRE=30d

# Email Configuration (if using nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# Optional: Webhook Secret (if using Razorpay webhooks)
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
`;

const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists. Please check if it has the correct MONGO_URI variable.');
  console.log('Current .env content:');
  console.log(fs.readFileSync(envPath, 'utf8'));
} else {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('📝 Please update the following variables in your .env file:');
  console.log('   - MONGO_URI: Your MongoDB connection string');
  console.log('   - JWT_SECRET: A secure random string for JWT tokens');
  console.log('   - RAZORPAY_KEY_ID: Your Razorpay test/live key ID');
  console.log('   - RAZORPAY_KEY_SECRET: Your Razorpay test/live key secret');
}

console.log('\n🔧 To fix the MongoDB connection issue:');
console.log('1. Make sure MongoDB is running on your system');
console.log('2. Update MONGO_URI in .env file with your MongoDB connection string');
console.log('3. Example: MONGO_URI=mongodb://localhost:27017/dtg_universal_cms');

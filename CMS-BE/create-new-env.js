const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

const envContent = `# Database Configuration
MONGO_URI=mongodb+srv://garibesangmesh:nDIOSD3XXaV75p8h@cluster0.hv3lvyd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=sudhuhduihduehduheuheuheiheioejioeheiheioh
JWT_EXPIRE=30d

# Email Configuration (if using nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_R7u0ddNSZ7PFCB
RAZORPAY_KEY_SECRET=pRsEm4Gp7Qk7J7Sj4AC8A8Es

# Optional: Webhook Secret (if using Razorpay webhooks)
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
`;

// Write the new .env file with UTF-8 encoding
fs.writeFileSync(envPath, envContent, 'utf8');

console.log('✅ New .env file created successfully!');
console.log('📝 All environment variables are properly formatted');

// Verify the content
const newContent = fs.readFileSync(envPath, 'utf8');
console.log('\n🔍 New .env file content:');
console.log(newContent);

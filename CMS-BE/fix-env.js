const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

// Read the current .env file
let envContent = fs.readFileSync(envPath, 'utf8');

// Fix the MONGO_URI by removing line breaks
envContent = envContent.replace(
  /MONGO_URI=mongodb\+srv:\/\/garibesangmesh:nDIOSD3XXaV75p8h@cluster0\.hv3lvyd\.mongodb\.net\/\?retryWrites=true&\s*w=majority&appName=Cluster0/g,
  'MONGO_URI=mongodb+srv://garibesangmesh:nDIOSD3XXaV75p8h@cluster0.hv3lvyd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
);

// Write the fixed content back
fs.writeFileSync(envPath, envContent);

console.log('✅ .env file fixed!');
console.log('📝 MONGO_URI is now properly formatted on a single line');

// Verify the fix
const fixedContent = fs.readFileSync(envPath, 'utf8');
const mongoUriLine = fixedContent.split('\n').find(line => line.startsWith('MONGO_URI='));
console.log('🔍 Fixed MONGO_URI line:', mongoUriLine);

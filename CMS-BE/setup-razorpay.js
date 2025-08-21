const fs = require('fs');
const path = require('path');

console.log('🔧 Razorpay Setup Helper');
console.log('========================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ No .env file found!');
  console.log('📝 Creating .env file from template...\n');
  
  // Read template
  const templatePath = path.join(__dirname, 'env-template.txt');
  if (fs.existsSync(templatePath)) {
    const template = fs.readFileSync(templatePath, 'utf8');
    fs.writeFileSync(envPath, template);
    console.log('✅ Created .env file from template');
  } else {
    console.log('❌ env-template.txt not found');
    process.exit(1);
  }
} else {
  console.log('✅ .env file found');
}

// Read current .env
const envContent = fs.readFileSync(envPath, 'utf8');

// Check Razorpay credentials
const hasKeyId = envContent.includes('RAZORPAY_KEY_ID=') && !envContent.includes('RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id_here');
const hasKeySecret = envContent.includes('RAZORPAY_KEY_SECRET=') && !envContent.includes('RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here');

console.log('\n🔍 Checking Razorpay Configuration:');
console.log(`   Key ID: ${hasKeyId ? '✅ Configured' : '❌ Missing/Default'}`);
console.log(`   Key Secret: ${hasKeySecret ? '✅ Configured' : '❌ Missing/Default'}`);

if (!hasKeyId || !hasKeySecret) {
  console.log('\n📋 To configure Razorpay:');
  console.log('1. Go to your Razorpay Dashboard');
  console.log('2. Navigate to Settings > API Keys');
  console.log('3. Copy your Key ID and Key Secret');
  console.log('4. Update the .env file with your credentials:');
  console.log('\n   RAZORPAY_KEY_ID=rzp_test_your_actual_key_id');
  console.log('   RAZORPAY_KEY_SECRET=your_actual_key_secret');
  console.log('\n⚠️  Make sure to use your actual Razorpay credentials, not the placeholder values!');
} else {
  console.log('\n✅ Razorpay credentials appear to be configured correctly!');
  console.log('🚀 You can now test the connection from your CMS dashboard.');
}

console.log('\n🔗 Next Steps:');
console.log('1. Update your .env file with actual Razorpay credentials');
console.log('2. Restart your backend server');
console.log('3. Go to your CMS dashboard and click "Test Connection"');
console.log('4. If connection is successful, click "Sync Razorpay" to import payments');

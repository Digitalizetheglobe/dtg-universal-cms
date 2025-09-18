const { testEmailConfiguration, sendDonationReceipt } = require('./utils/emailService');

async function testEmailService() {
  console.log('🧪 Testing Email Service Configuration...\n');
  
  try {
    // Test 1: Email Configuration
    console.log('1. Testing email configuration...');
    const configResult = await testEmailConfiguration();
    
    if (configResult.success) {
      console.log('✅ Email configuration test passed!');
      console.log(`   Message ID: ${configResult.messageId}`);
    } else {
      console.log('❌ Email configuration test failed!');
      console.log(`   Error: ${configResult.error}`);
      return;
    }
    
    console.log('\n2. Testing donation receipt email...');
    
    // Create a mock donation for testing
    const mockDonation = {
      _id: 'test_donation_123',
      donorName: 'Test Donor',
      donorEmail: 'aikyavidya@hkmhyderabad.org', // Send test to admin email
      donorPhone: '+91-9876543210',
      amount: 2700,
      sevaName: 'ANNADAN SEVA',
      campaign: 'Food Distribution',
      paymentMethod: 'netbanking',
      razorpayPaymentId: 'pay_test123',
      paymentStatus: 'completed',
      isAnonymous: false,
      createdAt: new Date().toISOString()
    };
    
    const receiptResult = await sendDonationReceipt(mockDonation);
    
    if (receiptResult.success) {
      console.log('✅ Donation receipt email test passed!');
      console.log(`   Message ID: ${receiptResult.messageId}`);
      console.log(`   Message: ${receiptResult.message}`);
    } else {
      console.log('❌ Donation receipt email test failed!');
      console.log(`   Error: ${receiptResult.error}`);
    }
    
    console.log('\n🎉 Email service testing completed!');
    console.log('\n📧 Check the admin email (aikyavidya@hkmhyderabad.org) for test emails.');
    
  } catch (error) {
    console.error('❌ Error during email service testing:', error);
  }
}

// Run the test
testEmailService();

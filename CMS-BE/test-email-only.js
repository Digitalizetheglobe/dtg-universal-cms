const { sendDonationReceipt } = require('./utils/emailService');

async function testEmailOnly() {
  console.log('🧪 Testing Email Service Only...\n');
  
  try {
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
    
    console.log('Sending test email...');
    const result = await sendDonationReceipt(mockDonation);
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   Message: ${result.message}`);
    } else {
      console.log('❌ Test email failed!');
      console.log(`   Error: ${result.error}`);
      console.log(`   Message: ${result.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error during email test:', error.message);
  }
}

// Run the test
testEmailOnly();

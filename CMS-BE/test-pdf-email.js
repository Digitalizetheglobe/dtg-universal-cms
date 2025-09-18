const { sendDonationReceipt } = require('./utils/emailService');

async function testPDFEmail() {
  console.log('🧪 Testing PDF Receipt Email...\n');
  
  try {
    // Create a mock donation for testing
    const mockDonation = {
      _id: 'test_donation_456',
      donorName: 'Test Donor PDF',
      donorEmail: 'aikyavidya@hkmhyderabad.org', // Send test to admin email
      donorPhone: '+91-9876543210',
      amount: 2700,
      sevaName: 'ANNADAN SEVA',
      campaign: 'Food Distribution',
      paymentMethod: 'netbanking',
      razorpayPaymentId: 'pay_test456',
      paymentStatus: 'completed',
      isAnonymous: false,
      createdAt: new Date().toISOString()
    };
    
    console.log('Sending PDF receipt email...');
    const result = await sendDonationReceipt(mockDonation);
    
    if (result.success) {
      console.log('✅ PDF receipt email sent successfully!');
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   Message: ${result.message}`);
      console.log(`   PDF Filename: ${result.pdfFilename}`);
    } else {
      console.log('❌ PDF receipt email failed!');
      console.log(`   Error: ${result.error}`);
      console.log(`   Message: ${result.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error during PDF email test:', error.message);
  }
}

// Run the test
testPDFEmail();

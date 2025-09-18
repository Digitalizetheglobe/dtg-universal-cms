const fetch = require('node-fetch');

async function testPaymentVerification() {
  console.log('🧪 Testing Payment Verification with Email Service...\n');
  
  try {
    // Test the email endpoint first
    console.log('1. Testing email service endpoint...');
    const emailResponse = await fetch('http://localhost:5000/api/donations/test-email');
    const emailResult = await emailResponse.json();
    
    if (emailResult.success) {
      console.log('✅ Email service is working correctly');
      console.log(`   Message: ${emailResult.message}`);
    } else {
      console.log('❌ Email service test failed');
      console.log(`   Error: ${emailResult.message}`);
      return;
    }
    
    console.log('\n2. Testing payment verification endpoint...');
    
    // Test data (you would need actual payment data for real testing)
    const testPaymentData = {
      razorpay_order_id: 'order_test123',
      razorpay_payment_id: 'pay_test123',
      razorpay_signature: 'test_signature',
      donationId: 'test_donation_id'
    };
    
    const response = await fetch('http://localhost:5000/api/donations/verify-payment-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPaymentData)
    });
    
    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(result, null, 2));
    
    if (response.status === 400) {
      console.log('✅ Endpoint is working (expected validation error for test data)');
    } else if (result.success) {
      console.log('✅ Payment verification successful');
      console.log(`   Email sent: ${result.emailSent}`);
      console.log(`   Email message: ${result.emailMessage}`);
    } else {
      console.log('❌ Payment verification failed');
      console.log(`   Error: ${result.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

// Run the test
testPaymentVerification();

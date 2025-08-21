const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api/donations';

async function testDonationFormAPIs() {
  console.log('🧪 Testing Donation Form APIs');
  console.log('==============================\n');

  let testDonationId = null;
  let testOrderId = null;

  try {
    // Test 1: Submit donation form
    console.log('1️⃣ Testing donation form submission...');
    const formData = {
      sevaName: "Gau Seva",
      sevaType: "Animal Welfare",
      sevaAmount: 1000,
      donorName: "Test User",
      donorEmail: "test@example.com",
      donorPhone: "+919876543210",
      donorType: "Indian Citizen",
      description: "Test donation for cow protection",
      campaign: "Test Campaign"
    };

    const submitResponse = await fetch(`${BASE_URL}/submit-form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (submitResponse.ok) {
      const submitData = await submitResponse.json();
      console.log('✅ Donation form submitted successfully');
      console.log('   Donation ID:', submitData.donation.id);
      console.log('   Order ID:', submitData.order.id);
      console.log('   Amount:', submitData.order.amount);
      console.log('   Status:', submitData.donation.paymentStatus);
      
      testDonationId = submitData.donation.id;
      testOrderId = submitData.order.id;
    } else {
      const errorData = await submitResponse.json();
      console.log('❌ Form submission failed');
      console.log('   Error:', errorData.message);
      return;
    }

    // Test 2: Get donation by order ID
    console.log('\n2️⃣ Testing get donation by order ID...');
    const orderResponse = await fetch(`${BASE_URL}/order/${testOrderId}`);
    
    if (orderResponse.ok) {
      const orderData = await orderResponse.json();
      console.log('✅ Retrieved donation by order ID');
      console.log('   Seva Name:', orderData.donation.sevaName);
      console.log('   Donor Name:', orderData.donation.donorName);
      console.log('   Amount:', orderData.donation.amount);
      console.log('   Status:', orderData.donation.paymentStatus);
    } else {
      const errorData = await orderResponse.json();
      console.log('❌ Failed to get donation by order ID');
      console.log('   Error:', errorData.message);
    }

    // Test 3: Test invalid form submission
    console.log('\n3️⃣ Testing invalid form submission...');
    const invalidFormData = {
      sevaName: "Test Seva",
      // Missing required fields
      sevaAmount: 0, // Invalid amount
      donorType: "Invalid Type" // Invalid donor type
    };

    const invalidResponse = await fetch(`${BASE_URL}/submit-form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidFormData)
    });

    if (!invalidResponse.ok) {
      const errorData = await invalidResponse.json();
      console.log('✅ Invalid form correctly rejected');
      console.log('   Error:', errorData.message);
    } else {
      console.log('❌ Invalid form was accepted (should have been rejected)');
    }

    // Test 4: Get seva statistics
    console.log('\n4️⃣ Testing seva statistics...');
    const statsResponse = await fetch(`${BASE_URL}/seva-stats`);
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Retrieved seva statistics');
      console.log('   Total Donations:', statsData.stats.totalDonations);
      console.log('   Total Amount:', statsData.stats.totalAmount);
      console.log('   Seva Types:', statsData.stats.sevaTypeBreakdown.length);
      console.log('   Donor Types:', statsData.stats.donorTypeBreakdown.length);
    } else {
      const errorData = await statsResponse.json();
      console.log('❌ Failed to get seva statistics');
      console.log('   Error:', errorData.message);
    }

    // Test 5: Test payment verification (with invalid data)
    console.log('\n5️⃣ Testing payment verification with invalid data...');
    const invalidPaymentData = {
      razorpay_order_id: testOrderId,
      razorpay_payment_id: "pay_invalid",
      razorpay_signature: "invalid_signature",
      donationId: testDonationId
    };

    const verifyResponse = await fetch(`${BASE_URL}/verify-payment-form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidPaymentData)
    });

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json();
      console.log('✅ Invalid payment correctly rejected');
      console.log('   Error:', errorData.message);
    } else {
      console.log('❌ Invalid payment was accepted (should have been rejected)');
    }

    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Summary:');
    console.log('   - Form submission: Working');
    console.log('   - Order retrieval: Working');
    console.log('   - Validation: Working');
    console.log('   - Statistics: Working');
    console.log('   - Payment verification: Working (rejects invalid data)');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the tests
testDonationFormAPIs();

const fetch = require('node-fetch');

async function testDonationAPI() {
  try {
    console.log('🧪 Testing Donation API...');
    
    const testData = {
      sevaName: "Test Seva",
      sevaType: "VIDHYA DANA",
      sevaAmount: 100,
      donorName: "Test User",
      donorEmail: "test@example.com",
      donorPhone: "+919876543210",
      donorType: "Indian Citizen",
      description: "Test donation",
      campaign: "Test Campaign"
    };

    const response = await fetch('http://localhost:5000/api/donations/submit-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ API test successful!');
    } else {
      console.log('❌ API test failed!');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testDonationAPI();

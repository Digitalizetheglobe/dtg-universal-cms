const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api/donations';

async function testAPIs() {
  console.log('🧪 Testing Donation APIs');
  console.log('========================\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connection...');
    const statsResponse = await fetch(`${BASE_URL}/stats`);
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Server is running');
      console.log('   Current stats:', stats);
    } else {
      console.log('❌ Server not responding');
      return;
    }

    // Test 2: Test Razorpay connection
    console.log('\n2️⃣ Testing Razorpay connection...');
    const connectionResponse = await fetch(`${BASE_URL}/test-connection`);
    if (connectionResponse.ok) {
      const connection = await connectionResponse.json();
      if (connection.success) {
        console.log('✅ Razorpay connection successful');
        console.log('   Recent payments found:', connection.recentPayments);
        if (connection.samplePayment) {
          console.log('   Sample payment:', connection.samplePayment);
        }
      } else {
        console.log('❌ Razorpay connection failed');
        console.log('   Error:', connection.message);
        console.log('   Credentials status:', connection.credentials);
      }
    } else {
      console.log('❌ Could not test Razorpay connection');
    }

    // Test 3: Test sync functionality
    console.log('\n3️⃣ Testing sync functionality...');
    const syncResponse = await fetch(`${BASE_URL}/sync-razorpay`, {
      method: 'POST'
    });
    if (syncResponse.ok) {
      const sync = await syncResponse.json();
      if (sync.success) {
        console.log('✅ Sync successful');
        console.log('   Synced:', sync.syncedCount, 'payments');
        console.log('   Skipped:', sync.skippedCount, 'payments');
        console.log('   Total found:', sync.totalFound, 'payments');
      } else {
        console.log('❌ Sync failed');
        console.log('   Error:', sync.message);
      }
    } else {
      console.log('❌ Could not test sync');
    }

    // Test 4: Get all donations
    console.log('\n4️⃣ Testing get all donations...');
    const donationsResponse = await fetch(`${BASE_URL}?limit=5`);
    if (donationsResponse.ok) {
      const donations = await donationsResponse.json();
      if (donations.success) {
        console.log('✅ Donations API working');
        console.log('   Total donations:', donations.pagination.totalDonations);
        console.log('   Recent donations:', donations.donations.length);
        if (donations.donations.length > 0) {
          console.log('   Sample donation:', {
            id: donations.donations[0]._id,
            amount: donations.donations[0].amount,
            status: donations.donations[0].paymentStatus,
            paymentId: donations.donations[0].razorpayPaymentId
          });
        }
      } else {
        console.log('❌ Donations API failed');
      }
    } else {
      console.log('❌ Could not fetch donations');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the tests
testAPIs();

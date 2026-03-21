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
      const errorData = await connectionResponse.json().catch(() => ({}));
      console.log('❌ Could not test Razorpay connection');
      console.log('   Status:', connectionResponse.status);
      console.log('   Error:', errorData.message || 'Unknown error');
      console.log('   Details:', errorData.error || 'No details');
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

    // Test 7: Get most recent completed Razorpay donation
    console.log('\n7️⃣ Searching for most recent completed Razorpay donation...');
    const rzpResponse = await fetch(`${BASE_URL}?status=completed&paymentMethod=razorpay&limit=1`);
    if (rzpResponse.ok) {
      const rzpData = await rzpResponse.json();
      if (rzpData.success && rzpData.donations.length > 0) {
        console.log('✅ Found Razorpay donation');
        console.log('   ID:', rzpData.donations[0]._id);
        console.log('   Amount:', rzpData.donations[0].amount);
        console.log('   Razorpay Payment ID:', rzpData.donations[0].razorpayPaymentId);
        console.log('   Created At:', rzpData.donations[0].createdAt);
      } else {
        console.log('❌ No Razorpay completed donations found');
      }
    } else {
      console.log('❌ Could not fetch Razorpay donations');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the tests
testAPIs();

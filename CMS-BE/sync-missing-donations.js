const { syncDonationsFromRazorpay } = require('./controllers/donationController');

async function syncMissingDonations() {
  console.log('🔄 Starting bulk sync of missing donations...\n');
  
  try {
    // Sync donations for September 21st specifically
    const startDate = '2025-09-21';
    const endDate = '2025-09-22';
    
    console.log(`Syncing donations from ${startDate} to ${endDate}`);
    
    // Create a mock request object
    const mockReq = {
      query: {
        startDate: startDate,
        endDate: endDate
      }
    };
    
    // Create a mock response object
    const mockRes = {
      json: (data) => {
        console.log('📊 Sync Results:');
        console.log(`✅ Success: ${data.success}`);
        console.log(`📈 New donations synced: ${data.syncedCount}`);
        console.log(`⏭️  Skipped (already existed): ${data.skippedCount}`);
        console.log(`🔍 Total found in Razorpay: ${data.totalFound}`);
        if (data.statusBreakdown) {
          console.log(`📊 Status breakdown:`, data.statusBreakdown);
        }
        console.log(`📝 Sample new donations:`, data.newDonations?.slice(0, 3));
        
        if (data.success) {
          console.log('\n🎉 Sync completed successfully!');
          console.log(`💰 Expected: 440 transactions, Rs.7.12L+`);
          console.log(`📊 Actual synced: ${data.syncedCount} new transactions`);
        } else {
          console.log('\n❌ Sync failed:', data.message);
        }
      },
      status: (code) => ({
        json: (data) => {
          console.log(`❌ Error ${code}:`, data.message);
        }
      })
    };
    
    // Call the sync function
    await syncDonationsFromRazorpay(mockReq, mockRes);
    
  } catch (error) {
    console.error('❌ Error during bulk sync:', error);
  }
}

// Run the sync
syncMissingDonations();

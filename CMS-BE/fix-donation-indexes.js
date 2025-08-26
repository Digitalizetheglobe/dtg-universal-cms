const mongoose = require('mongoose');
require('dotenv').config();

async function fixDonationIndexes() {
  try {
    console.log('🔧 Fixing Donation Collection Indexes');
    console.log('=====================================\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');
    console.log('✅ Connected to MongoDB');

    // Get the donation collection
    const db = mongoose.connection.db;
    const collection = db.collection('donations');

    // Drop existing indexes
    console.log('🗑️  Dropping existing indexes...');
    await collection.dropIndexes();
    console.log('✅ Dropped all existing indexes');

    // Create new indexes without unique constraints
    console.log('📊 Creating new indexes...');
    
    await collection.createIndex({ razorpayPaymentId: 1 }, { sparse: true });
    console.log('✅ Created razorpayPaymentId index (sparse)');
    
    await collection.createIndex({ razorpayOrderId: 1 }, { sparse: true });
    console.log('✅ Created razorpayOrderId index (sparse)');
    
    await collection.createIndex({ donorEmail: 1 });
    console.log('✅ Created donorEmail index');
    
    await collection.createIndex({ paymentStatus: 1 });
    console.log('✅ Created paymentStatus index');
    
    await collection.createIndex({ createdAt: -1 });
    console.log('✅ Created createdAt index');
    
    await collection.createIndex({ sevaType: 1 });
    console.log('✅ Created sevaType index');
    
    await collection.createIndex({ donorType: 1 });
    console.log('✅ Created donorType index');

    // List all indexes to verify
    const indexes = await collection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach((index, i) => {
      console.log(`   ${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log('\n🎉 Index fix completed successfully!');
    console.log('💡 You can now submit donation forms without duplicate key errors.');

  } catch (error) {
    console.error('❌ Error fixing indexes:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixDonationIndexes();

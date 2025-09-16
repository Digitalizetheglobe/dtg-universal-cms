require('dotenv').config();
const mongoose = require('mongoose');

// Source database (current)
const SOURCE_MONGO_URI = 'mongodb+srv://garibesangmesh:nDIOSD3XXaV75p8h@cluster0.hv3lvyd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Target database (production)
const TARGET_MONGO_URI = 'mongodb+srv://harekrishnamovementdigital_db_user:ZUlKBnZyR3u50Rbs@cluster0.hov6aes.mongodb.net/';

// Flexible donation schema for source (to handle old records)
const sourceDonationSchema = new mongoose.Schema({}, { strict: false });

// Target donation schema (with validation)
const targetDonationSchema = new mongoose.Schema({
  sevaName: {
    type: String,
    required: true,
    trim: true
  },
  sevaType: {
    type: String,
    required: true,
    trim: true
  },
  sevaAmount: {
    type: Number,
    required: true,
    min: 1
  },
  donorName: {
    type: String,
    required: true,
    trim: true
  },
  donorEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  donorPhone: {
    type: String,
    required: true,
    trim: true
  },
  donorType: {
    type: String,
    enum: ['Indian Citizen', 'Foreign Citizen'],
    required: true
  },
  razorpayPaymentId: {
    type: String,
    sparse: true
  },
  razorpayOrderId: {
    type: String,
    sparse: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  currency: {
    type: String,
    default: 'INR'
  },
  description: {
    type: String,
    trim: true
  },
  receipt: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  campaign: {
    type: String,
    trim: true
  },
  utmSource: {
    type: String,
    trim: true
  },
  utmMedium: {
    type: String,
    trim: true
  },
  utmCampaign: {
    type: String,
    trim: true
  },
  utmTerm: {
    type: String,
    trim: true
  },
  utmContent: {
    type: String,
    trim: true
  },
  metadata: {
    paymentMethod: String,
    bank: String,
    cardId: String,
    wallet: String,
    vpa: String,
    email: String,
    contact: String,
    status: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Function to clean and validate donation data
function cleanDonationData(sourceDonation) {
  const cleaned = {
    // Required fields with defaults
    sevaName: sourceDonation.sevaName || 'General Donation',
    sevaType: sourceDonation.sevaType || 'GENERAL DONATION',
    sevaAmount: sourceDonation.sevaAmount || sourceDonation.amount || 1,
    donorName: sourceDonation.donorName || 'Anonymous Donor',
    donorEmail: sourceDonation.donorEmail || 'noemail@example.com',
    donorPhone: sourceDonation.donorPhone || '+919999999999',
    donorType: sourceDonation.donorType || 'Indian Citizen',
    
    // Payment details
    razorpayPaymentId: sourceDonation.razorpayPaymentId,
    razorpayOrderId: sourceDonation.razorpayOrderId,
    paymentStatus: sourceDonation.paymentStatus || 'pending',
    paymentMethod: sourceDonation.paymentMethod,
    amount: sourceDonation.amount || sourceDonation.sevaAmount || 1,
    currency: sourceDonation.currency || 'INR',
    
    // Optional fields
    description: sourceDonation.description,
    receipt: sourceDonation.receipt,
    notes: sourceDonation.notes,
    isAnonymous: sourceDonation.isAnonymous || false,
    campaign: sourceDonation.campaign,
    
    // UTM fields
    utmSource: sourceDonation.utmSource,
    utmMedium: sourceDonation.utmMedium,
    utmCampaign: sourceDonation.utmCampaign,
    utmTerm: sourceDonation.utmTerm,
    utmContent: sourceDonation.utmContent,
    
    // Metadata
    metadata: sourceDonation.metadata,
    
    // Timestamps
    createdAt: sourceDonation.createdAt || new Date(),
    updatedAt: sourceDonation.updatedAt || new Date()
  };
  
  return cleaned;
}

async function migrateDonations() {
  let sourceConnection, targetConnection;
  
  try {
    console.log('🚀 Starting improved donation migration...\n');
    
    // Connect to source database
    console.log('📡 Connecting to source database...');
    sourceConnection = await mongoose.createConnection(SOURCE_MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to source database');
    
    // Connect to target database
    console.log('📡 Connecting to target database...');
    targetConnection = await mongoose.createConnection(TARGET_MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to target database');
    
    // Create models
    const SourceDonation = sourceConnection.model('Donation', sourceDonationSchema);
    const TargetDonation = targetConnection.model('Donation', targetDonationSchema);
    
    // Get all donations from source
    console.log('\n📊 Fetching donations from source database...');
    const sourceDonations = await SourceDonation.find({}).lean();
    console.log(`✅ Found ${sourceDonations.length} donations in source database`);
    
    if (sourceDonations.length === 0) {
      console.log('❌ No donations found in source database');
      return;
    }
    
    // Check existing donations in target
    console.log('\n📊 Checking existing donations in target database...');
    const existingCount = await TargetDonation.countDocuments();
    console.log(`📋 Target database currently has ${existingCount} donations`);
    
    // Show sample data
    console.log('\n📋 Sample source donations:');
    sourceDonations.slice(0, 3).forEach((donation, index) => {
      console.log(`${index + 1}. ${donation.donorName || 'Unknown'} - ₹${donation.amount || 0} - ${donation.paymentStatus || 'unknown'}`);
    });
    
    console.log('\n🔄 Starting migration...');
    
    // Migrate donations
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const donation of sourceDonations) {
      try {
        // Clean the donation data
        const cleanedDonation = cleanDonationData(donation);
        
        // Check if donation already exists in target
        const existingDonation = await TargetDonation.findOne({
          $or: [
            { razorpayPaymentId: cleanedDonation.razorpayPaymentId },
            { 
              donorEmail: cleanedDonation.donorEmail,
              amount: cleanedDonation.amount,
              createdAt: cleanedDonation.createdAt
            }
          ]
        });
        
        if (existingDonation) {
          console.log(`⏭️  Skipping duplicate: ${cleanedDonation.donorName} - ₹${cleanedDonation.amount}`);
          skippedCount++;
          continue;
        }
        
        // Create new donation in target database
        const newDonation = new TargetDonation(cleanedDonation);
        await newDonation.save();
        
        migratedCount++;
        if (migratedCount % 10 === 0) {
          console.log(`📈 Migrated ${migratedCount} donations...`);
        }
        
      } catch (error) {
        console.error(`❌ Error migrating donation ${donation._id}:`, error.message);
        errorCount++;
      }
    }
    
    // Final statistics
    console.log('\n🎉 Migration completed!');
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${migratedCount} donations`);
    console.log(`   ⏭️  Skipped (duplicates): ${skippedCount} donations`);
    console.log(`   ❌ Errors: ${errorCount} donations`);
    console.log(`   📋 Total processed: ${migratedCount + skippedCount + errorCount} donations`);
    
    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const finalTargetCount = await TargetDonation.countDocuments();
    console.log(`📊 Target database now has ${finalTargetCount} donations`);
    
    // Show sample migrated data
    const sampleMigrated = await TargetDonation.find({}).sort({ createdAt: -1 }).limit(3);
    console.log('\n📋 Sample migrated donations:');
    sampleMigrated.forEach((donation, index) => {
      console.log(`${index + 1}. ${donation.donorName} - ₹${donation.amount} - ${donation.paymentStatus} - ${donation.sevaName}`);
    });
    
    // Show stats by status
    const statusStats = await TargetDonation.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📈 Donation status breakdown:');
    statusStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} donations (₹${stat.totalAmount})`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('🔍 Full error:', error);
  } finally {
    // Close connections
    if (sourceConnection) {
      await sourceConnection.close();
      console.log('🔌 Closed source database connection');
    }
    if (targetConnection) {
      await targetConnection.close();
      console.log('🔌 Closed target database connection');
    }
  }
}

// Run migration
migrateDonations().then(() => {
  console.log('\n✅ Migration script completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Migration script failed:', error);
  process.exit(1);
});

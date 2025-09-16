require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Source database
const SOURCE_MONGO_URI = 'mongodb+srv://garibesangmesh:nDIOSD3XXaV75p8h@cluster0.hv3lvyd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Donation schema
const donationSchema = new mongoose.Schema({
  sevaName: String,
  sevaType: String,
  sevaAmount: Number,
  donorName: String,
  donorEmail: String,
  donorPhone: String,
  donorType: String,
  razorpayPaymentId: String,
  razorpayOrderId: String,
  paymentStatus: String,
  paymentMethod: String,
  amount: Number,
  currency: String,
  description: String,
  receipt: String,
  notes: String,
  isAnonymous: Boolean,
  campaign: String,
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  utmTerm: String,
  utmContent: String,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}, {
  timestamps: true
});

async function backupDonations() {
  let connection;
  
  try {
    console.log('💾 Starting donation backup...\n');
    
    // Connect to source database
    console.log('📡 Connecting to source database...');
    connection = await mongoose.createConnection(SOURCE_MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to source database');
    
    const Donation = connection.model('Donation', donationSchema);
    
    // Get all donations
    console.log('📊 Fetching all donations...');
    const donations = await Donation.find({}).lean();
    console.log(`✅ Found ${donations.length} donations`);
    
    if (donations.length === 0) {
      console.log('❌ No donations found to backup');
      return;
    }
    
    // Create backup directory
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `donations-backup-${timestamp}.json`);
    
    // Write backup file
    console.log('💾 Writing backup file...');
    fs.writeFileSync(backupFile, JSON.stringify(donations, null, 2));
    
    console.log(`✅ Backup completed: ${backupFile}`);
    console.log(`📊 Backed up ${donations.length} donations`);
    
    // Show file size
    const stats = fs.statSync(backupFile);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`📁 Backup file size: ${fileSizeInMB} MB`);
    
    // Show sample data
    console.log('\n📋 Sample backed up donations:');
    donations.slice(0, 3).forEach((donation, index) => {
      console.log(`${index + 1}. ${donation.donorName} - ₹${donation.amount} - ${donation.paymentStatus}`);
    });
    
    // Show statistics
    const statusCounts = donations.reduce((acc, donation) => {
      acc[donation.paymentStatus] = (acc[donation.paymentStatus] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📈 Donation status breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} donations`);
    });
    
    const totalAmount = donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
    console.log(`\n💰 Total amount: ₹${totalAmount.toLocaleString()}`);
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    console.error('🔍 Full error:', error);
  } finally {
    if (connection) {
      await connection.close();
      console.log('🔌 Closed database connection');
    }
  }
}

// Run backup
backupDonations().then(() => {
  console.log('\n✅ Backup script completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Backup script failed:', error);
  process.exit(1);
});

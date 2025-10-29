const Razorpay = require('razorpay');
const Donation = require('../models/Donation');
const crypto = require('crypto');
const { sendDonationReceipt, testEmailConfiguration } = require('../utils/emailService');

// Initialize Razorpay lazily
let razorpay = null;

const getRazorpayInstance = () => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

// Helper function to check if Razorpay is configured
const isRazorpayConfigured = () => {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
};

// Create a new donation order
const createDonationOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    // Check if Razorpay credentials are configured
    if (!isRazorpayConfigured()) {
      return res.status(500).json({ 
        message: 'Payment gateway not configured. Please contact administrator.' 
      });
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency,
      receipt: receipt || `don_${Date.now().toString().slice(-8)}`,
      notes: {
        notes: notes || 'Donation payment'
      }
    };

    const order = await getRazorpayInstance().orders.create(options);

    res.status(201).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    });
  } catch (error) {
    console.error('Error creating donation order:', error);
    res.status(500).json({ message: 'Error creating donation order', error: error.message });
  }
};

// Verify and save donation payment
const verifyDonationPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donorData } = req.body;

    // Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Get payment details from Razorpay
    const payment = await getRazorpayInstance().payments.fetch(razorpay_payment_id);

    // Create donation record
    const donation = new Donation({
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      donorName: donorData.name,
      donorEmail: donorData.email,
      donorPhone: donorData.phone,
      amount: payment.amount / 100, // Convert from paise to rupees
      currency: payment.currency,
      paymentStatus: payment.status === 'captured' ? 'completed' : 'pending',
      paymentMethod: payment.method,
      description: donorData.description,
      receipt: payment.receipt,
      notes: donorData.notes,
      isAnonymous: donorData.isAnonymous || false,
      campaign: donorData.campaign,
      metadata: {
        paymentMethod: payment.method,
        bank: payment.bank,
        cardId: payment.card_id,
        wallet: payment.wallet,
        vpa: payment.vpa,
        email: payment.email,
        contact: payment.contact
      }
    });

    await donation.save();

    // Send receipt email if payment is completed and donor email exists
    let emailResult = null;
    if (donation.paymentStatus === 'completed' && donation.donorEmail) {
      try {
        console.log(`Sending receipt email to ${donation.donorEmail} for donation ${donation._id}`);
        emailResult = await sendDonationReceipt(donation);
        
        if (emailResult.success) {
          console.log(`Receipt email sent successfully to ${donation.donorEmail}`);
        } else {
          console.error(`Failed to send receipt email to ${donation.donorEmail}:`, emailResult.error);
        }
      } catch (emailError) {
        console.error('Error sending receipt email:', emailError);
        emailResult = {
          success: false,
          error: emailError.message
        };
      }
    }

    res.status(201).json({
      success: true,
      message: 'Donation verified and saved successfully',
      donation: {
        id: donation._id,
        amount: donation.amount,
        status: donation.paymentStatus,
        paymentId: donation.razorpayPaymentId
      },
      emailSent: emailResult ? emailResult.success : false,
      emailMessage: emailResult ? emailResult.message : 'No email sent (payment not completed or no email provided)'
    });
  } catch (error) {
    console.error('Error verifying donation payment:', error);
    res.status(500).json({ message: 'Error verifying donation payment', error: error.message });
  }
};

// Get all donations with pagination and filters
const getAllDonations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate, search } = req.query;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (status) {
      filter.paymentStatus = status;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    if (search) {
      filter.$or = [
        { donorName: { $regex: search, $options: 'i' } },
        { donorEmail: { $regex: search, $options: 'i' } },
        { razorpayPaymentId: { $regex: search, $options: 'i' } }
      ];
    }

    const donations = await Donation.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Donation.countDocuments(filter);

    res.json({
      success: true,
      donations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalDonations: total,
        hasNextPage: skip + donations.length < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ message: 'Error fetching donations', error: error.message });
  }
};

// Get donation by ID
const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.json({
      success: true,
      donation
    });
  } catch (error) {
    console.error('Error fetching donation:', error);
    res.status(500).json({ message: 'Error fetching donation', error: error.message });
  }
};

// Get donation statistics
const getDonationStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const stats = await Donation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalDonations: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
          completedDonations: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] }
          },
          completedAmount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, '$amount', 0] }
          }
        }
      }
    ]);

    // Get status-wise counts
    const statusStats = await Donation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    // Get monthly donations for the last 12 months
    const monthlyStats = await Donation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const result = stats[0] || {
      totalDonations: 0,
      totalAmount: 0,
      avgAmount: 0,
      completedDonations: 0,
      completedAmount: 0
    };

    res.json({
      success: true,
      stats: {
        ...result,
        statusBreakdown: statusStats,
        monthlyBreakdown: monthlyStats
      }
    });
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    res.status(500).json({ message: 'Error fetching donation stats', error: error.message });
  }
};

// Update donation notes
const updateDonationNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { notes },
      { new: true, runValidators: true }
    );

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.json({
      success: true,
      message: 'Donation notes updated successfully',
      donation
    });
  } catch (error) {
    console.error('Error updating donation notes:', error);
    res.status(500).json({ message: 'Error updating donation notes', error: error.message });
  }
};

// Force sync all payments from Razorpay (including failed ones)
const forceSyncAllPayments = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Check if credentials are set
    if (!isRazorpayConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay credentials not configured. Please check your .env file.'
      });
    }

    // Get Razorpay instance
    const razorpayInstance = getRazorpayInstance();
    
    // Fetch ALL payments using pagination
    console.log('Force syncing ALL payments from Razorpay with pagination...');
    let allPayments = [];
    let hasMore = true;
    let skip = 0;
    const limit = 100; // Razorpay's maximum per request
    
    while (hasMore) {
      const options = {
        from: startDate ? new Date(startDate).getTime() / 1000 : undefined,
        to: endDate ? new Date(endDate).getTime() / 1000 : undefined,
        count: limit,
        skip: skip,
        expand: ['card', 'emi', 'offer']
      };
      
      console.log(`Fetching payments batch ${Math.floor(skip/limit) + 1} (skip: ${skip})...`);
      const batch = await razorpayInstance.payments.all(options);
      
      allPayments = allPayments.concat(batch.items);
      console.log(`Fetched ${batch.items.length} payments in this batch. Total so far: ${allPayments.length}`);
      
      // Check if there are more payments
      hasMore = batch.items.length === limit;
      skip += limit;
      
      // Safety break to prevent infinite loops
      if (skip > 10000) {
        console.log('Safety break: Stopping at 10,000 payments to prevent infinite loop');
        break;
      }
    }
    
    console.log(`Found ${allPayments.length} total payments from Razorpay`);
    
    let syncedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let statusCounts = {
      captured: 0,
      failed: 0,
      authorized: 0,
      other: 0
    };

    for (const payment of allPayments) {
      try {
        // Track payment status counts
        if (payment.status === 'captured') {
          statusCounts.captured++;
        } else if (payment.status === 'failed') {
          statusCounts.failed++;
        } else if (payment.status === 'authorized') {
          statusCounts.authorized++;
        } else {
          statusCounts.other++;
        }

        // Map Razorpay status to our status
        let paymentStatus = 'pending';
        if (payment.status === 'captured') {
          paymentStatus = 'completed';
        } else if (payment.status === 'failed') {
          paymentStatus = 'failed';
        } else if (payment.status === 'authorized') {
          paymentStatus = 'pending';
        }

        // Check if donation already exists
        const existingDonation = await Donation.findOne({ 
          razorpayPaymentId: payment.id 
        });

        const donationData = {
          razorpayPaymentId: payment.id,
          razorpayOrderId: payment.order_id,
          donorName: payment.email || payment.contact || 'Anonymous',
          donorEmail: payment.email,
          donorPhone: payment.contact,
          amount: payment.amount / 100,
          currency: payment.currency,
          paymentStatus: paymentStatus,
          paymentMethod: payment.method,
          receipt: payment.receipt,
          metadata: {
            paymentMethod: payment.method,
            bank: payment.bank,
            cardId: payment.card_id,
            wallet: payment.wallet,
            vpa: payment.vpa,
            email: payment.email,
            contact: payment.contact,
            status: payment.status,
            syncedFromRazorpay: true
          }
        };

        if (existingDonation) {
          // Update existing donation with latest data
          await Donation.findOneAndUpdate(
            { razorpayPaymentId: payment.id },
            donationData,
            { new: true }
          );
          updatedCount++;
          console.log(`Updated existing payment: ${payment.id}`);
        } else {
          // Create new donation
          const donation = new Donation(donationData);
          await donation.save();
          syncedCount++;
          console.log(`Created new payment: ${payment.id}`);
        }
      } catch (paymentError) {
        console.error(`Error processing payment ${payment.id}:`, paymentError);
      }
    }

    console.log('Force sync completed:', { syncedCount, updatedCount, skippedCount, statusCounts });

    res.json({
      success: true,
      message: `Force sync completed: ${syncedCount} new, ${updatedCount} updated, ${skippedCount} skipped`,
      syncedCount,
      updatedCount,
      skippedCount,
      totalFound: allPayments.length,
      statusBreakdown: statusCounts
    });
  } catch (error) {
    console.error('Error force syncing payments from Razorpay:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error force syncing payments from Razorpay', 
      error: error.message 
    });
  }
};

// Sync donations from Razorpay (for existing donations)
const syncDonationsFromRazorpay = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Check if credentials are set
    if (!isRazorpayConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay credentials not configured. Please check your .env file.'
      });
    }

    // Get Razorpay instance
    const razorpayInstance = getRazorpayInstance();
    
    const options = {
      from: startDate ? new Date(startDate).getTime() / 1000 : undefined,
      to: endDate ? new Date(endDate).getTime() / 1000 : undefined,
      count: 100,  // Razorpay limit is 100 per request
      expand: ['card', 'emi', 'offer']  // Get more details about payments
    };

    // Fetch ALL payments using pagination
    console.log('Fetching payments from Razorpay with pagination...');
    let allPayments = [];
    let hasMore = true;
    let skip = 0;
    const limit = 100; // Razorpay's maximum per request
    
    while (hasMore) {
      const batchOptions = {
        ...options,
        skip: skip
      };
      
      console.log(`Fetching payments batch ${Math.floor(skip/limit) + 1} (skip: ${skip})...`);
      const batch = await razorpayInstance.payments.all(batchOptions);
      
      allPayments = allPayments.concat(batch.items);
      console.log(`Fetched ${batch.items.length} payments in this batch. Total so far: ${allPayments.length}`);
      
      // Check if there are more payments
      hasMore = batch.items.length === limit;
      skip += limit;
      
      // Safety break to prevent infinite loops
      if (skip > 10000) {
        console.log('Safety break: Stopping at 10,000 payments to prevent infinite loop');
        break;
      }
    }
    
    console.log(`Found ${allPayments.length} total payments from Razorpay`);
    console.log(`Date range: ${startDate} to ${endDate}`);
    
    let syncedCount = 0;
    let newDonations = [];
    let skippedCount = 0;
    let statusCounts = {
      captured: 0,
      failed: 0,
      authorized: 0,
      other: 0
    };

    for (const payment of allPayments) {
      try {
        // Track payment status counts
        if (payment.status === 'captured') {
          statusCounts.captured++;
        } else if (payment.status === 'failed') {
          statusCounts.failed++;
        } else if (payment.status === 'authorized') {
          statusCounts.authorized++;
        } else {
          statusCounts.other++;
        }

        // Debug: Log payment details
        console.log(`Processing payment: ${payment.id}, Status: ${payment.status}, Amount: ${payment.amount}, Date: ${new Date(payment.created_at * 1000).toISOString()}`);

        // Check if donation already exists
        const existingDonation = await Donation.findOne({ 
          razorpayPaymentId: payment.id 
        });

        if (existingDonation) {
          console.log(`Payment ${payment.id} already exists in database`);
          skippedCount++;
        } else {
          console.log(`Payment ${payment.id} not found in database, creating new donation`);
          // Map Razorpay status to our status
          let paymentStatus = 'pending';
          if (payment.status === 'captured') {
            paymentStatus = 'completed';
          } else if (payment.status === 'failed') {
            paymentStatus = 'failed';
          } else if (payment.status === 'authorized') {
            paymentStatus = 'pending';
          }

          const donation = new Donation({
            razorpayPaymentId: payment.id,
            razorpayOrderId: payment.order_id,
            donorName: payment.email || payment.contact || 'Anonymous',
            donorEmail: payment.email,
            donorPhone: payment.contact,
            amount: payment.amount / 100,
            currency: payment.currency,
            paymentStatus: paymentStatus,
            paymentMethod: payment.method,
            receipt: payment.receipt,
            metadata: {
              paymentMethod: payment.method,
              bank: payment.bank,
              cardId: payment.card_id,
              wallet: payment.wallet,
              vpa: payment.vpa,
              email: payment.email,
              contact: payment.contact,
              status: payment.status,
              syncedFromRazorpay: true
            }
          });

          await donation.save();
          newDonations.push(donation);
          syncedCount++;
          console.log(`Synced payment: ${payment.id} - ${payment.amount/100} ${payment.currency}`);
        }
      } catch (paymentError) {
        console.error(`Error processing payment ${payment.id}:`, paymentError);
      }
    }

    console.log('Payment status breakdown:', statusCounts);
    console.log(`Total payments processed: ${allPayments.length}`);
    console.log(`New donations synced: ${syncedCount}`);
    console.log(`Already existed: ${skippedCount}`);

    res.json({
      success: true,
      message: `Synced ${syncedCount} new donations from Razorpay (${skippedCount} already existed)`,
      syncedCount,
      skippedCount,
      totalFound: allPayments.length,
      statusBreakdown: statusCounts,
      newDonations: newDonations.slice(0, 5) // Return first 5 for preview
    });
  } catch (error) {
    console.error('Error syncing donations from Razorpay:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error syncing donations from Razorpay', 
      error: error.message 
    });
  }
};

// Test Razorpay connection
const testRazorpayConnection = async (req, res) => {
  try {
    // Test if credentials are set
    if (!isRazorpayConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay credentials not configured. Please check your .env file.',
        missing: {
          keyId: !process.env.RAZORPAY_KEY_ID,
          keySecret: !process.env.RAZORPAY_KEY_SECRET
        }
      });
    }

    // Test connection by fetching recent payments
    const razorpayInstance = getRazorpayInstance();
    const payments = await razorpayInstance.payments.all({ count: 5 });
    
    res.json({
      success: true,
      message: 'Razorpay connection successful',
      credentials: {
        keyId: process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Missing',
        keySecret: process.env.RAZORPAY_KEY_SECRET ? 'Configured' : 'Missing'
      },
      recentPayments: payments.items.length,
      samplePayment: payments.items[0] ? {
        id: payments.items[0].id,
        amount: payments.items[0].amount,
        status: payments.items[0].status,
        method: payments.items[0].method
      } : null
    });
  } catch (error) {
    console.error('Razorpay connection test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Razorpay connection failed',
      error: error.message,
      credentials: {
        keyId: process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Missing',
        keySecret: process.env.RAZORPAY_KEY_SECRET ? 'Configured' : 'Missing'
      }
    });
  }
};

// Submit donation form and create payment order
const submitDonationForm = async (req, res) => {
  try {
    const {
      sevaName,
      sevaType,
      sevaAmount,
      donorName,
      donorEmail,
      donorPhone,
      donorType,
      description,
      isAnonymous = false,
      campaign,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      // Address fields for Maha Prasadam and 80G
      wantsMahaPrasadam = false,
      wants80G = false,
      address,
      houseApartment,
      village,
      district,
      state,
      pinCode,
      landmark,
      panNumber
    } = req.body;

    // Validate required fields
    if (!sevaName || !sevaType || !sevaAmount || !donorName || !donorEmail || !donorPhone || !donorType) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Validate amount
    if (sevaAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Seva amount must be greater than 0'
      });
    }

    // Validate donor type
    if (!['Indian Citizen', 'Foreign Citizen'].includes(donorType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donor type. Must be either "Indian Citizen" or "Foreign Citizen"'
      });
    }

    // Check if Razorpay credentials are configured
    if (!isRazorpayConfigured()) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured. Please contact administrator.'
      });
    }

    // Create donation record with pending status
    const donation = new Donation({
      sevaName,
      sevaType,
      sevaAmount,
      donorName,
      donorEmail,
      donorPhone,
      donorType,
      amount: sevaAmount,
      description,
      isAnonymous,
      campaign,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      // Address fields for Maha Prasadam and 80G
      wantsMahaPrasadam,
      wants80G,
      address,
      houseApartment,
      village,
      district,
      state,
      pinCode,
      landmark,
      panNumber,
      paymentStatus: 'pending'
    });

    try {
      await donation.save();
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Check if it's a duplicate key error
      if (dbError.code === 11000) {
        return res.status(500).json({
          success: false,
          message: 'Database configuration error. Please contact administrator to fix donation indexes.',
          error: 'Duplicate key error - database indexes need to be updated'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Database error occurred while saving donation',
        error: dbError.message
      });
    }

    // Initialize order variable
    let order = null;

    // Ensure Razorpay is configured
    if (!isRazorpayConfigured()) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured. Please contact administrator.',
        error: 'Razorpay credentials missing'
      });
    }

    // Check if order already exists for this donation
    if (donation.razorpayOrderId) {
      // If order already exists, try to fetch it
      try {
        const razorpayInstance = getRazorpayInstance();
        const existingOrder = await razorpayInstance.orders.fetch(donation.razorpayOrderId);
        if (existingOrder.status === 'paid') {
          return res.status(400).json({
            success: false,
            message: 'This donation has already been paid. Please create a new donation.',
            error: 'Order already paid'
          });
        }
        // If order exists but not paid, use it
        order = existingOrder;
      } catch (fetchError) {
        // If fetch fails, create new order
        console.log('Existing order not found, creating new one...');
      }
    }

    // Create new Razorpay order if none exists
    if (!order) {
      const orderOptions = {
        amount: sevaAmount * 100, // Convert to paise
        currency: 'INR',
        receipt: `don_${donation._id.toString().slice(-8)}_${Date.now().toString().slice(-8)}`,
        notes: {
          donationId: donation._id.toString(),
          sevaName,
          sevaType,
          donorName,
          donorEmail
        }
      };

      try {
        const razorpayInstance = getRazorpayInstance();
        order = await razorpayInstance.orders.create(orderOptions);
        // Save the order ID to the donation
        donation.razorpayOrderId = order.id;
        await donation.save();
      } catch (razorpayError) {
        console.error('Razorpay error:', razorpayError);
        return res.status(500).json({
          success: false,
          message: 'Payment gateway error. Please try again later.',
          error: razorpayError.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Donation form submitted successfully',
      donation: {
        id: donation._id,
        sevaName: donation.sevaName,
        sevaType: donation.sevaType,
        amount: donation.amount,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        paymentStatus: donation.paymentStatus
      },
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    });
  } catch (error) {
    console.error('Error submitting donation form:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting donation form',
      error: error.message
    });
  }
};

// Verify payment and update donation status
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donationId
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !donationId) {
      return res.status(400).json({
        success: false,
        message: 'All payment verification fields are required'
      });
    }

    // Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Find the donation record
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Get payment details from Razorpay
    const payment = await getRazorpayInstance().payments.fetch(razorpay_payment_id);

    // Update donation with payment details
    donation.razorpayPaymentId = razorpay_payment_id;
    donation.paymentStatus = payment.status === 'captured' ? 'completed' : 'pending';
    donation.paymentMethod = payment.method;
    donation.metadata = {
      paymentMethod: payment.method,
      bank: payment.bank,
      cardId: payment.card_id,
      wallet: payment.wallet,
      vpa: payment.vpa,
      email: payment.email,
      contact: payment.contact,
      status: payment.status
    };

    await donation.save();

    // Send receipt email if payment is completed and donor email exists
    let emailResult = null;
    console.log('Email sending check:', {
      paymentStatus: donation.paymentStatus,
      donorEmail: donation.donorEmail,
      shouldSend: donation.paymentStatus === 'completed' && donation.donorEmail
    });
    
    if (donation.paymentStatus === 'completed' && donation.donorEmail) {
      try {
        console.log(`Sending receipt email to ${donation.donorEmail} for donation ${donation._id}`);
        emailResult = await sendDonationReceipt(donation);
        
        if (emailResult.success) {
          console.log(`Receipt email sent successfully to ${donation.donorEmail}`);
        } else {
          console.error(`Failed to send receipt email to ${donation.donorEmail}:`, emailResult.error);
        }
      } catch (emailError) {
        console.error('Error sending receipt email:', emailError);
        emailResult = {
          success: false,
          error: emailError.message
        };
      }
    } else {
      console.log('Email not sent - conditions not met:', {
        paymentStatus: donation.paymentStatus,
        hasEmail: !!donation.donorEmail
      });
    }

    const response = {
      success: true,
      message: 'Payment verified successfully',
      donation: {
        id: donation._id,
        sevaName: donation.sevaName,
        sevaType: donation.sevaType,
        amount: donation.amount,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        paymentStatus: donation.paymentStatus,
        paymentId: donation.razorpayPaymentId
      },
      emailSent: emailResult ? emailResult.success : false,
      emailMessage: emailResult ? emailResult.message : 'No email sent (payment not completed or no email provided)'
    };

    console.log('Payment verification response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
};

// Get donation by order ID (for payment verification)
const getDonationByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const donation = await Donation.findOne({ razorpayOrderId: orderId });
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    res.json({
      success: true,
      donation: {
        id: donation._id,
        sevaName: donation.sevaName,
        sevaType: donation.sevaType,
        amount: donation.amount,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        donorPhone: donation.donorPhone,
        donorType: donation.donorType,
        paymentStatus: donation.paymentStatus,
        orderId: donation.razorpayOrderId,
        description: donation.description,
        campaign: donation.campaign
      }
    });
  } catch (error) {
    console.error('Error fetching donation by order ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching donation',
      error: error.message
    });
  }
};

// Get donation statistics by seva type
const getSevaStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Get overall stats
    const overallStats = await Donation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalDonations: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          completedDonations: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] }
          },
          completedAmount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, '$amount', 0] }
          }
        }
      }
    ]);

    // Get seva type breakdown
    const sevaTypeStats = await Donation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$sevaType',
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] }
          },
          completedAmount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, '$amount', 0] }
          }
        }
      },
      { $sort: { amount: -1 } }
    ]);

    // Get donor type breakdown
    const donorTypeStats = await Donation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$donorType',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    const result = overallStats[0] || {
      totalDonations: 0,
      totalAmount: 0,
      completedDonations: 0,
      completedAmount: 0
    };

    res.json({
      success: true,
      stats: {
        ...result,
        sevaTypeBreakdown: sevaTypeStats,
        donorTypeBreakdown: donorTypeStats
      }
    });
  } catch (error) {
    console.error('Error fetching seva stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching seva statistics',
      error: error.message
    });
  }
};

// Test email configuration
const testEmailService = async (req, res) => {
  try {
    const result = await testEmailConfiguration();
    
    res.json({
      success: result.success,
      message: result.message,
      details: result
    });
  } catch (error) {
    console.error('Error testing email service:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing email service',
      error: error.message
    });
  }
};

// Send receipt email for existing donation
const sendReceiptEmail = async (req, res) => {
  try {
    const { donationId } = req.params;
    
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }
    
    if (!donation.donorEmail) {
      return res.status(400).json({
        success: false,
        message: 'No email address found for this donation'
      });
    }
    
    const result = await sendDonationReceipt(donation);
    
    res.json({
      success: result.success,
      message: result.message,
      details: result
    });
  } catch (error) {
    console.error('Error sending receipt email:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending receipt email',
      error: error.message
    });
  }
};

// PayU Payment Gateway Functions

// Create PayU order
const createPayUOrder = async (req, res) => {
  try {
    const { 
      amount, 
      firstname, 
      email, 
      phone, 
      productinfo, 
      description,
      sevaType,
      donorType,
      donationId  // Donation ID from submit-form
    } = req.body;

    // Validate required fields
    if (!amount || !firstname || !email) {
      return res.status(400).json({ 
        success: false,
        message: 'Amount, name, and email are required' 
      });
    }

    // Validate and format amount for PayU
    // PayU requires amount to be a valid number (can be float or integer)
    let payuAmount;
    try {
      // Convert amount to number and validate
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid amount. Amount must be a positive number.' 
        });
      }
      
      // PayU accepts amount as number or string with 2 decimal places
      // Format to 2 decimal places to avoid precision issues
      payuAmount = numAmount.toFixed(2);
    } catch (error) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid amount format.' 
      });
    }

    // Validate minimum amount (PayU minimum is usually ₹1)
    if (parseFloat(payuAmount) < 1) {
      return res.status(400).json({ 
        success: false,
        message: 'Amount must be at least ₹1.' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email format.' 
      });
    }

    // Validate firstname (should not be empty and should be trimmed)
    const trimmedFirstname = firstname.trim();
    if (!trimmedFirstname || trimmedFirstname.length < 2) {
      return res.status(400).json({ 
        success: false,
        message: 'Name must be at least 2 characters long.' 
      });
    }

    // Check if PayU credentials are configured
    if (!process.env.PAYU_KEY || !process.env.PAYU_SALT) {
      return res.status(500).json({ 
        success: false,
        message: 'PayU credentials not configured. Please contact administrator.' 
      });
    }

    // Determine PayU mode (test or live) - default to live if not specified
    const payuMode = process.env.PAYU_MODE || 'live';
    const isTestMode = payuMode === 'test';

    // Get base URL for callback URLs
    const getBaseUrl = (req) => {
      if (process.env.BASE_URL) {
        // Ensure BASE_URL uses HTTPS in production
        const baseUrl = process.env.BASE_URL;
        // If BASE_URL doesn't specify protocol but we're in production, use HTTPS
        if (process.env.NODE_ENV === 'production' && !baseUrl.startsWith('http')) {
          return `https://${baseUrl}`;
        }
        // Ensure HTTPS in production
        if (process.env.NODE_ENV === 'production' && baseUrl.startsWith('http://')) {
          return baseUrl.replace('http://', 'https://');
        }
        return baseUrl;
      }
      // In production, force HTTPS
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
      // Also check for forwarded protocol (from proxy/load balancer)
      const forwardedProto = req.get('x-forwarded-proto');
      const finalProtocol = forwardedProto || protocol;
      return `${finalProtocol}://${req.get('host')}`;
    };
    const baseUrl = getBaseUrl(req);

    // Generate transaction ID (must be unique, max 30 chars for PayU)
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 9);
    const txnid = `TXN_${timestamp}_${randomStr}`.substring(0, 30);
    
    // Sanitize productinfo (remove special characters that might break hash)
    const sanitizedProductinfo = (productinfo || 'Donation')
      .replace(/[|]/g, '') // Remove pipe characters as they're used in hash
      .substring(0, 100); // PayU limit is 100 chars
    
    // Prepare hash string for SHA-512
    // Format: key|txnid|amount|productinfo|firstname|email|||||||||||salt
    const hashString = `${process.env.PAYU_KEY}|${txnid}|${payuAmount}|${sanitizedProductinfo}|${trimmedFirstname}|${email}|||||||||||${process.env.PAYU_SALT}`;
    
    // Generate SHA-512 hash
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    // Store donationId with txnid for retrieval in callback (if provided)
    // This allows us to link the PayU payment back to the original donation
    let storedDonationId = null;
    if (donationId) {
      // Store donationId temporarily (you could use Redis here, or just pass it in URL)
      storedDonationId = donationId;
    }

    // PayU form data (all fields must be present and correctly formatted)
    // Pass donationId in callback URLs as query param
    const callbackParams = storedDonationId ? `?donationId=${storedDonationId}` : '';
    const payuData = {
      key: process.env.PAYU_KEY,
      txnid: txnid,
      amount: payuAmount, // Formatted amount with 2 decimal places
      productinfo: sanitizedProductinfo,
      firstname: trimmedFirstname,
      email: email,
      phone: phone ? String(phone).substring(0, 15) : '', // Max 15 digits
      surl: `${baseUrl}/api/donations/payu-success${callbackParams}`,
      furl: `${baseUrl}/api/donations/payu-failure${callbackParams}`,
      hash: hash,
      service_provider: 'payu_paisa'
    };

    // PayU gateway URL - use production URL for live mode, test URL for test mode
    const payuUrl = isTestMode 
      ? 'https://test.payu.in/_payment' 
      : 'https://secure.payu.in/_payment';

    // Log PayU order creation (without sensitive data)
    console.log('PayU Order Created:', {
      mode: payuMode,
      txnid: txnid,
      amount: payuAmount,
      firstname: trimmedFirstname,
      email: email,
      phone: phone ? 'provided' : 'not provided',
      productinfo: sanitizedProductinfo,
      baseUrl: baseUrl
    });

    // Log hash string for debugging (DO NOT log actual hash or salt in production)
    if (isTestMode) {
      console.log('PayU Hash String (TEST MODE ONLY):', hashString);
      console.log('PayU Generated Hash:', hash);
    }

    // Return PayU form data
    res.json({
      success: true,
      message: 'PayU order created successfully',
      payuData: payuData,
      payuUrl: payuUrl
    });

  } catch (error) {
    console.error('Error creating PayU order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating PayU order', 
      error: error.message 
    });
  }
};

// PayU success verification
const payuSuccess = async (req, res) => {
  try {
    console.log('=== PayU Success Route Hit ===');
    console.log('Request Method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request Body:', req.body);
    console.log('Request Query:', req.query);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('==============================');
    
    // PayU sends POST data as form-encoded, check both body and query
    // Sometimes PayU might send as query params in redirect, sometimes as POST body
    const params = req.method === 'POST' ? (req.body || req.query) : req.query;
    
    // Get donationId from query params (passed in callback URL)
    const donationId = req.query.donationId || req.body.donationId;
    
    // Log what we receive from PayU (for debugging)
    console.log('PayU Success Callback - Extracted Params:', {
      method: req.method,
      paramsReceived: Object.keys(params || {}),
      hasBody: !!req.body && Object.keys(req.body).length > 0,
      hasQuery: !!req.query && Object.keys(req.query).length > 0
    });
    
    const { 
      mihpayid, 
      status, 
      txnid, 
      amount, 
      productinfo, 
      firstname, 
      email, 
      phone, 
      hash 
    } = params;

    // Validate required fields
    if (!txnid || !status || !hash) {
      console.error('PayU Success: Missing required fields', { txnid, status, hash: !!hash });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/donate?payment=error&reason=missing_data`;
      return res.status(400).send(`
        <html>
          <head>
            <meta http-equiv="refresh" content="5;url=${redirectUrl}">
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .error { color: red; }
            </style>
          </head>
          <body>
            <h2 class="error">Payment Data Missing</h2>
            <p>Required payment data was not received. Please contact support.</p>
            <p>Redirecting...</p>
            <p><a href="${redirectUrl}">Click here if you are not redirected automatically</a></p>
            <script>
              setTimeout(function() {
                window.location.href = '${redirectUrl}';
              }, 5000);
            </script>
          </body>
        </html>
      `);
    }

    // Verify hash
    const hashString = `${process.env.PAYU_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${process.env.PAYU_KEY}`;
    const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

    if (calculatedHash !== hash) {
      console.error('PayU hash verification failed');
      let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      if (process.env.NODE_ENV === 'production' && frontendUrl.startsWith('http://')) {
        frontendUrl = frontendUrl.replace('http://', 'https://');
      }
      const redirectUrl = `${frontendUrl}/donate?payment=error&reason=verification_failed`;
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Payment Verification Failed - Redirecting...</title>
            <script>
              window.location.replace('${redirectUrl}');
            </script>
            <noscript>
              <meta http-equiv="refresh" content="0;url=${redirectUrl}">
            </noscript>
          </head>
          <body>
            <p style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
              Redirecting...
              <br><br>
              <a href="${redirectUrl}">Click here if you are not redirected</a>
            </p>
          </body>
        </html>
      `);
    }

    // Log successful payment
    console.log('PayU Payment Success:', {
      mihpayid,
      status,
      txnid,
      amount,
      firstname,
      email,
      donationId
    });

    // Find or create donation record
    let donation;
    
    // If donationId is provided, find and update existing donation
    if (donationId) {
      try {
        donation = await Donation.findById(donationId);
        if (!donation) {
          console.warn(`Donation ${donationId} not found, creating new record`);
          donation = null;
        } else {
          console.log(`Found existing donation ${donationId}, updating with payment details`);
        }
      } catch (error) {
        console.error('Error finding donation:', error);
        donation = null;
      }
    }

    // Create new donation if not found
    if (!donation) {
      donation = new Donation({
        razorpayPaymentId: mihpayid, // Using same field for PayU payment ID
        razorpayOrderId: txnid, // Using same field for PayU transaction ID
        donorName: firstname,
        donorEmail: email,
        donorPhone: phone,
        amount: parseFloat(amount),
        currency: 'INR',
        paymentStatus: status === 'success' ? 'completed' : 'pending',
        paymentMethod: 'payu',
        description: productinfo,
        sevaType: params.sevaType || req.query.sevaType || 'General',
        donorType: params.donorType || req.query.donorType || 'Individual'
      });
    } else {
      // Update existing donation
      donation.razorpayPaymentId = mihpayid;
      donation.razorpayOrderId = txnid;
      donation.paymentStatus = status === 'success' ? 'completed' : 'pending';
      donation.paymentMethod = 'payu';
      donation.metadata = {
        payuPaymentId: mihpayid,
        payuTransactionId: txnid,
        paymentMethod: 'payu'
      };
    }

    await donation.save();
    console.log('Donation saved/updated:', donation._id);

    // Get frontend URL for redirect - pass donationId so frontend can verify payment
    // Ensure HTTPS in production
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (process.env.NODE_ENV === 'production') {
      // Force HTTPS in production
      if (!frontendUrl.startsWith('http')) {
        frontendUrl = `https://${frontendUrl}`;
      } else if (frontendUrl.startsWith('http://')) {
        frontendUrl = frontendUrl.replace('http://', 'https://');
      }
    }
    const redirectUrl = `${frontendUrl}/donate?payment=success&paymentMethod=payu&donationId=${donation._id}&txnid=${txnid}`;

    // Send success response with immediate redirect (no page shown)
    // Use window.location.replace() to avoid showing backend URL in history
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Successful - Redirecting...</title>
          <script>
            // Immediate redirect without showing this page
            window.location.replace('${redirectUrl}');
          </script>
          <noscript>
            <meta http-equiv="refresh" content="0;url=${redirectUrl}">
          </noscript>
        </head>
        <body>
          <p style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
            Payment successful! Redirecting...
            <br><br>
            <a href="${redirectUrl}">Click here if you are not redirected</a>
          </p>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Error processing PayU success:', error);
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (process.env.NODE_ENV === 'production' && frontendUrl.startsWith('http://')) {
      frontendUrl = frontendUrl.replace('http://', 'https://');
    }
    const redirectUrl = `${frontendUrl}/donate?payment=error&reason=processing_error`;
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Error - Redirecting...</title>
          <script>
            window.location.replace('${redirectUrl}');
          </script>
          <noscript>
            <meta http-equiv="refresh" content="0;url=${redirectUrl}">
          </noscript>
        </head>
        <body>
          <p style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
            Redirecting...
            <br><br>
            <a href="${redirectUrl}">Click here if you are not redirected</a>
          </p>
        </body>
      </html>
    `);
  }
};

// Verify PayU payment (similar to Razorpay verification)
const verifyPayUPayment = async (req, res) => {
  try {
    const {
      donationId,
      txnid
    } = req.body;

    // Validate required fields
    if (!donationId) {
      return res.status(400).json({
        success: false,
        message: 'Donation ID is required'
      });
    }

    // Find the donation record
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Verify donation has PayU payment
    if (!donation.razorpayPaymentId || donation.paymentMethod !== 'payu') {
      return res.status(400).json({
        success: false,
        message: 'This donation does not have a PayU payment'
      });
    }

    // If txnid is provided, verify it matches
    if (txnid && donation.razorpayOrderId !== txnid) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID mismatch'
      });
    }

    // Send receipt email if payment is completed and donor email exists
    let emailResult = null;
    if (donation.paymentStatus === 'completed' && donation.donorEmail) {
      try {
        console.log(`Sending receipt email to ${donation.donorEmail} for PayU donation ${donation._id}`);
        emailResult = await sendDonationReceipt(donation);
        
        if (emailResult.success) {
          console.log(`Receipt email sent successfully to ${donation.donorEmail}`);
        } else {
          console.error(`Failed to send receipt email to ${donation.donorEmail}:`, emailResult.error);
        }
      } catch (emailError) {
        console.error('Error sending receipt email:', emailError);
        emailResult = {
          success: false,
          message: 'Error sending email: ' + emailError.message
        };
      }
    }

    const response = {
      success: true,
      message: 'PayU payment verified successfully',
      donation: {
        id: donation._id,
        sevaName: donation.sevaName,
        sevaType: donation.sevaType,
        amount: donation.amount,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        paymentStatus: donation.paymentStatus,
        paymentId: donation.razorpayPaymentId,
        transactionId: donation.razorpayOrderId
      },
      emailSent: emailResult ? emailResult.success : false,
      emailMessage: emailResult ? emailResult.message : 'No email sent (payment not completed or no email provided)'
    };

    console.log('PayU payment verification response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('Error verifying PayU payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying PayU payment',
      error: error.message
    });
  }
};

// PayU failure handler
const payuFailure = async (req, res) => {
  try {
    console.log('=== PayU Failure Route Hit ===');
    console.log('Request Method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request Body:', req.body);
    console.log('Request Query:', req.query);
    console.log('==============================');
    
    // PayU sends POST data, but also check query params for GET requests (testing/debugging)
    // Sometimes PayU might send as query params in redirect, sometimes as POST body
    const params = req.method === 'POST' ? (req.body || req.query) : req.query;
    
    const { txnid, amount, firstname, email } = params;

    console.log('PayU Payment Failed:', {
      txnid,
      amount,
      firstname,
      email
    });

    // Get frontend URL for redirect
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (process.env.NODE_ENV === 'production' && frontendUrl.startsWith('http://')) {
      frontendUrl = frontendUrl.replace('http://', 'https://');
    }
    const redirectUrl = `${frontendUrl}/donate?payment=failed&txnid=${txnid || 'N/A'}`;

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Failed - Redirecting...</title>
          <script>
            window.location.replace('${redirectUrl}');
          </script>
          <noscript>
            <meta http-equiv="refresh" content="0;url=${redirectUrl}">
          </noscript>
        </head>
        <body>
          <p style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
            Redirecting...
            <br><br>
            <a href="${redirectUrl}">Click here if you are not redirected</a>
          </p>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Error processing PayU failure:', error);
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (process.env.NODE_ENV === 'production' && frontendUrl.startsWith('http://')) {
      frontendUrl = frontendUrl.replace('http://', 'https://');
    }
    const redirectUrl = `${frontendUrl}/donate?payment=error&reason=server_error`;
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Error - Redirecting...</title>
          <script>
            window.location.replace('${redirectUrl}');
          </script>
          <noscript>
            <meta http-equiv="refresh" content="0;url=${redirectUrl}">
          </noscript>
        </head>
        <body>
          <p style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
            Redirecting...
            <br><br>
            <a href="${redirectUrl}">Click here if you are not redirected</a>
          </p>
        </body>
      </html>
    `);
  }
};

module.exports = {
  createDonationOrder,
  verifyDonationPayment,
  getAllDonations,
  getDonationById,
  getDonationStats,
  updateDonationNotes,
  syncDonationsFromRazorpay,
  forceSyncAllPayments,
  testRazorpayConnection,
  submitDonationForm,
  verifyPayment,
  getDonationByOrderId,
  getSevaStats,
  testEmailService,
  sendReceiptEmail,
  createPayUOrder,
  payuSuccess,
  payuFailure,
  verifyPayUPayment
};

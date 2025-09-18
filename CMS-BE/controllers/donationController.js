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
      receipt: receipt || `donation_${Date.now()}`,
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
      count: 100
    };

    console.log('Fetching payments from Razorpay with options:', options);
    const payments = await razorpayInstance.payments.all(options);
    
    console.log(`Found ${payments.items.length} payments from Razorpay`);
    
    let syncedCount = 0;
    let newDonations = [];
    let skippedCount = 0;

    for (const payment of payments.items) {
      try {
        // Check if donation already exists
        const existingDonation = await Donation.findOne({ 
          razorpayPaymentId: payment.id 
        });

        if (!existingDonation) {
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
              status: payment.status
            }
          });

          await donation.save();
          newDonations.push(donation);
          syncedCount++;
          console.log(`Synced payment: ${payment.id} - ${payment.amount/100} ${payment.currency}`);
        } else {
          skippedCount++;
        }
      } catch (paymentError) {
        console.error(`Error processing payment ${payment.id}:`, paymentError);
      }
    }

    res.json({
      success: true,
      message: `Synced ${syncedCount} new donations from Razorpay (${skippedCount} already existed)`,
      syncedCount,
      skippedCount,
      totalFound: payments.items.length,
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
      utmContent
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

    // Create Razorpay order
    const orderOptions = {
      amount: sevaAmount * 100, // Convert to paise
      currency: 'INR',
      receipt: `donation_${donation._id}`,
      notes: {
        donationId: donation._id.toString(),
        sevaName,
        sevaType,
        donorName,
        donorEmail
      }
    };

    let order;
    try {
      order = await getRazorpayInstance().orders.create(orderOptions);
    } catch (razorpayError) {
      console.error('Razorpay error:', razorpayError);
      return res.status(500).json({
        success: false,
        message: 'Payment gateway error. Please try again later.',
        error: razorpayError.message
      });
    }

    // Update donation with order ID
    donation.razorpayOrderId = order.id;
    await donation.save();

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

    res.json({
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
    });
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

module.exports = {
  createDonationOrder,
  verifyDonationPayment,
  getAllDonations,
  getDonationById,
  getDonationStats,
  updateDonationNotes,
  syncDonationsFromRazorpay,
  testRazorpayConnection,
  submitDonationForm,
  verifyPayment,
  getDonationByOrderId,
  getSevaStats,
  testEmailService,
  sendReceiptEmail
};

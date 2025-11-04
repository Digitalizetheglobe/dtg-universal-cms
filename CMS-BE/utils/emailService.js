const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const { generateDonationReceiptPDF, generateReceiptNumber } = require('./pdfReceiptGenerator');

// Email configuration
const emailConfig = {
  host: 'smtp.hostinger.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'noreply_donations@harekrishnavidya.org',
    pass: 'RadhaKrishna#108'
  },
  tls: {
    ciphers: 'SSLv3'
  },
  debug: false,
  logger: false
};

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport(emailConfig);
};

// Function to get logo as base64
const getLogoBase64 = () => {
  try {
    const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
    const logoBuffer = fs.readFileSync(logoPath);
    const logoBase64 = logoBuffer.toString('base64');
    return `data:image/png;base64,${logoBase64}`;
  } catch (error) {
    console.error('Error reading logo file:', error);
    return null;
  }
};

// Email templates
const emailTemplates = {
  donationReceipt: (donation) => {
    const receiptNumber = generateReceiptNumber(donation);
    const formattedDate = formatReceiptDate(donation.createdAt);
    const logoBase64 = getLogoBase64();
    
    // Format full address from donation fields
    const formatAddress = (donation) => {
      const addressParts = [];
      if (donation.houseApartment) addressParts.push(donation.houseApartment);
      if (donation.address) addressParts.push(donation.address);
      if (donation.village) addressParts.push(donation.village);
      if (donation.district) addressParts.push(donation.district);
      if (donation.state) addressParts.push(donation.state);
      if (donation.pinCode) addressParts.push(donation.pinCode);
      return addressParts.join(', ') || 'N/A';
    };
    
    const fullAddress = formatAddress(donation);
    const donorName = donation.isAnonymous ? 'Anonymous Donor' : donation.donorName;
    
    return {
      subject: `Donation Receipt ${receiptNumber} - Hare Krishna Movement`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Donation Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 700px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
            }
            .container {
              background-color: white;
              padding: 20px;
            }
            .header-section {
              display: flex;
              align-items: flex-start;
              gap: 25px;
              margin-bottom: 30px;
            }
            .header-logo {
              width: 120px;
              height: 120px;
              flex-shrink: 0;
            }
            .header-text {
              flex: 1;
              padding-top: 10px;
            }
            .greeting {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              margin: 20px 0;
              color: #333;
            }
            .message-section {
              margin: 20px 0;
            }
            .message-text {
              font-size: 14px;
              line-height: 1.8;
              margin-bottom: 10px;
            }
            .transaction-success {
              background-color: #E3F2FD;
              padding: 12px;
              border-radius: 4px;
              margin: 15px 0;
              font-size: 14px;
              color: #1976D2;
            }
            .details-box {
              background-color: #E3F2FD;
              padding: 15px;
              border-radius: 4px;
              margin: 20px 0;
            }
            .details-title {
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 12px;
              color: #1976D2;
            }
            .detail-item {
              margin-bottom: 8px;
              font-size: 14px;
            }
            .detail-label {
              font-weight: bold;
              display: inline-block;
              min-width: 120px;
            }
            .detail-value {
              color: #333;
            }
            .seva-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            .seva-table th {
              background-color: #BBDEFB;
              padding: 8px;
              text-align: left;
              font-weight: bold;
              border: 1px solid #90CAF9;
            }
            .seva-table td {
              padding: 8px;
              border: 1px solid #90CAF9;
              background-color: white;
            }
            .footer-section {
              margin-top: 30px;
              font-size: 14px;
            }
            .footer-title {
              font-weight: bold;
              margin-bottom: 10px;
            }
            .contact-links {
              margin-top: 10px;
            }
            .contact-links a {
              color: #1976D2;
              text-decoration: none;
            }
            .contact-links a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Logo and Header -->
            <div class="header-section">
              ${logoBase64 ? `<img src="${logoBase64}" alt="Hare Krishna Movement Logo" class="header-logo">` : ''}
              <div class="header-text">
                <div style="font-size: 16px; font-weight: bold; color: #0066CC; margin-bottom: 5px;">
                  SRILA PRABHUPADA'S<br>
                  <span style="font-size: 24px;">HARE KRISHNA</span><br>
                  MOVEMENT INDIA
                </div>
              </div>
            </div>
            
            <!-- Greeting - Center Aligned -->
            <div class="greeting">
              Hare Krishna!
            </div>
            
            <!-- Message Section -->
            <div class="message-section">
              <p class="message-text">
                Dear <strong>${donorName.toUpperCase()}</strong>, Please accept the blessings of Sri Sri Lakshmi Narasimha Swamy.
              </p>
              
              <p class="message-text">
                Thanks for Donating <strong>HARE KRISHNA VIDYA - HARE KRISHNA MOVEMENT INDIA</strong>
              </p>
              
              <div class="transaction-success">
                Your transaction has been completed successfully.
              </div>
            </div>
            
            <!-- Donor Details Box -->
            <div class="details-box">
              <div class="details-title">Donor Details</div>
              <div class="detail-item">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${donorName.toUpperCase()}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Mobile Number:</span>
                <span class="detail-value">${donation.donorPhone || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Email ID:</span>
                <span class="detail-value">
                  ${donation.donorEmail ? `<a href="mailto:${donation.donorEmail}" style="color: #1976D2;">${donation.donorEmail}</a>` : 'N/A'}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Address:</span>
                <span class="detail-value">${fullAddress}</span>
              </div>
            </div>
            
            <!-- Seva Details Box -->
            <div class="details-box">
              <div class="details-title">Seva Details</div>
              <table class="seva-table">
                <thead>
                  <tr>
                    <th>Seva Name</th>
                    <th>Seva Date</th>
                    <th>Seva Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${donation.sevaName || donation.campaign || 'ANNADAAN-Donate any other Amount'}</td>
                    <td>${formattedDate}</td>
                    <td>Rs. ${donation.amount.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Footer -->
            <div class="footer-section">
              <p class="footer-title">Regards,</p>
              <p class="footer-title">HARE KRISHNA VIDYA - HARE KRISHNA MOVEMENT INDIA</p>
              
              <p style="margin-top: 20px; font-weight: bold;">Questions?</p>
              <p style="margin-top: 5px;">Contact us between 9.30 am and 9:00 pm via any of the options below</p>
              
              <div class="contact-links" style="margin-top: 10px;">
                <p><strong>Phone:</strong> <a href="tel:+917207619870">+91 720 761 9870</a></p>
                <p><strong>E-mail:</strong> <a href="mailto:aikyavidya@hkmhyderabad.org">aikyavidya@hkmhyderabad.org</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        SRILA PRABHUPADA'S
        HARE KRISHNA
        MOVEMENT INDIA
        
        Hare Krishna!
        
        Dear ${donorName.toUpperCase()}, Please accept the blessings of Sri Sri Lakshmi Narasimha Swamy.
        
        Thanks for Donating HARE KRISHNA VIDYA - HARE KRISHNA MOVEMENT INDIA
        
        Your transaction has been completed successfully.
        
        Donor Details:
        Name: ${donorName.toUpperCase()}
        Mobile Number: ${donation.donorPhone || 'N/A'}
        Email ID: ${donation.donorEmail || 'N/A'}
        Address: ${fullAddress}
        
        Seva Details:
        Seva Name: ${donation.sevaName || donation.campaign || 'ANNADAAN-Donate any other Amount'}
        Seva Date: ${formattedDate}
        Seva Amount: Rs. ${donation.amount.toLocaleString('en-IN')}
        
        Regards,
        HARE KRISHNA VIDYA - HARE KRISHNA MOVEMENT INDIA
        
        Questions?
        Contact us between 9.30 am and 9:00 pm via any of the options below
        
        Phone: +91 720 761 9870
        E-mail: aikyavidya@hkmhyderabad.org
      `
    };
  }
};


// Helper function to format date
const formatReceiptDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Send donation receipt email
const sendDonationReceipt = async (donation) => {
  try {
    console.log('Starting email sending process for donation:', donation._id || donation.id);
    console.log('Donation email:', donation.donorEmail);
    
    const transporter = createTransporter();
    
    // Verify transporter configuration
    await transporter.verify();
    console.log('Email service is ready to send emails');
    
    // Generate PDF receipt - with better error handling
    console.log('Generating PDF receipt...');
    let pdfBuffer = null;
    let filename = null;
    
    try {
      pdfBuffer = await generateDonationReceiptPDF(donation);
      const receiptNumber = generateReceiptNumber(donation);
      filename = `Donation_Receipt_${receiptNumber.replace(/\//g, '_')}.pdf`;
      console.log('PDF receipt generated successfully:', filename);
    } catch (pdfError) {
      console.error('PDF generation failed, sending email without attachment');
      console.error('PDF Error details:', {
        message: pdfError.message,
        stack: pdfError.stack,
        donationId: donation._id || donation.id
      });
      // Continue without PDF - email will still be sent
    }
    
    // Generate email template
    let template;
    try {
      template = emailTemplates.donationReceipt(donation);
      console.log('Email template generated successfully');
    } catch (templateError) {
      console.error('Email template generation failed:', templateError.message);
      throw new Error('Failed to generate email template: ' + templateError.message);
    }
    
    const mailOptions = {
      from: '"HARE KRISHNA MOVEMENT INDIA" <noreply_donations@harekrishnavidya.org>',
      to: donation.donorEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo: 'aikyavidya@hkmhyderabad.org',
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };
    
    // Debug: Log template info
    console.log('Email template info:');
    console.log('- Subject length:', template.subject.length);
    console.log('- HTML length:', template.html.length);
    console.log('- Text length:', template.text.length);
    console.log('- To:', donation.donorEmail);
    
    // Add PDF attachment only if PDF generation was successful
    if (pdfBuffer && filename) {
      mailOptions.attachments = [
        {
          filename: filename,
          content: pdfBuffer,
          contentType: 'application/pdf',
          disposition: 'attachment',
          cid: 'donation_receipt_pdf'
        }
      ];
      console.log('PDF attachment added:', filename);
    } else {
      console.log('No PDF attachment - PDF generation may have failed');
    }
    
    // Send email
    console.log('Attempting to send email to:', donation.donorEmail);
    let result;
    try {
      result = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully, messageId:', result.messageId);
    } catch (sendError) {
      console.error('Failed to send email:', {
        message: sendError.message,
        code: sendError.code,
        response: sendError.response,
        responseCode: sendError.responseCode
      });
      throw sendError;
    }
    
    if (pdfBuffer && filename) {
      console.log('Donation receipt email with PDF sent successfully:', result.messageId);
      return {
        success: true,
        messageId: result.messageId,
        message: 'Receipt email with PDF attachment sent successfully',
        pdfFilename: filename
      };
    } else {
      console.log('Donation receipt email sent successfully (without PDF):', result.messageId);
      return {
        success: true,
        messageId: result.messageId,
        message: 'Receipt email sent successfully (PDF generation failed)',
        pdfFilename: null
      };
    }
    
  } catch (error) {
    console.error('Error sending donation receipt email:', {
      message: error.message,
      stack: error.stack,
      donationId: donation._id || donation.id,
      donorEmail: donation.donorEmail
    });
    return {
      success: false,
      error: error.message,
      message: 'Failed to send receipt email: ' + error.message
    };
  }
};

// Test email configuration
const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    
    // Send a test email
    const testMailOptions = {
      from: '"HARE KRISHNA MOVEMENT INDIA" <noreply_donations@harekrishnavidya.org>',
      to: 'aikyavidya@hkmhyderabad.org', // Send test email to admin
      subject: 'Email Service Test - HARE KRISHNA MOVEMENT INDIA',
      html: `
        <h2>Email Service Test</h2>
        <p>This is a test email to verify that the email service is working correctly.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>Hare Krishna!</p>
      `,
      text: 'Email Service Test - HARE KRISHNA MOVEMENT INDIA\n\nThis is a test email to verify that the email service is working correctly.\n\nHare Krishna!'
    };
    
    const result = await transporter.sendMail(testMailOptions);
    console.log('Test email sent successfully:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId,
      message: 'Test email sent successfully'
    };
    
  } catch (error) {
    console.error('Error testing email configuration:', error);
    return {
      success: false,
      error: error.message,
      message: 'Email configuration test failed'
    };
  }
};

module.exports = {
  sendDonationReceipt,
  testEmailConfiguration,
  createTransporter,
  emailTemplates
};


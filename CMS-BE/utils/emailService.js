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
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .container {
              background-color: white;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #0066cc;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header-logo {
              width: 120px;
              height: 120px;
              margin: 0 auto 20px auto;
              display: block;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #0066cc;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 14px;
              color: #666;
              margin-bottom: 10px;
            }
            .receipt-title {
              background-color: #0066cc;
              color: white;
              padding: 15px;
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              border-radius: 5px;
              margin-bottom: 25px;
            }
            .receipt-details {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 5px;
              border-left: 4px solid #0066cc;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding: 5px 0;
            }
            .detail-label {
              font-weight: bold;
              color: #555;
            }
            .detail-value {
              color: #333;
            }
            .amount {
              font-size: 18px;
              font-weight: bold;
              color: #28a745;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 14px;
            }
            .mantra {
              background-color: #f0f8ff;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              text-align: center;
              font-style: italic;
              color: #0066cc;
            }
            .contact-info {
              margin-top: 15px;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              ${logoBase64 ? `<img src="${logoBase64}" alt="Hare Krishna Movement Logo" class="header-logo">` : ''}
              <div class="logo"> HARE KRISHNA MOVEMENT INDIA </div>
              <div class="subtitle">Hare Krishna Vidya</div>
              <div class="subtitle">(Serving the Mission of His Divine Grace A.C. Bhaktivedanta Swami Prabhupada)</div>
              <div class="subtitle">A non-profit charitable trust bearing Identification Book IV 188/2015</div>
              <div class="subtitle">HKM PAN No.: AABTH4550P</div>
              <div class="subtitle">Address: Hare Krishna Golden Temple, Road No. 12, Banjara Hills, Hyderabad-500034</div>
              <div class="subtitle">www.harekrishnavidya.org; Email: aikyavidya@hkmhyderabad.org; Ph: +91-7207619870</div>
            </div>
            
            <div class="receipt-title">DONATION RECEIPT</div>
            
            <div class="receipt-details">
              <div class="detail-row">
                <span class="detail-label">Receipt No:</span>
                <span class="detail-value">${receiptNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${formattedDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Donor Name:</span>
                <span class="detail-value">${donation.isAnonymous ? 'Anonymous Donor' : donation.donorName}</span>
              </div>
              ${donation.donorEmail ? `
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${donation.donorEmail}</span>
              </div>
              ` : ''}
              ${donation.donorPhone ? `
              <div class="detail-row">
                <span class="detail-label">Mobile No:</span>
                <span class="detail-value">${donation.donorPhone}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value amount">₹ ${donation.amount.toLocaleString('en-IN')} /-</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">${donation.paymentMethod ? donation.paymentMethod.toUpperCase() : 'Online'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transaction ID:</span>
                <span class="detail-value">${donation.razorpayPaymentId || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Donated Seva:</span>
                <span class="detail-value">${donation.sevaName || donation.campaign || 'ANNADAAN - Donate any other Amount'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Required 80G:</span>
                <span class="detail-value">${donation.wants80G ? 'Yes' : 'No'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Donor PAN Details:</span>
                <span class="detail-value">${donation.wants80G && donation.panNumber ? donation.panNumber : 'Not Applicable'}</span>
              </div>
            </div>
            
            <div class="mantra">
              Hare Krishna Hare Krishna Krishna Krishna Hare Hare<br>
              Hare Rama Hare Rama Rama Rama Hare Hare
            </div>
         
            <div class="footer">
              <div class="contact-info">
                <strong>Hare Krishna Golden Temple</strong><br>
                Road No. 12, Banjara Hills, Hyderabad-500034<br>
                Website: www.harekrishnavidya.org<br>
                Email: aikyavidya@hkmhyderabad.org<br>
                Phone: +91-7207619870
              </div>
              <p style="margin-top: 15px; font-size: 12px;">
                This is an auto-generated receipt and does not require any signature.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        [HARE KRISHNA MOVEMENT INDIA LOGO]
        
        HARE KRISHNA MOVEMENT INDIA - Hare Krishna Vidya
        (Serving the Mission of His Divine Grace A.C. Bhaktivedanta Swami Prabhupada)
        
        DONATION RECEIPT
        
        Receipt No: ${receiptNumber}
        Date: ${formattedDate}
        Donor Name: ${donation.isAnonymous ? 'Anonymous Donor' : donation.donorName}
        ${donation.donorEmail ? `Email: ${donation.donorEmail}` : ''}
        ${donation.donorPhone ? `Mobile No: ${donation.donorPhone}` : ''}
        Amount: ₹ ${donation.amount.toLocaleString('en-IN')} /-
        Payment Method: ${donation.paymentMethod ? donation.paymentMethod.toUpperCase() : 'Online'}
        Transaction ID: ${donation.razorpayPaymentId || 'N/A'}
        Donated Seva: ${donation.sevaName || donation.campaign || 'ANNADAAN - Donate any other Amount'}
        Required 80G: ${donation.wants80G ? 'Yes' : 'No'}
        Donor PAN Details: ${donation.wants80G && donation.panNumber ? donation.panNumber : 'Not Applicable'}
        
        Hare Krishna Hare Krishna Krishna Krishna Hare Hare
        Hare Rama Hare Rama Rama Rama Hare Hare
        
        📧 YOUR RECEIPT IS ATTACHED
        A professional PDF receipt has been attached to this email for your records and tax purposes.
        
        Hare Krishna Golden Temple
        Road No. 12, Banjara Hills, Hyderabad-500034
        Website: www.harekrishnavidya.org
        Email: aikyavidya@hkmhyderabad.org
        Phone: +91-7207619870
        
        This is an auto-generated receipt and does not require any signature.
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
    const transporter = createTransporter();
    
    // Verify transporter configuration
    await transporter.verify();
    console.log('Email service is ready to send emails');
    
    // Generate PDF receipt
    console.log('Generating PDF receipt...');
    let pdfBuffer = null;
    let filename = null;
    
    try {
      pdfBuffer = await generateDonationReceiptPDF(donation);
      const receiptNumber = generateReceiptNumber(donation);
      filename = `Donation_Receipt_${receiptNumber.replace(/\//g, '_')}.pdf`;
      console.log('PDF receipt generated successfully');
    } catch (pdfError) {
      console.error('PDF generation failed, sending email without attachment:', pdfError.message);
    }
    
    const template = emailTemplates.donationReceipt(donation);
    
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
    
    const result = await transporter.sendMail(mailOptions);
    
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
    console.error('Error sending donation receipt email:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send receipt email'
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

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Helper function to convert number to words
const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return 'Zero';
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
  if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
  return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
};

// Format date for receipt
const formatReceiptDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Generate receipt number
const generateReceiptNumber = (donation) => {
  const date = new Date(donation.createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const time = String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0');
  return `HKVIDYA/${year}/${time}`;
};

// Generate PDF receipt buffer
const generatePDFReceipt = async (donation) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 40,
          bottom: 40,
          left: 40,
          right: 40
        }
      });

      // Collect PDF data in buffer
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Colors
      const primaryColor = '#0066CC';
      const darkGray = '#404040';
      const lightGray = '#808080';

      // Page dimensions
      const pageWidth = doc.page.width;
   //   const pageHeight = doc.page.height;
      const margin = 40;
      // Increased logo size
      const logoWidth = 100;
      const logoHeight = 100;
      const logoX = margin;
      const logoY = 25;
      
      // Calculate text area - start text after logo with proper spacing to avoid overlap
      const headerTextStartX = margin + logoWidth + 25; // 25px gap after larger logo
      const headerTextWidth = pageWidth - headerTextStartX - margin;

      // Add logo at the top left
      let logoExists = false;
      try {
        const logoPath = path.join(__dirname, '../public/logo.png');
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, logoX, logoY, { width: logoWidth, height: logoHeight });
          logoExists = true;
        }
      } catch (error) {
        console.log('Logo not found, continuing without logo');
      }

      // Header Section - text positioned to the right of logo to avoid overlap
      let currentY = logoY; // Start at same Y as logo
      const headerStartX = logoExists ? headerTextStartX : margin;
      const headerTextWidthActual = logoExists ? headerTextWidth : pageWidth - 2 * margin;

      doc.fontSize(20)
         .fillColor(primaryColor)
         .font('Helvetica-Bold')
         .text('HARE KRISHNA MOVEMENT INDIA', headerStartX, currentY, { width: headerTextWidthActual });

      currentY += 18;

      doc.fontSize(12)
         .fillColor(darkGray)
         .font('Helvetica')
         .text('Hare Krishna Vidya', headerStartX, currentY, { width: headerTextWidthActual });

      currentY += 14;

      doc.fontSize(9)
         .text('(Serving the Mission of His Divine Grace A.C. Bhaktivedanta Swami Prabhupada)', headerStartX, currentY, { width: headerTextWidthActual });

      currentY += 16;

      doc.fontSize(8)
         .text('A non-profit charitable trust bearing Identification Book IV 188/2015', headerStartX, currentY, { width: headerTextWidthActual });

      currentY += 14;

      doc.fontSize(11)
         .font('Helvetica-Bold')
         .text('HKM PAN No.: AABTH4550P', headerStartX, currentY, { width: headerTextWidthActual });

      currentY += 14;

      doc.fontSize(8)
         .font('Helvetica')
         .text('Address: Hare Krishna Golden Temple, Road No. 12, Banjara Hills, Hyderabad-500034', headerStartX, currentY, { width: headerTextWidthActual });

      currentY += 14;

      doc.fontSize(7)
         .text('www.harekrishnavidya.org; Email: aikyavidya@hkmhyderabad.org; Ph: +91-7207619870', headerStartX, currentY, { width: headerTextWidthActual });

      // Ensure we're below the logo if it exists, and add spacing before receipt title
      // With larger logo (100px), we need more spacing
      if (logoExists) {
        const minY = logoY + logoHeight + 20; // Ensure below larger logo with adequate spacing
        currentY = Math.max(currentY + 15, minY);
      } else {
        currentY += 15; // Spacing between header and receipt title
      }

      // Receipt Title Box
      doc.rect(margin, currentY, pageWidth - 2 * margin, 20)
         .fillColor('black')
         .fill();

      doc.fillColor('white')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('DONATION RECEIPT', margin, currentY + 5, { align: 'center', width: pageWidth - 2 * margin });

      currentY += 35;

      // Receipt Details - better aligned table format
      const receiptNumber = generateReceiptNumber(donation);
      const formattedDate = formatReceiptDate(donation.createdAt);

      doc.fillColor('black')
         .fontSize(10)
         .font('Helvetica');

      // Define column positions for better alignment
      const labelX = margin + 20;
      const valueX = margin + 120;
      const rightLabelX = margin + 300;
      const rightValueX = margin + 380;

      // Row 1: Receipt No and Date
      doc.text('Receipt No:', labelX, currentY)
         .text(receiptNumber, valueX, currentY)
         .text('Date:', rightLabelX, currentY)
         .text(formattedDate, rightValueX, currentY);

      currentY += 20;

      // Row 2: Donor Name (full width)
      doc.text('Name of the Donor:', labelX, currentY)
         .text(donation.isAnonymous ? 'Anonymous Donor' : donation.donorName, valueX, currentY);

      currentY += 20;

      // Row 3: Email and Mobile
      doc.text('Email:', labelX, currentY)
         .text(donation.donorEmail || 'N/A', valueX, currentY)
         .text('Mobile No:', rightLabelX, currentY)
         .text(donation.donorPhone || 'N/A', rightValueX, currentY);

      currentY += 20;

      // Row 4: PAN (if available)
      if (donation.donorPAN) {
        doc.text('Donor PAN No:', labelX, currentY)
           .text(donation.donorPAN, valueX, currentY);
        currentY += 20;
      }

      // Row 5: Amount and In Words
      doc.text('Amount:', labelX, currentY)
         .text(`Rs. ${donation.amount.toLocaleString('en-IN')} /-`, valueX, currentY);

      currentY += 20;

      doc.text('In Words:', labelX, currentY)
         .text(numberToWords(donation.amount) + ' Rupees Only', valueX, currentY, { width: pageWidth - valueX - margin });

      currentY += 30;

      // Row 6: Payment details
      doc.text('Mode of Payment:', labelX, currentY)
         .text(donation.paymentMethod ? donation.paymentMethod.toUpperCase() : 'Online', valueX, currentY)
         .text('Reference No:', rightLabelX, currentY)
         .text(donation.razorpayPaymentId || 'N/A', rightValueX, currentY);

      currentY += 20;

      // Row 7: Transaction Date
      doc.text('Trx Date:', rightLabelX, currentY)
         .text(formattedDate, rightValueX, currentY);

      currentY += 20;

      // Row 8: Donated Seva
      doc.text('Donated Seva:', labelX, currentY)
         .text(donation.sevaName || donation.campaign || 'ANNADAAN - Donate any other Amount', valueX, currentY, { width: pageWidth - valueX - margin });

      currentY += 20;

      // Row 9: Required 80G
      doc.text('Required 80G:', labelX, currentY)
         .text(donation.wants80G ? 'Yes' : 'No', valueX, currentY);

      currentY += 20;

      // Row 10: Donor PAN Details
      doc.text('Donor PAN Details:', labelX, currentY)
         .text(donation.wants80G && donation.panNumber ? donation.panNumber : 'Not Applicable', valueX, currentY);

      currentY += 40;

      // Mantra section - explicitly center aligned
      doc.fillColor(primaryColor)
         .fontSize(11)
         .font('Helvetica-Oblique')
         .text('Hare Krishna Hare Krishna Krishna Krishna Hare Hare', margin, currentY, { 
           align: 'center', 
           width: pageWidth - 2 * margin 
         });
      currentY += 15;
      doc.text('Hare Rama Hare Rama Rama Rama Hare Hare', margin, currentY, { 
         align: 'center', 
         width: pageWidth - 2 * margin 
       });

      currentY += 30;

      // Footer
      doc.fillColor(lightGray)
         .fontSize(8)
         .font('Helvetica')
         .text('This is an auto generated receipt and does not require any signature.', { align: 'center' });

      // Finalize the PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

// Generate PDF receipt and return as buffer
const generateDonationReceiptPDF = async (donation) => {
  try {
    console.log('Generating PDF receipt for donation:', donation._id || donation.id);
    console.log('Donation details:', {
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      amount: donation.amount,
      paymentStatus: donation.paymentStatus
    });
    
    const pdfBuffer = await generatePDFReceipt(donation);
    console.log('PDF receipt generated successfully, buffer size:', pdfBuffer.length, 'bytes');
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF receipt:', {
      message: error.message,
      stack: error.stack,
      donationId: donation._id || donation.id
    });
    throw error;
  }
};

module.exports = {
  generateDonationReceiptPDF,
  generateReceiptNumber,
  formatReceiptDate,
  numberToWords
};
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
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
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

      // Header Section
      doc.fontSize(24)
         .fillColor(primaryColor)
         .text('HARE KRISHNA MOVEMENT', { align: 'center' });

      doc.moveDown(0.5);

      doc.fontSize(12)
         .fillColor(darkGray)
         .text('Hare Krishna Vidya', { align: 'center' });

      doc.moveDown(0.3);

      doc.fontSize(10)
         .text('(Serving the Mission of His Divine Grace A.C. Bhaktivedanta Swami Prabhupada)', { align: 'center' });

      doc.moveDown(0.5);

      doc.fontSize(9)
         .text('A non-profit charitable trust bearing Identification Book IV 188/2015', { align: 'center' });

      doc.moveDown(0.3);

      doc.fontSize(12)
         .text('HKM PAN No.: AABTH4550P', { align: 'center' });

      doc.moveDown(0.5);

      doc.fontSize(9)
         .text('Address: Hare Krishna Golden Temple, Road No. 12, Banjara Hills, Hyderabad-500034', { align: 'center' });

      doc.moveDown(0.3);

      doc.fontSize(8)
         .text('www.harekrishnavidya.org; Email: aikyavidya@hkmhyderabad.org; Ph: +91-7207619870', { align: 'center' });

      doc.moveDown(1);

      // Receipt Title Box
      doc.rect(0, doc.y, doc.page.width, 25)
         .fillColor('black')
         .fill();

      doc.fillColor('white')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('DONATION RECEIPT', { align: 'center', y: doc.y - 15 });

      doc.moveDown(2);

      // Receipt Details
      const receiptNumber = generateReceiptNumber(donation);
      const formattedDate = formatReceiptDate(donation.createdAt);

      doc.fillColor('black')
         .fontSize(10)
         .font('Helvetica');

      // Receipt No and Date
      doc.text('Receipt No:', 50, doc.y)
         .text(receiptNumber, 150, doc.y);

      doc.text('Date:', doc.page.width - 150, doc.y)
         .text(formattedDate, doc.page.width - 100, doc.y, { align: 'right' });

      doc.moveDown(1);

      // Donor Name
      doc.text('Name of the Donor:', 50, doc.y)
         .text(donation.isAnonymous ? 'Anonymous Donor' : donation.donorName, 150, doc.y);

      doc.moveDown(0.7);

      // Address (if available)
      if (donation.donorAddress) {
        doc.text('Address:', 50, doc.y)
           .text(donation.donorAddress, 150, doc.y);
        doc.moveDown(0.7);
      }

      // Mobile and Email
      doc.text('Mobile No:', 50, doc.y)
         .text(donation.donorPhone || 'N/A', 150, doc.y);

      doc.text('Email:', doc.page.width - 150, doc.y)
         .text(donation.donorEmail, doc.page.width - 100, doc.y, { align: 'right' });

      doc.moveDown(0.7);

      // PAN
      if (donation.donorPAN) {
        doc.text('Donor PAN No:', 50, doc.y)
           .text(donation.donorPAN, 150, doc.y);
        doc.moveDown(0.7);
      }

      // Amount
      doc.text('Amount:', 50, doc.y)
         .text(`Rs. ${donation.amount.toLocaleString('en-IN')} /-`, 150, doc.y);

      doc.text('In Words:', doc.page.width - 150, doc.y)
         .text(numberToWords(donation.amount) + ' Rupees Only', doc.page.width - 100, doc.y, { align: 'right' });

      doc.moveDown(0.7);

      // Payment details
      doc.text('Mode of Payment:', 50, doc.y)
         .text(donation.paymentMethod ? donation.paymentMethod.toUpperCase() : 'Online', 150, doc.y);

      doc.text('Reference No:', doc.page.width - 150, doc.y)
         .text(donation.razorpayPaymentId || 'N/A', doc.page.width - 100, doc.y, { align: 'right' });

      doc.moveDown(0.7);

      // Transaction Date
      doc.text('Trx Date:', doc.page.width - 150, doc.y)
         .text(formattedDate, doc.page.width - 100, doc.y, { align: 'right' });

      doc.moveDown(0.7);

      // Donated Seva
      doc.text('Donated Seva:', 50, doc.y)
         .text(donation.sevaName || donation.campaign || 'ANNADAAN - Donate any other Amount', 150, doc.y);

      doc.moveDown(2);

      // Mantra
      doc.fillColor(primaryColor)
         .fontSize(10)
         .font('Helvetica-Oblique')
         .text('Hare Krishna Hare Krishna Krishna Krishna Hare Hare', { align: 'center' })
         .text('Hare Rama Hare Rama Rama Rama Hare Hare', { align: 'center' });

      doc.moveDown(1);

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
    console.log('Generating PDF receipt for donation:', donation._id);
    const pdfBuffer = await generatePDFReceipt(donation);
    console.log('PDF receipt generated successfully');
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF receipt:', error);
    throw error;
  }
};

module.exports = {
  generateDonationReceiptPDF,
  generateReceiptNumber,
  formatReceiptDate,
  numberToWords
};

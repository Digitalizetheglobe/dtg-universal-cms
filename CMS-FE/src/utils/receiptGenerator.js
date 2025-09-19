import jsPDF from 'jspdf';

// Helper function to convert image to base64
const getImageAsBase64 = (imagePath) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = reject;
    img.src = imagePath;
  });
};

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

export const generateDonationReceipt = async (donation) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Set font
    doc.setFont('helvetica');
    
    // Colors
    const primaryColor = [0, 102, 204]; // Blue
    const darkGray = [64, 64, 64];
    const lightGray = [128, 128, 128];
    
    // Add logo (if available)
    try {
      const logoPath = '/ac-logo.png';
      const logoBase64 = await getImageAsBase64(logoPath);
      doc.addImage(logoBase64, 'PNG', 20, 20, 40, 40);
    } catch (error) {
      console.log('Logo not found, continuing without logo');
      // Add a placeholder text logo if image fails to load
      doc.setFontSize(8);
      doc.setTextColor(...primaryColor);
      doc.text('HARE KRISHNA', 20, 35);
      doc.text('VIDYA', 20, 45);
    }
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.text('HARE KRISHNA MOVEMENT INDIA', pageWidth - 20, 30, { align: 'right' });
    
    // Mission statement
    doc.setFontSize(10);
    doc.setTextColor(...darkGray);
    const missionText = '(Serving the Mission of His Divine Grace A.C. Bhaktivedanta Swami Prabhupada)';
    const missionLines = doc.splitTextToSize(missionText, 130);
    let headerY = 40;
    doc.text(missionLines, pageWidth - 20, headerY, { align: 'right' });
    headerY += missionLines.length * 4 + 2;
    
    const trustText = 'A non-profit charitable trust bearing Identification Book IV 188/2015';
    const trustLines = doc.splitTextToSize(trustText, 130);
    doc.text(trustLines, pageWidth - 20, headerY, { align: 'right' });
    headerY += trustLines.length * 4 + 2;
    
    // PAN Number
    doc.setFontSize(12);
    doc.setTextColor(...darkGray);
    doc.text('HKM PAN No.: AABTH4550P', pageWidth - 20, headerY, { align: 'right' });
    headerY += 8;
    
    // Branch details
    doc.setFontSize(10);
    const branchText = 'Address: Hare Krishna Golden Temple, Road No. 12, Banjara Hills, Hyderabad-500034';
    const branchLines = doc.splitTextToSize(branchText, 130);
    doc.text(branchLines, pageWidth - 20, headerY, { align: 'right' });
    headerY += branchLines.length * 4 + 2;
    
    // Contact info
    const contactText = 'www.harekrishnavidya.org; Email:aikyavidya@hkmhyderabad.org: Ph:+91-7207619870';
    const contactLines = doc.splitTextToSize(contactText, 130);
    doc.text(contactLines, pageWidth - 20, headerY, { align: 'right' });
    
    // Receipt title box - position dynamically based on header content
    const receiptBoxY = Math.max(headerY + 10, 80);
    doc.setFillColor(0, 0, 0);
    doc.rect(20, receiptBoxY, pageWidth - 40, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('DONATION RECEIPT', pageWidth / 2, receiptBoxY + 10, { align: 'center' });
    
    // Reset font
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkGray);
    
    // Receipt details - start after the receipt title box
    const detailsStartY = receiptBoxY + 25;
    let currentY = detailsStartY;
    const leftColumnX = 20;
    const rightColumnX = 120; // Fixed position for right column labels
    const leftValueX = 70; // Increased spacing for left values
    const rightValueX = pageWidth - 20;
    
    // Receipt No and Date
    doc.setFontSize(10);
    doc.text('Receipt No:', leftColumnX, currentY);
    doc.text(generateReceiptNumber(donation), leftValueX, currentY);
    doc.text('Date:', rightColumnX, currentY);
    doc.text(formatReceiptDate(donation.createdAt), rightValueX, currentY, { align: 'right' });
    
    currentY += 15; // Increased spacing
    
    // Donor Name
    doc.text('Name of the Donor:', leftColumnX, currentY);
    doc.text(donation.isAnonymous ? 'Anonymous Donor' : donation.donorName, leftValueX, currentY);
    currentY += 15;
    
    // Address (if available)
    if (donation.donorAddress) {
      doc.text('Address:', leftColumnX, currentY);
      const addressLines = doc.splitTextToSize(donation.donorAddress, pageWidth - 120);
      doc.text(addressLines, leftValueX, currentY);
      currentY += Math.max(addressLines.length * 6, 15);
    }
    
    // Mobile and Email
    doc.text('Mobile No:', leftColumnX, currentY);
    doc.text(donation.donorPhone || 'N/A', leftValueX, currentY);
    doc.text('Email:', rightColumnX, currentY);
    doc.text(donation.donorEmail, rightValueX, currentY, { align: 'right' });
    
    currentY += 15;
    
    // PAN and Tax Exemption - Split into separate rows to avoid overlap
    doc.text('Donor PAN No:', leftColumnX, currentY);
    doc.text(donation.donorPAN || '', leftValueX, currentY);
    currentY += 15;
    
    // Tax Exemption on separate line
    // doc.text('Tax Exemption Required(U/S 80G Income Tax):', leftColumnX, currentY);
    // doc.text('No', leftValueX, currentY);
    // currentY += 15;
    
    // Amount
    doc.text('Amount:', leftColumnX, currentY);
    doc.text(`Rs. ${donation.amount} /-`, leftValueX, currentY);
    doc.text('In Words:', rightColumnX, currentY);
    const amountInWords = numberToWords(donation.amount) + ' Rupees Only';
    const amountLines = doc.splitTextToSize(amountInWords, 80);
    doc.text(amountLines, rightValueX, currentY, { align: 'right' });
    
    currentY += Math.max(amountLines.length * 6, 15);
    
    // Payment details
    doc.text('Mode of Payment:', leftColumnX, currentY);
    doc.text(donation.paymentMethod ? donation.paymentMethod.toUpperCase() : 'Online', leftValueX, currentY);
    doc.text('Reference No:', rightColumnX, currentY);
    doc.text(donation.razorpayPaymentId || 'N/A', rightValueX, currentY, { align: 'right' });
    
    currentY += 15;
    
    // Transaction Date
    doc.text('Trx Date:', rightColumnX, currentY);
    doc.text(formatReceiptDate(donation.createdAt), rightValueX, currentY, { align: 'right' });
    
    currentY += 15;
    
    // Donated Seva
    doc.text('Donated Seva:', leftColumnX, currentY);
    doc.text(donation.campaign || 'ANNADAAN - Donate any other Amount', leftValueX, currentY);
    
    // Footer
    const footerY = Math.max(currentY + 20, pageHeight - 40);
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    const mantraText = 'Hare Krishna Hare Krishna Krishna Krishna Hare Hare Hare Rama Hare Rama Rama Rama Hare Hare';
    const mantraLines = doc.splitTextToSize(mantraText, pageWidth - 40);
    doc.text(mantraLines, pageWidth / 2, footerY, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setTextColor(...lightGray);
    doc.text('This is an auto generated receipt and does not require any signature.', pageWidth / 2, footerY + 15, { align: 'center' });
    
    // Generate filename
    const receiptNumber = generateReceiptNumber(donation);
    const filename = `Donation_Receipt_${receiptNumber}.pdf`;
    
    // Save the PDF
    doc.save(filename);
    
    return true;
  } catch (error) {
    console.error('Error generating receipt:', error);
    return false;
  }
};
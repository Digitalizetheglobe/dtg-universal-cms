const { generateDonationReceiptPDF } = require('./utils/pdfReceiptGenerator');

async function testPDFGeneration() {
  console.log('🧪 Testing PDF Generation Only...\n');
  
  try {
    // Create a mock donation for testing
    const mockDonation = {
      _id: 'test_donation_456',
      donorName: 'Test Donor PDF',
      donorEmail: 'test@example.com',
      donorPhone: '+91-9876543210',
      amount: 2700,
      sevaName: 'ANNADAN SEVA',
      campaign: 'Food Distribution',
      paymentMethod: 'netbanking',
      razorpayPaymentId: 'pay_test456',
      paymentStatus: 'completed',
      isAnonymous: false,
      createdAt: new Date().toISOString()
    };
    
    console.log('Generating PDF receipt...');
    const pdfBuffer = await generateDonationReceiptPDF(mockDonation);
    
    console.log('✅ PDF generated successfully!');
    console.log(`   PDF Buffer Size: ${pdfBuffer.length} bytes`);
    console.log(`   PDF Buffer Type: ${typeof pdfBuffer}`);
    
    // Save PDF to file for manual inspection
    const fs = require('fs');
    fs.writeFileSync('test_receipt.pdf', pdfBuffer);
    console.log('   PDF saved as test_receipt.pdf for inspection');
    
  } catch (error) {
    console.error('❌ Error during PDF generation:', error.message);
    console.error('   Stack:', error.stack);
  }
}

// Run the test
testPDFGeneration();

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

// Generate HTML receipt
export const generateHTMLReceipt = (donation) => {
  const receiptNumber = generateReceiptNumber(donation);
  const receiptDate = formatReceiptDate(donation.createdAt);
  const amountInWords = numberToWords(donation.amount) + ' Rupees Only';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HARE KRISHNA MOVEMENT INDIA - Donation Receipt</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: Arial, sans-serif;
                background-color: #f5f5f5;
                padding: 20px;
            }
            
            .receipt-container {
                max-width: 800px;
                margin: 0 auto;
                background-color: white;
                padding: 30px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                border-radius: 8px;
            }
            
            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 30px;
                border-bottom: 2px solid #0066cc;
                padding-bottom: 20px;
            }
            
            .logo-section {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .logo-image {
                width: 126px;
                height: 100px;
                object-fit: contain;
                border-radius: 8px;
            }
            
            .organization-info {
                text-align: right;
            }
            
            .organization-name {
                color: #0066cc;
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 8px;
            }
            
            .mission-statement {
                font-size: 11px;
                color: #404040;
                margin-bottom: 4px;
                line-height: 1.3;
            }
            
            .trust-info {
                font-size: 10px;
                color: #404040;
                margin-bottom: 4px;
            }
            
            .pan-number {
                font-size: 12px;
                color: #404040;
                font-weight: bold;
                margin-bottom: 4px;
            }
            
            .branch-info {
                font-size: 10px;
                color: #404040;
                margin-bottom: 4px;
            }
            
            .contact-info {
                font-size: 10px;
                color: #404040;
            }
            
            .receipt-title {
                background-color: #000;
                color: white;
                text-align: center;
                padding: 12px;
                margin: 25px 0;
                font-weight: bold;
                font-size: 18px;
                letter-spacing: 1px;
            }
            
            .receipt-details {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }
            
            .receipt-details tr td {
                padding: 10px 8px;
                vertical-align: top;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .receipt-details .label {
                font-weight: bold;
                color: #333;
                width: 25%;
                font-size: 11px;
            }
            
            .receipt-details .value {
                color: #555;
                font-size: 11px;
            }
            
            .receipt-details .value-right {
                text-align: right;
                color: #555;
                font-size: 11px;
            }
            
            .amount-section {
                background-color: #f8f9fa;
                border: 2px solid #0066cc;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
            }
            
            .amount-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .amount-label {
                font-weight: bold;
                color: #333;
                font-size: 12px;
            }
            
            .amount-value {
                font-size: 16px;
                font-weight: bold;
                color: #0066cc;
            }
            
            .amount-words {
                font-size: 11px;
                color: #666;
                font-style: italic;
            }
            
            .footer {
                margin-top: 40px;
                text-align: center;
                border-top: 2px solid #0066cc;
                padding-top: 20px;
            }
            
            .mantra {
                color: #0066cc;
                font-size: 12px;
                font-weight: bold;
                margin-bottom: 15px;
                line-height: 1.4;
            }
            
            .signature-note {
                font-size: 10px;
                color: #808080;
                font-style: italic;
            }
            
            .button-container {
                text-align: center;
                margin-top: 30px;
            }
            
            .btn {
                background-color: #0066cc;
                color: white;
                border: none;
                padding: 12px 24px;
                cursor: pointer;
                font-size: 14px;
                border-radius: 6px;
                margin: 0 10px;
                transition: background-color 0.3s;
            }
            
            .btn:hover {
                background-color: #0055aa;
            }
            
            .btn-secondary {
                background-color: #6c757d;
            }
            
            .btn-secondary:hover {
                background-color: #5a6268;
            }
            
            @media print {
                body {
                    background-color: white;
                    padding: 0;
                }
                
                .receipt-container {
                    box-shadow: none;
                    padding: 20px;
                }
                
                .button-container {
                    display: none;
                }
                
                .receipt-details tr td {
                    border-bottom: 1px solid #ddd;
                }
            }
        </style>
    </head>
    <body>
        <div class="receipt-container">
            <div class="header">
                <div class="logo-section">
                    <img src="/ac-logo.png" alt="Hare Krishna Vidya Logo" class="logo-image"  />
                </div>
                <div class="organization-info">
                    <div class="organization-name">HARE KRISHNA MOVEMENT INDIA</div>
                    <div class="mission-statement">(Serving the Mission of His Divine Grace A.C. Bhaktivedanta Swami Prabhupada)</div>
                    <div class="trust-info">A non-profit charitable trust bearing Identification Book IV 188/2015</div>
                    <div class="pan-number">HKM PAN No.: AABTH4550P</div>
                    <div class="branch-info">Address: Hare Krishna Golden Temple, Road No. 12, Banjara Hills, Hyderabad-500034</div>
                    <div class="contact-info">www.harekrishnavidya.org; Email:aikyavidya@hkmhyderabad.org: Ph:+91-7207619870</div>
                </div>
            </div>
            
            <div class="receipt-title">DONATION RECEIPT</div>
            
            <table class="receipt-details">
                <tr>
                    <td class="label">Receipt No:</td>
                    <td class="value">${receiptNumber}</td>
                    <td class="label">Date:</td>
                    <td class="value-right">${receiptDate}</td>
                </tr>
                <tr>
                    <td class="label">Name of the Donor:</td>
                    <td class="value" colspan="3">${donation.isAnonymous ? 'Anonymous Donor' : donation.donorName}</td>
                </tr>
                ${donation.donorAddress ? `
                <tr>
                    <td class="label">Address:</td>
                    <td class="value" colspan="3">${donation.donorAddress}</td>
                </tr>
                ` : ''}
                <tr>
                    <td class="label">Mobile No:</td>
                    <td class="value">${donation.donorPhone || 'N/A'}</td>
                    <td class="label">Email:</td>
                    <td class="value-right">${donation.donorEmail}</td>
                </tr>
                <tr>
                    <td class="label">Donor PAN No:</td>
                    <td class="value">${donation.donorPAN || ''}</td>
                    <td class="label">Tax Exemption Required(U/S 80G Income Tax):</td>
                    <td class="value-right">No</td>
                </tr>
            </table>
            
            <div class="amount-section">
                <div class="amount-row">
                    <span class="amount-label">Amount:</span>
                    <span class="amount-value">Rs. ${donation.amount} /-</span>
                </div>
                <div class="amount-words">In Words: ${amountInWords}</div>
            </div>
            
            <table class="receipt-details">
                <tr>
                    <td class="label">Mode of Payment:</td>
                    <td class="value">${donation.paymentMethod ? donation.paymentMethod.toUpperCase() : 'Online'}</td>
                    <td class="label">Reference No:</td>
                    <td class="value-right">${donation.razorpayPaymentId || 'N/A'}</td>
                </tr>
                <tr>
                    <td class="label"></td>
                    <td class="value"></td>
                    <td class="label">Trx Date:</td>
                    <td class="value-right">${receiptDate}</td>
                </tr>
                <tr>
                    <td class="label">Donated Seva:</td>
                    <td class="value" colspan="3">${donation.campaign || 'ANNADAAN - Donate any other Amount'}</td>
                </tr>
            </table>
            
            <div class="footer">
                <div class="mantra">Hare Krishna Hare Krishna Krishna Krishna Hare Hare<br>Hare Rama Hare Rama Rama Rama Hare Hare</div>
                <div class="signature-note">This is an auto generated receipt and does not require any signature.</div>
            </div>
            
            <div class="button-container">
                <button class="btn" onclick="window.print()">Print Receipt</button>
                <button class="btn btn-secondary" onclick="downloadAsPDF()">Download as PDF</button>
            </div>
        </div>

        <script>
            function downloadAsPDF() {
                // You can integrate with jsPDF here if needed
                // For now, we'll use the browser's print to PDF functionality
                window.print();
            }
        </script>
    </body>
    </html>
  `;

  return htmlContent;
};

// Function to open receipt in new window
export const openReceiptInNewWindow = (donation) => {
  const htmlContent = generateHTMLReceipt(donation);
  const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
  
  if (newWindow) {
    newWindow.document.write(htmlContent);
    newWindow.document.close();
  }
};

// Function to download receipt as HTML file
export const downloadReceiptAsHTML = (donation) => {
  const htmlContent = generateHTMLReceipt(donation);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `Donation_Receipt_${generateReceiptNumber(donation)}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

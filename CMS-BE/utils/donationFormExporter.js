const fs = require('fs');
const path = require('path');

const EXPORT_DIR = process.env.DONATION_FORM_EXPORT_DIR || path.join(__dirname, '..', 'exports');
const EXPORT_FILENAME = process.env.DONATION_FORM_EXPORT_FILENAME || 'donation-form-submissions.csv';
const EXPORT_FILE_PATH = path.join(EXPORT_DIR, EXPORT_FILENAME);

// CSV field headers
const CSV_HEADERS = [
  'submittedAt',
  'sevaName',
  'sevaType',
  'sevaAmount',
  'donorName',
  'donorEmail',
  'donorPhone',
  'donorType',
  'description',
  'campaign',
  'isAnonymous',
  'wantsMahaPrasadam',
  'wants80G',
  'address',
  'houseApartment',
  'village',
  'district',
  'state',
  'pinCode',
  'landmark',
  'panNumber',
  'utmSource',
  'utmMedium',
  'utmCampaign',
  'utmTerm',
  'utmContent'
];

// Escape CSV field value (handle commas, quotes, newlines)
const escapeCsvField = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  // Convert boolean to string
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  const stringValue = String(value);
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

// Convert data object to CSV row
const dataToCsvRow = (data) => {
  return CSV_HEADERS.map(header => escapeCsvField(data[header] || '')).join(',');
};

// Ensure export directory and file exist
const ensureExportFileExists = async () => {
  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(EXPORT_DIR)) {
      fs.mkdirSync(EXPORT_DIR, { recursive: true });
    }

    // Create file with headers if it doesn't exist
    if (!fs.existsSync(EXPORT_FILE_PATH)) {
      const headerRow = CSV_HEADERS.join(',');
      fs.writeFileSync(EXPORT_FILE_PATH, headerRow + '\n', 'utf8');
    }
  } catch (error) {
    console.error('Error ensuring export file exists:', error);
    throw error;
  }
};

// Append donation submission to CSV file
const appendDonationSubmission = async (data) => {
  try {
    console.log('📁 Ensuring export file exists...');
    await ensureExportFileExists();
    
    console.log('📝 Converting data to CSV row...');
    const csvRow = dataToCsvRow(data);
    console.log('📄 CSV row length:', csvRow.length, 'characters');
    
    console.log('💾 Appending to file:', EXPORT_FILE_PATH);
    fs.appendFileSync(EXPORT_FILE_PATH, csvRow + '\n', 'utf8');
    
    // Verify the write
    const stats = fs.statSync(EXPORT_FILE_PATH);
    console.log('✅ File updated. New size:', stats.size, 'bytes');
  } catch (error) {
    console.error('❌ Error appending donation submission to export file:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      path: error.path,
      stack: error.stack
    });
    throw error;
  }
};

// Get the path to the export file
const getDonationFormExportPath = () => {
  return EXPORT_FILE_PATH;
};

module.exports = {
  ensureExportFileExists,
  appendDonationSubmission,
  getDonationFormExportPath
};


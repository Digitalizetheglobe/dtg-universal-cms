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
    // Ensure directory exists asynchronously
    if (!fs.existsSync(EXPORT_DIR)) {
      await fs.promises.mkdir(EXPORT_DIR, { recursive: true });
    }

    // Create file with headers if it doesn't exist asynchronously
    if (!fs.existsSync(EXPORT_FILE_PATH)) {
      const headerRow = CSV_HEADERS.join(',');
      await fs.promises.writeFile(EXPORT_FILE_PATH, headerRow + '\n', 'utf8');
    }

    const csvRow = dataToCsvRow(data);

    // Use asynchronous append to not block the event loop
    await fs.promises.appendFile(EXPORT_FILE_PATH, csvRow + '\n', 'utf8');

    console.log('✅ Donation recorded in CSV successfully');
  } catch (error) {
    console.error('❌ Error appending donation submission to export file:', error);
    // Don't throw the error, just log it so the main donation process can continue
  }
};

// Get the path to the export file
const getDonationFormExportPath = () => {
  return EXPORT_FILE_PATH;
};

module.exports = {
  ensureExportFileExists,
  appendDonationSubmission,
  getDonationFormExportPath,
  escapeCsvField
};


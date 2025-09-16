const getBaseUrl = (req) => {
  // If BASE_URL is set in environment, use it
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }
  
  // For development or when BASE_URL is not set
  return `${req.protocol}://${req.get('host')}`;
};

module.exports = { getBaseUrl }; 
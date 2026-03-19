const fs = require('fs');
const path = require('path');

exports.getHomeBanner = (req, res) => {
  const filePath = path.join(__dirname, '../uploads/home-banner.jpg');

  if (fs.existsSync(filePath)) {
    return res.json({ url: "/uploads/home-banner.jpg" });
  }

  res.json({ url: null });
};

exports.uploadHomeBanner = (req, res) => {
  return res.json({ message: 'Home Banner uploaded', url: "/uploads/home-banner.jpg" });
};

exports.deleteHomeBanner = (req, res) => {
  const filePath = path.join(__dirname, '../uploads/home-banner.jpg');

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return res.json({ message: 'Home Banner deleted' });
  }

  return res.json({ message: 'No home banner found' });
};

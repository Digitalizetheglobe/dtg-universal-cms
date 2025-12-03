const fs = require('fs');
const path = require('path');

exports.getBanner = (req, res) => {
  const filePath = path.join(__dirname, '../uploads/banner.jpg');

  if (fs.existsSync(filePath)) {
    return res.json({ url: "/uploads/banner.jpg" });
  }

  res.json({ url: null });
};

exports.uploadBanner = (req, res) => {
  return res.json({ message: 'Banner uploaded', url: "/uploads/banner.jpg" });
};

exports.deleteBanner = (req, res) => {
  const filePath = path.join(__dirname, '../uploads/banner.jpg');

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return res.json({ message: 'Banner deleted' });
  }

  return res.json({ message: 'No banner found' });
};

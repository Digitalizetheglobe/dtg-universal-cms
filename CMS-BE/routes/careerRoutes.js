const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { submitApplication, getApplicants } = require("../controllers/careerController");

// Multer setup for PDF upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files are allowed"), false);
};

const upload = multer({ storage, fileFilter });

// Routes
router.post("/apply", upload.single("cv"), submitApplication);
router.get("/applicants", getApplicants);

module.exports = router;

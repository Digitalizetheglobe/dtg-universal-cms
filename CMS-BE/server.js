const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
console.log("Environment variables loaded:");
console.log("MONGO_URI:", process.env.MONGO_URI ? "Set" : "Not set");
console.log(
  "RAZORPAY_KEY_ID:",
  process.env.RAZORPAY_KEY_ID ? "Set" : "Not set"
);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "Not set");

connectDB();

const app = express();

// CORS configuration - DEBUGGING VERSION
const corsOptions = {
  origin: true, // Allow all origins temporarily
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "Pragma",
  ],
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Add logging to verify CORS is working
// app.use((req, res, next) => {
//   console.log('CORS Request:', {
//     origin: req.headers.origin,
//     method: req.method,
//     url: req.url
//   });
//   next();
// });

// IMPORTANT: Add body size limits BEFORE other middleware
app.use(
  express.json({
    limit: "50mb",
    extended: true,
  })
);
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/api/forms", require("./routes/formRoutes"));
app.use("/api/testimonials", require("./routes/testimonialRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/email-templates", require("./routes/emailTemplateRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/team", require("./routes/teamRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Add debugging middleware for donation routes
app.use("/api/donations", (req, res, next) => {
  if (req.url === "/payu-success" || req.url === "/payu-failure") {
    console.log(
      `[Route Debug] ${req.method} ${req.url} - Route matched, forwarding to handler`
    );
  }
  next();
});

app.use("/api/donations", require("./routes/donationRoutes"));

// Banner Routing
app.use("/api/banner", require("./routes/bannerRoutes"));

// Career Routing
app.use("/api/career", require("./routes/careerRoutes"));

// Donation Amount Routing
app.use("/api/donation-amounts", require("./routes/donationAmountRoutes"));

// Root
app.get("/", (req, res) => {
  res.send("Universal CMS Backend Running");
});
// ------------------------
// DonateToClause routes
// ------------------------
const donateToClauseRoutes = require("./routes/donateToClause");
app.use("/api/campaigns", donateToClauseRoutes);

// ------------------------
// Build School routes (slug-based)
// ------------------------
const buildSchoolRoutes = require("./routes/build-school");
app.use("/api/build-school", buildSchoolRoutes);

// ------------------------
// Grocery Donation routes
// ------------------------
const groceryRoutes = require("./routes/groceryRoutes");
app.use("/api/grocery", groceryRoutes);

// ------------------------
// Donation Kit routes
// ------------------------
const donationKitRoutes = require("./routes/donationKitRoutes");
app.use("/api/donation-kits", donationKitRoutes);

// ------------------------
// General Support routes
// ------------------------
const generalSupportRoutes = require("./routes/generalSupportRoutes");
app.use("/api/general-support", generalSupportRoutes);

// ------------------------
// Campaigner Campaign routes (for campaign-page)
// ------------------------
const campaignerCampaignRoutes = require("./routes/campaignerCampaignRoutes");
app.use("/api/campaigner-campaigns", campaignerCampaignRoutes);

// ------------------------
// Support Campaign routes (for support-campaign detail page)
// ------------------------
const supportCampaignRoutes = require("./routes/supportCampaignRoutes");
app.use("/api/support-campaign", supportCampaignRoutes);

// 404 handler - must be after all routes
app.use((req, res, next) => {
  console.log(`[404] ${req.method} ${req.url} - Route not found`);
  res.status(404).json({
    error: `Cannot ${req.method} ${req.url}`,
    message: "Route not found. Please check the URL and method.",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving static files from ${path.join(__dirname, 'public')}`);
});

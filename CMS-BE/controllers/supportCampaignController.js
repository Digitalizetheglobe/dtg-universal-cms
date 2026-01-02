// controllers/supportCampaignController.js
// Controller for support-campaign (individual campaign detail page)

// Helper: disable caching
const disableCache = (res) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });
};

// --------------------
// SUPPORT CAMPAIGN DATA
// --------------------
const supportCampaignData = {
  id: "support-compaign",
  title: "Support Value-Based Education for Underprivileged Children",
  description: "Transform young lives through holistic learning and spiritual values",
  hostName: "Priya Sharma",
  category: "Education Initiative",
  backgroundImage: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=1400&h=700&fit=crop",
  
  // Stats
  raisedAmount: 95000,
  goalAmount: 150000,
  supporters: 23,
  daysLeft: 45,
  avgDonation: 4130,
  
  // Mission
  mission: {
    title: "Our Mission",
    description: "Hare Krishna Vidya provides quality education rooted in values, culture, and character-building to underprivileged children across rural Telangana. We believe every child deserves not just academic knowledge, but also moral guidance and spiritual foundation to become compassionate, responsible citizens."
  },
  
  // Fund Utilization
  fundUtilization: [
    {
      icon: "education",
      title: "Quality Education",
      description: "Comprehensive curriculum covering academics, values, and life skills"
    },
    {
      icon: "development",
      title: "Holistic Development",
      description: "Focus on character building, ethics, and spiritual foundation"
    },
    {
      icon: "nutrition",
      title: "Nutritious Meals",
      description: "Daily millet-based meals ensuring proper nutrition for growing minds"
    },
    {
      icon: "safety",
      title: "Safe Environment",
      description: "Caring teachers and secure learning spaces for children to thrive"
    }
  ],
  
  // Donation Options
  donationOptions: [
    { amount: 500, description: "10 bricks for construction" },
    { amount: 2500, description: "One desk and bench set" },
    { amount: 5000, description: "Classroom materials" },
    { amount: 10000, description: "Library setup" }
  ],
  
  // Stories
  stories: [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      tag: "Education",
      title: "First Girl From Her Village to Attend Classes",
      author: "Asha · Student, Age 12",
      text: "Asha walks 3 kilometers daily to our center. She's now teaching her siblings and dreams of becoming a teacher."
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      tag: "Nutrition",
      title: "How One Meal Changed Everything",
      author: "Ravi's Family · Beneficiary",
      text: "Nutritious meals helped Ravi focus in school. His grades improved & his mother says it gave him hope."
    }
  ],
  
  // Testimonials
  testimonials: [
    {
      name: "Priya Sharma",
      role: "Campaign Volunteer",
      quote: "I am volunteering to support this initiative. Every contribution brings us closer to our goal of reaching 1000 villages. Thank you for being part of this journey.",
      imageSrc: "/images/lakshmi-devi.jpg"
    }
  ],
  
  // Thank You Section
  thankYou: {
    title: "Thank You for Your Support",
    description: "Your contribution helps transform children's lives through value-based education. Together, we're building a brighter future rooted in knowledge, values, and compassion."
  }
};

// --------------------
// Get support campaign data
// GET /api/support-campaign
// --------------------
const getSupportCampaign = async (req, res) => {
  try {
    disableCache(res);
    return res.status(200).json(supportCampaignData);
  } catch (error) {
    console.error("Get support campaign error:", error);
    return res.status(500).json({ message: "Failed to fetch support campaign" });
  }
};

// --------------------
// Get support campaign by ID
// GET /api/support-campaign/:id
// --------------------
const getSupportCampaignById = async (req, res) => {
  try {
    disableCache(res);

    const { id } = req.params;
    
    // For now, return the same data, but you can extend this to fetch by ID
    if (id === "support-compaign" || id === supportCampaignData.id) {
      return res.status(200).json(supportCampaignData);
    }

    return res.status(404).json({ message: "Support campaign not found" });
  } catch (error) {
    console.error("Get support campaign by ID error:", error);
    return res.status(500).json({ message: "Failed to fetch support campaign" });
  }
};

// --------------------
// Get donation options for support campaign
// GET /api/support-campaign/:id/donation-options
// --------------------
const getDonationOptions = async (req, res) => {
  try {
    disableCache(res);
    return res.status(200).json(supportCampaignData.donationOptions);
  } catch (error) {
    console.error("Get donation options error:", error);
    return res.status(500).json({ message: "Failed to fetch donation options" });
  }
};

// --------------------
module.exports = {
  getSupportCampaign,
  getSupportCampaignById,
  getDonationOptions,
};


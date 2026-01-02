// Get general support page data
const getGeneralSupport = async (req, res) => {
  try {
    // This data structure matches what the frontend expects
    const generalSupportData = {
      hero: {
        badgeText: "MAKE AN IMPACT",
        title: "General Support",
        subtitle: "Support our mission to reach 1000 villages by 2030",
        backgroundImage: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        heroButtons: [
          "₹Any per kit",
          "1 Child",
          "Full term"
        ]
      },
      details: {
        image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        donationAmountText: "₹ Any Amount",
        title: "General Support",
        description: "Support our mission to reach 1000 villages by 2030",
        packageBadge: "COMPLETE PACKAGE",
        sectionTitle: "What's Included",
        sectionDescription: "Your general donation supports our comprehensive mission providing 2 hours daily education, nutritious food, values, life skills & wellness to underserved children.",
        includedItems: [
          "3-5 Recycled Notebooks (200 pages each)",
          "2 Blue Pens & 2 Pencils",
          "Eraser & Sharpener",
          "Complete Geometry Box",
          "12-Color Pencil Set",
          "15cm Scale & Pencil Pouch"
        ],
        qualityNote: "All items are quality-checked and part of our program since 2021."
      },
      impact: {
        badgeText: "MAKE AN IMPACT",
        heading: "How Your Donation Helps",
        subheading: "Every contribution creates lasting change in children's lives",
        impactPoints: [
          "Supports 2,500+ students across 108 villages",
          "Provides 2,28,000+ working hours of education",
          "Empowers women as Aikya Vidya teachers",
          "Helps achieve our 2030 vision of 1000 villages"
        ],
        successStory: {
          label: "SUCCESS STORY",
          heading: "Real Impact Story",
          text: "Since 2021, we've transformed lives in holy dhams like Ahobilam, Bhadrachalam, and Tirupati. Your donation helps us expand this mission to reach more children who need education, food, and hope."
        }
      },
      form: {
        donationDetails: {
          title: "Donation Details",
          amountLabel: "Select Amount (₹)",
          customAmountLabel: "Custom Amount",
          customAmountInputLabel: "Enter Custom Amount",
          customAmountPlaceholder: "Enter amount"
        },
        personalInformation: {
          title: "Personal Information",
          fields: [
            {
              name: "firstName",
              label: "First Name",
              placeholder: "First Name",
              type: "text",
              required: true
            },
            {
              name: "lastName",
              label: "Last Name",
              placeholder: "Last Name",
              type: "text",
              required: true
            },
            {
              name: "email",
              label: "Email Address",
              placeholder: "Email Address",
              type: "email",
              required: true
            },
            {
              name: "phone",
              label: "Phone Number",
              placeholder: "Phone number",
              type: "text",
              required: true,
              maxLength: 10
            },
            {
              name: "message",
              label: "Message (Optional)",
              placeholder: "Message (Optional)",
              type: "textarea",
              required: false
            }
          ]
        },
        amountOptions: ["500", "1000", "2500", "5000"],
        defaultAmount: "500",
        submitButton: {
          text: "Proceed to Payment: ₹",
          defaultAmount: "0"
        }
      },
      trustIndicators: {
        title: "Why Donate With Us?",
        items: [
          {
            icon: "CheckCircle",
            title: "100% Secure",
            description: "Your payment is encrypted and secure"
          },
          {
            icon: "Shield",
            title: "Tax Deductible",
            description: "Get 80G certificate for tax benefits"
          },
          {
            icon: "CheckCircle",
            title: "Direct Impact",
            description: "100% of donation goes to beneficiaries"
          }
        ]
      },
      impactCard: {
        title: "Your Impact",
        description: "Supports our mission to reach 1000 villages",
        impactText: "Many Lives",
        impactSubtext: "Will be Supported"
      },
      stats: [
        {
          label: "Students Empowered",
          value: "2,500+"
        },
        {
          label: "Villages Reached",
          value: "108"
        },
        {
          label: "Working Hours",
          value: "2,28,000+"
        }
      ]
    };

    res.status(200).json({
      success: true,
      data: generalSupportData
    });
  } catch (error) {
    console.error('Error fetching general support data:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getGeneralSupport
};


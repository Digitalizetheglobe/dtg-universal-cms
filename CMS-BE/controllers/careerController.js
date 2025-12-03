// controllers/careerController.js

const applicants = []; // in-memory storage, replace with DB if needed

exports.submitApplication = (req, res) => {
  try {
    const { name, email, phone, position, dob, gender } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "CV PDF is required" });
    }

    const pdfUrl = `/uploads/${req.file.filename}`;

    const applicant = {
      name,
      email,
      phone,
      position,
      dob, // add DOB
      gender, // add Gender
      pdfUrl,
      date: new Date(),
    };

    applicants.push(applicant);

    res
      .status(201)
      .json({ message: "Application submitted successfully", applicant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getApplicants = (req, res) => {
  res.json(applicants);
};

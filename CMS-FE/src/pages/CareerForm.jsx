// import React, { useState } from "react";
// import axios from "axios";

// const CareerForm = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     position: "",
//     dob: "", // Date of Birth
//     gender: "", // Gender
//     cv: null,
//   });

//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   // Handle input changes
//   const handleChange = (e) => {
//     if (e.target.name === "cv") {
//       setFormData({ ...formData, cv: e.target.files[0] });
//     } else {
//       setFormData({ ...formData, [e.target.name]: e.target.value });
//     }
//   };

//   // Submit form
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.cv) {
//       setMessage("Please upload your CV (PDF)");
//       return;
//     }

//     setLoading(true);
//     setMessage("");

//     try {
//       const data = new FormData();
//       data.append("name", formData.name);
//       data.append("email", formData.email);
//       data.append("phone", formData.phone);
//       data.append("position", formData.position);
//       data.append("dob", formData.dob);
//       data.append("gender", formData.gender);
//       data.append("cv", formData.cv);

//       const res = await axios.post(
//         "http://localhost:5000/api/career/apply",
//         data,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//         }
//       );

//       setMessage(res.data.message);
//       setFormData({
//         name: "",
//         email: "",
//         phone: "",
//         position: "",
//         dob: "",
//         gender: "",
//         cv: null,
//       });
//     } catch (err) {
//       console.error(err);
//       setMessage(err.response?.data?.message || "Error submitting application");
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="career-form-container">
//       <h2>Apply for a Position</h2>
//       <form onSubmit={handleSubmit} encType="multipart/form-data">
//         <input
//           type="text"
//           name="name"
//           placeholder="Full Name"
//           value={formData.name}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={formData.email}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="text"
//           name="phone"
//           placeholder="Phone Number"
//           value={formData.phone}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="text"
//           name="position"
//           placeholder="Position Applying For"
//           value={formData.position}
//           onChange={handleChange}
//           required
//         />

//         {/* Date of Birth */}
//         <label>Date of Birth:</label>
//         <input
//           type="date"
//           name="dob"
//           value={formData.dob}
//           onChange={handleChange}
//           required
//         />

//         {/* Gender */}
//         <label>Gender:</label>
//         <select
//           name="gender"
//           value={formData.gender}
//           onChange={handleChange}
//           required
//         >
//           <option value="">Select Gender</option>
//           <option value="Male">Male</option>
//           <option value="Female">Female</option>
//           <option value="Other">Other</option>
//         </select>

//         <input
//           type="file"
//           name="cv"
//           accept="application/pdf"
//           onChange={handleChange}
//           required
//         />

//         <button type="submit" disabled={loading}>
//           {loading ? "Submitting..." : "Submit"}
//         </button>
//       </form>
//       {message && <p className="form-message">{message}</p>}
//     </div>
//   );
// };

// export default CareerForm;
import React, { useState, useRef } from "react";
import axios from "axios";
import {
  Upload,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Users,
  FileText,
  CheckCircle2,
} from "lucide-react";

const CareerForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    dob: "",
    gender: "",
    cv: null,
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    if (e.target.name === "cv" && e.target.files) {
      setFormData({ ...formData, cv: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleValidation = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Allow only digits
      if (!/^\d*$/.test(value)) return;

      // Allow only max 10 digits
      if (value.length > 10) return;
    }

    if (name === "cv" && e.target.files) {
      setFormData({ ...formData, cv: e.target.files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.cv) {
      setError("Please upload your CV (PDF)");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("position", formData.position);
      data.append("dob", formData.dob);
      data.append("gender", formData.gender);
      data.append("cv", formData.cv);

      // Replace with your backend API
      const response = await axios.post(
        "http://localhost:5000/api/career/apply",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log(response.data);

      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        position: "",
        dob: "",
        gender: "",
        cv: null,
      });
    } catch (err) {
      console.error(err);
      setError("Error submitting application. Please try again.");
    }

    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md rounded-lg border bg-white p-8 text-center shadow-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Application Submitted!
          </h2>
          <p className="mb-6 text-gray-600">
            Thank you for your interest. We'll review your application and
            contact you soon.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="w-full rounded bg-blue-600 py-2 px-4 text-white hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl rounded-xl border bg-white p-6 shadow-md sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 shadow-md">
            <Briefcase className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Join Our Team</h1>
          <p className="mt-2 text-gray-500">
            Take the first step towards an exciting career
          </p>
        </div>

        {error && (
          <p className="mb-4 text-center text-red-600 font-medium">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-2">
              <User className="h-5 w-5 text-blue-600" /> Personal Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="block w-full rounded border-gray-300 pl-10 pr-3 py-2 shadow-sm "
                  />
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative mt-1">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    className="block w-full rounded border-gray-300 pl-10 pr-3 py-2 shadow-sm "
                  />
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <div className="relative mt-1">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleValidation}
                    placeholder="+1 (555) 000-0000"
                    maxLength={10}
                    required
                    className="block w-full rounded border-gray-300 pl-10 pr-3 py-2 shadow-sm "
                  />
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <div className="relative mt-1">
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                    className="block w-full rounded border-gray-300 pl-10 pr-3 py-2 shadow-sm "
                  />
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="relative ">
                <label className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded border-gray-300 pl-3 pr-4 py-2 shadow-sm "
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {/* <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /> */}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Position Applying For
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="Software Engineer"
                    required
                    className="block w-full rounded border-gray-300 pl-10 pr-3 py-2 shadow-sm focus:border-blue-500 "
                  />
                  <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Position */}

          {/* CV Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Resume / CV
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <input
                ref={fileInputRef}
                type="file"
                name="cv"
                accept="application/pdf"
                onChange={handleChange}
                className="hidden"
                required
              />
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 transition group-hover:bg-blue-200">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              {formData.cv ? (
                <p>{formData.cv.name}</p>
              ) : (
                <p>Click to upload your CV (PDF only)</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 py-2 px-4 text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CareerForm;

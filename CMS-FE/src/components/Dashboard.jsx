import React, { useState, useEffect } from "react";
import {
  FaUserFriends,
  FaUserTie,
  FaTasks,
  FaClock,
  FaUserCircle,
  FaLink,
  FaHistory,
  FaUsersCog,
  FaCalendarCheck,
  FaCalendarAlt,
  FaChartBar,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const [battalions, setBattalions] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    chestNumber: "",
    battalionId: "",
    hostelId: "",
    roomNumber: "",
    age: "",
    address: "",
    schoolDetails: "",
    parentsDetails: "",
    parentContactNumber: "",
    relationship: "",
    emailId: "",
    mobileSubmitted: false,
    initialPoints: 0,
    registrationNumber: '',
    collegeName: '',
    alternateMobileNumber: '',
    remark: '',
    batchYear: new Date().getFullYear(),
  });

  const stats = [
    {
      title: "Total Cadets",
      value: 120,
      icon: <FaUserFriends className="text-indigo-500 text-3xl" />,
    },
    {
      title: "Battalion",
      href: "/battalions",
      value: 4,
      icon: <FaUserTie className="text-green-500 text-3xl" />,
    },
    {
      title: "Total Activities",
      value: 15,
      href: "/activities",
      icon: <FaTasks className="text-pink-500 text-3xl" />,
    },
    {
      title: "Pending Outpasses",
      value: 8,
      icon: <FaClock className="text-yellow-500 text-3xl" />,
    },
  ];

  const quickLinks = [
    {
      label: "Manage Cadets",
      icon: <FaUsersCog />,
      href: "/cadets",
      description: "View, edit, and manage all cadets",
      color: "bg-blue-50 hover:bg-blue-100",
    },
    {
      label: "Mark Attendance",
      icon: <FaCalendarCheck />,
      href: "/attendance/mark",
      description: "Record daily attendance",
      color: "bg-green-50 hover:bg-green-100",
    },
    {
      label: "View Attendance",
      icon: <FaCalendarAlt />,
      href: "/attendance/view",
      description: "View attendance records",
      color: "bg-purple-50 hover:bg-purple-100",
    },
    {
      label: "Attendance History",
      icon: <FaChartBar />,
      href: "/attendance/history",
      description: "View individual attendance history",
      color: "bg-yellow-50 hover:bg-yellow-100",
    },
  ];

  const recentActivities = [
    { activity: "Cadet Rohit Patil checked in", time: "2 mins ago" },
    { activity: "Staff meeting scheduled", time: "10 mins ago" },
    { activity: "New activity created", time: "1 hour ago" },
    { activity: "Outpass approved for Cadet #23", time: "2 hours ago" },
  ];

  const fetchBattalions = async () => {
    try {
      const response = await fetch(
        "https://api.ddabattalion.com/api/battalions/"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch battalions");
      }
      const data = await response.json();
      console.log("API Response:", data); // Debug log

      // Handle different response formats
      if (data && typeof data === "object") {
        // If data is an object with a battalions property
        if (data.battalions && Array.isArray(data.battalions)) {
          setBattalions(data.battalions);
        }
        // If data is an array
        else if (Array.isArray(data)) {
          setBattalions(data);
        }
        // If data is an object with a data property
        else if (data.data && Array.isArray(data.data)) {
          setBattalions(data.data);
        } else {
          console.error("Unexpected data format:", data);
          setBattalions([]);
        }
      } else {
        console.error("Invalid data received:", data);
        setBattalions([]);
      }
    } catch (error) {
      console.error("Error fetching battalions:", error);
      setBattalions([]);
    }
  };

  useEffect(() => {
    fetchBattalions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

    // Add useEffect for auto-fill registration number
    useEffect(() => {
      if (formData.parentContactNumber) {
        setFormData(prev => ({
          ...prev,
          registrationNumber: prev.parentContactNumber
        }));
      }
    }, [formData.parentContactNumber]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        //https://api.ddabattalion.com
        "https://api.ddabattalion.com/api/cadets/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            battalionId: Number(formData.battalionId),
            hostelId: Number(formData.hostelId),
            age: Number(formData.age),
            initialPoints: Number(formData.initialPoints),
            batchYear: Number(formData.batchYear),
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success('Cadet created successfully!');
        setShowForm(false);
        setFormData({
          fullName: "",
          chestNumber: "",
          battalionId: "",
          hostelId: "",
          roomNumber: "",
          age: "",
          address: "",
          schoolDetails: "",
          parentsDetails: "",
          parentContactNumber: "",
          relationship: "",
          emailId: "",
          mobileSubmitted: false,
          initialPoints: 0,
          registrationNumber: '',
          collegeName: '',
          alternateMobileNumber: '',
          remark: '',
          batchYear: new Date().getFullYear(),
        });
      } else {
        window.alert(result.message || "Failed to create cadet");
      }
    } catch (error) {
      window.alert("Error creating cadet");
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 md:p-6 animate-fadeIn">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Top Welcome Section */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8 gap-4">
        <div className="flex items-center gap-4">
          <FaUserCircle className="text-4xl md:text-5xl text-indigo-500" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Welcome, Admin!</h1>
            <p className="text-sm md:text-base text-gray-600">
              Here's an overview of your dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
          <button
            onClick={() => setShowForm(true)}
            className="flex-1 md:flex-none bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 md:px-6 md:py-2 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 font-semibold text-sm md:text-base"
          >
            + Create Cadet
          </button>
          <button
            onClick={() => navigate("/activities")}
            className="flex-1 md:flex-none bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 md:px-6 md:py-2 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 font-semibold text-sm md:text-base"
          >
            + Create Activity
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 flex flex-col items-center gap-2 hover:scale-105 hover:shadow-2xl transition-all duration-300 group cursor-pointer animate-fadeIn"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => stat.href && navigate(stat.href)}
          >
            <div className="mb-1 md:mb-2 group-hover:scale-110 transition-transform">
              {stat.icon}
            </div>
            <h2 className="text-sm md:text-lg font-semibold text-gray-700">
              {stat.title}
            </h2>
            <p className="text-base md:text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
              {stat.value}
              {stat.href && (
                <span className="ml-1 md:ml-2 text-xs md:text-sm text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  (View)
                </span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Links Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        {quickLinks.map((link, index) => (
          <div
            key={index}
            onClick={() => navigate(link.href)}
            className={`${link.color} rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 cursor-pointer transform hover:scale-105 transition-all duration-300`}
          >
            <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-4">
              <div className="text-2xl md:text-3xl text-gray-700">
                {link.icon}
              </div>
              <h3 className="text-base md:text-xl font-semibold text-gray-800">
                {link.label}
              </h3>
            </div>
            <p className="text-xs md:text-sm text-gray-600">
              {link.description}
            </p>
          </div>
        ))}
      </div>

      {/* Bento Row: Profile, Quick Links, Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
        {/* Profile Summary */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 flex flex-col items-center animate-fadeIn">
          <FaUserCircle className="text-4xl md:text-6xl text-indigo-400 mb-1 md:mb-2" />
          <h3 className="text-lg md:text-xl font-bold">Admin</h3>
          <p className="text-xs md:text-sm text-gray-500">admin@example.com</p>
          <div className="mt-2 md:mt-4 flex gap-1 md:gap-2">
            <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs">
              Super Admin
            </span>
            <span className="bg-green-100 text-green-600 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs">
              Active
            </span>
          </div>
        </div>
        {/* Quick Links */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 animate-fadeIn">
          <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4 flex items-center gap-2">
            <FaLink /> Quick Links
          </h3>
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {quickLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="flex items-center gap-1 md:gap-2 bg-white rounded-lg shadow p-2 md:p-3 hover:bg-indigo-50 hover:scale-105 transition-all duration-200"
              >
                <span className="text-indigo-500 text-sm md:text-base">
                  {link.icon}
                </span>
                <span className="font-medium text-gray-700 text-xs md:text-sm">
                  {link.label}
                </span>
              </a>
            ))}
          </div>
        </div>
        {/* Recent Activity */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 animate-fadeIn">
          <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4 flex items-center gap-2">
            <FaHistory /> Recent Activity
          </h3>
          <ul className="space-y-2 md:space-y-3">
            {recentActivities.map((item, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center border-b pb-1 md:pb-2 last:border-b-0"
              >
                <span className="text-xs md:text-sm text-gray-700">
                  {item.activity}
                </span>
                <span className="text-xs text-gray-400">{item.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-4 md:p-8 rounded-xl w-full max-w-md md:max-w-4xl shadow-lg max-h-[90vh] overflow-y-auto mx-2">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">
              Create Cadet
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
            >
              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                  required
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  Chest Number
                </label>
                <input
                  type="text"
                  name="chestNumber"
                  value={formData.chestNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                  required
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  Battalion
                </label>
                <select
                  name="battalionId"
                  value={formData.battalionId}
                  onChange={handleInputChange}
                  className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                  required
                >
                  <option value="">Select Battalion</option>
                  {Array.isArray(battalions) &&
                    battalions.map((battalion) => (
                      <option key={battalion.id} value={battalion.id}>
                        {battalion.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  Hostel ID
                </label>
                <input
                  type="number"
                  name="hostelId"
                  value={formData.hostelId}
                  onChange={handleInputChange}
                  className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                  required
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  Room Number
                </label>
                <input
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                />
              </div>

              <div className="space-y-1 md:space-y-2 col-span-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                />
              </div>

              <div className="space-y-1 md:space-y-2 col-span-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  School Details
                </label>
                <input
                  type="text"
                  name="schoolDetails"
                  value={formData.schoolDetails}
                  onChange={handleInputChange}
                  className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                />
              </div>

              <div className="space-y-1 md:space-y-2 col-span-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  Parents Details
                </label>
                <input
                  type="text"
                  name="parentsDetails"
                  value={formData.parentsDetails}
                  onChange={handleInputChange}
                  className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  Parent Contact Number
                </label>
                <input
                  type="text"
                  name="parentContactNumber"
                  value={formData.parentContactNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  Relationship
                </label>
                <input
                  type="text"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleInputChange}
                  className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  Email ID
                </label>
                <input
                  type="email"
                  name="emailId"
                  value={formData.emailId}
                  onChange={handleInputChange}
                  className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  Initial Points
                </label>
                <input
                  type="number"
                  name="initialPoints"
                  value={formData.initialPoints}
                  onChange={handleInputChange}
                  className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                />
              </div>
              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  Registration Number
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  College Name
                </label>
                <input
                  type="text"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleInputChange}
                  className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  Alternate Mobile
                </label>
                <input
                  type="text"
                  name="alternateMobileNumber"
                  value={formData.alternateMobileNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                />
              </div>

              <div className="space-y-1 md:space-y-2 col-span-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  Remark
                </label>
                <textarea
                  name="remark"
                  value={formData.remark}
                  onChange={handleInputChange}
                  className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                  rows="3"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  Batch Year
                </label>
                <input
                  type="number"
                  name="batchYear"
                  value={formData.batchYear}
                  onChange={handleInputChange}
                  min={2000}
                  max={new Date().getFullYear()}
                  className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
                  required
                />
                <p className="text-xs text-gray-500">
                  Enter the year of admission (2000 - {new Date().getFullYear()}
                  )
                </p>
              </div>

              <div className="flex items-center gap-2 col-span-2">
                <input
                  type="checkbox"
                  id="mobileSubmitted"
                  name="mobileSubmitted"
                  checked={formData.mobileSubmitted}
                  onChange={handleInputChange}
                  className="h-4 w-4 md:h-5 md:w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="mobileSubmitted"
                  className="text-xs md:text-sm text-gray-700"
                >
                  Mobile Submitted?
                </label>
              </div>

              <div className="flex justify-end space-x-2 md:space-x-3 col-span-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-1 md:px-4 md:py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition-colors text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 md:px-4 md:py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm md:text-base"
                >
                  Create Cadet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Animations */}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.7s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

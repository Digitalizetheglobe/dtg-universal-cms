import React from "react";
import { Link } from "react-router-dom";
import { FaImage, FaDonate, FaHome, FaInfoCircle } from "react-icons/fa";

const GalleryDashboard = () => {
  const galleries = [
    {
      title: "Donation Gallery",
      description: "Manage photos related to donation activities and impact.",
      icon: <FaDonate className="text-4xl text-green-500" />,
      link: "/donation-gallery",
      color: "border-green-100 hover:border-green-500"
    },
    {
      title: "Home Gallery",
      description: "Manage photos for the home page, banners, and features.",
      icon: <FaHome className="text-4xl text-blue-500" />,
      link: "/home-gallery",
      color: "border-blue-100 hover:border-blue-500"
    },
    {
      title: "About Gallery",
      description: "Manage photos for the about section, history, and team.",
      icon: <FaInfoCircle className="text-4xl text-purple-500" />,
      link: "/about-gallery",
      color: "border-purple-100 hover:border-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">
            <FaImage className="text-orange-500" />
            Gallery Management
          </h1>
          <p className="mt-4 text-gray-600 text-lg">
            Choose a gallery subsection to manage its content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {galleries.map((gallery, index) => (
            <Link
              key={index}
              to={gallery.link}
              className={`bg-white p-8 rounded-2xl shadow-sm border-2 ${gallery.color} transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl flex flex-col items-center text-center`}
            >
              <div className="mb-6 p-4 bg-gray-50 rounded-full">
                {gallery.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">{gallery.title}</h2>
              <p className="text-gray-500">{gallery.description}</p>
              <div className="mt-8 px-6 py-2 bg-gray-800 text-white rounded-lg font-medium">
                Manage Section
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalleryDashboard;

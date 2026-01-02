import React from "react";
import { useUser } from "../hooks/Hooks";
import { Link } from "react-router-dom";
import { FaImage } from "react-icons/fa";

export const Home = () => {
  const { user } = useUser();

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="w-full max-w-5xl space-y-12 text-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-800">
            Hare Krishna Vidhya
          </h1>
          <p className="max-w-2xl mx-auto mt-4 text-xl text-gray-600">
            The all-in-one content management solution to manage blogs, leads,
            careers, testimonials, and everything your business needs.
          </p>
          <p className="mt-2 text-lg text-gray-500">
            Welcome {user ? user.username : "Buddy"}!
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          <Link to="/blog-management">
            <FeatureCard title="Blog Management" icon="📝" />
          </Link>
          <Link to="/leads-management">
            <FeatureCard title="Lead Forms" icon="📩" />
          </Link>
          <Link to="/form-management">
            <FeatureCard title="Form Builder" icon="🧩" />
          </Link>
          <Link to="/testimonialmanagement">
            <FeatureCard title="Testimonials" icon="⭐" />
          </Link>
          <FeatureCard title="Careers Module" icon="💼" />
          <FeatureCard title="Admin Panel" icon="⚙️" />
          <Link to="/banner">
            <FeatureCard title="Banner Uploading" icon="🖼️" />
          </Link>
             <Link to="/donation-amount">
            <FeatureCard title="Banner Uploading" icon="🖼️" />
          </Link>
        </div>

        <p className="mt-10 text-sm text-black font-bold">
          Made with ❤️ by Digitalize The Globe
        </p>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, icon }) => (
  <div className="p-6 transition duration-300 bg-white shadow-md rounded-2xl hover:shadow-xl">
    <div className="mb-4 text-4xl">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
  </div>
);

export default Home;

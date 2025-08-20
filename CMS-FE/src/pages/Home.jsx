import React from "react";
import { useUser } from "../hooks/Hooks";
import { Link } from "react-router-dom";

export const Home = () => {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-5xl w-full space-y-12 text-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
            Accountant Tech Labs
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            The all-in-one content management solution to manage blogs, leads, careers, testimonials,
            and everything your business needs.
          </p>
          <p className="mt-2 text-lg text-gray-500">
            Welcome {user ? user.username : "Buddy"}!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
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
        </div>

        <p className="text-sm text-gray-400 mt-10">
          Made with ❤️ by Digitalize The Globe
        </p>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, icon }) => (
  <div className="bg-white shadow-md rounded-2xl p-6 hover:shadow-xl transition duration-300">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
  </div>
);

export default Home;

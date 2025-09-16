import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
   const handleSignUpClick = () => {
    navigate("/signUp");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      
      // Login api is apply
      const res = await axios.post(
        "https://api.harekrishnavidya.org/api/users/login",
        formData
      );
      console.log("Login successful!", res.data);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard"); // ✅ redirect on successful login
    } catch (error) {
      alert(error.response?.data?.message || "An error occurred");
    }
  };

   return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-300 to-purple-200">
      <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl">
        <div className="flex flex-col mb-6 text-center">
          <img src="/logo.png" alt="Logo" className="h-20 mx-auto mb-4 w-50" />
          <h1 className="text-2xl font-bold text-gray-700">Welcome Back!</h1>
          <p className="text-sm text-gray-500">Login to your account</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 text-white transition bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <button
            type="button"
            className="text-blue-500 hover:underline"
            onClick={handleSignUpClick}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;




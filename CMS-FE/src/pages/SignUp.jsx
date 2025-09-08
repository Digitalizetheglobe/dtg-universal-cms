// src/pages/SignUp.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'admin' // Default role is admin
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('https://dtg-universal-cms.onrender.com/api/users/register', formData);
      console.log('Signup successful:', res.data);
      alert('Signup successful! Please login.');
      navigate('/login'); // ✅ redirect to login after signup
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-300 to-purple-200">
      <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl">
         <div className='p-0'>
          <div className="flex flex-col items-center justify-center gap-2 mb-6">
          <img src="/logo.png" alt="Logo" className="h-20 mb-4 w-50" />
          <div className='flex flex-col'>
          <h1 className="text-2xl font-bold text-gray-700">Create an Account</h1>
          <p className="text-sm text-gray-500">Sign up to get started</p>
          </div>
        </div>
         </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">Name</label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-white transition bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <span
            className="text-blue-500 cursor-pointer hover:underline"
            onClick={() => navigate('/login')}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;

import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://api.ddabattalion.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        window.alert('Login successful!');
        window.location.href = '/profile'; // or use navigate('/profile') if using react-router
      } else {
        window.alert(result.error || 'Login failed');
      }
    } catch (err) {
      window.alert('Something went wrong!');
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <input
          type="email"
          placeholder="Email"
          className="border rounded-lg p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border rounded-lg p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold"
        >
          Login
        </button>
        <span className=''> Don't have account ? <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
        register now 
        </Link></span>
      </form>
    </AuthLayout>
  );
};

export default Login;

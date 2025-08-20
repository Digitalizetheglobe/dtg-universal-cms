import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      //http://localhost:5000 
      const res = await fetch('https://api.ddabattalion.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          roleId: Number(roleId),
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        window.alert('Registration successful!');
        navigate('/login');
      } else {
        window.alert(result.error || 'Registration failed');
      }
    } catch (err) {
      window.alert('Something went wrong!');
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
      <form onSubmit={handleRegister} className="grid gap-4">
        <input
          type="text"
          placeholder="Name"
          className="border rounded-lg p-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
       <select
          className="border rounded-lg p-3"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          required
        >
          <option value="" disabled>
            Select Role
          </option>
          <option value="1">Admin</option>
          <option value="2">Staff</option>
          <option value="3">Parent</option>
          <option value="4">Cadet</option>
        </select>
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-semibold"
        >
          Register
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;

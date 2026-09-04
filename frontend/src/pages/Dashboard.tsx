import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const Dashboard: React.FC = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [adminMessage, setAdminMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchAdminData = async () => {
    try {
      setError('');
      const res = await axios.get('http://localhost:3000/api/auth/admin');
      setAdminMessage(res.data.message);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Forbidden');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Healthcare Dashboard</h1>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Logout
          </button>
        </div>
        
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Welcome, {user.username}</h2>
          <p className="text-blue-600">Your current role: <span className="font-bold">{user.role}</span></p>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-bold mb-4">Role-Based Access Test</h3>
          <p className="mb-4 text-gray-600">Click below to test if your role has administrative privileges.</p>
          <button onClick={fetchAdminData} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">
            Access Admin Area
          </button>
          
          {adminMessage && <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">{adminMessage}</div>}
          {error && <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>}
        </div>
      </div>
    </div>
  );
};

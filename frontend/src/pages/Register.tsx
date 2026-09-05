import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 12) score += 1;
    if (/[a-z]/.test(pw)) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/\d/.test(pw)) score += 1;
    if (/[@$!%*?&#^_-]/.test(pw)) score += 1;
    return score; // 0 to 5
  };

  const strength = getStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (strength < 5) {
      setError('Password does not meet minimum strength requirements');
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/auth/register', { username, password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Arogya Connect</h1>
          <p className="text-xs text-slate-500 font-medium mb-4 tracking-wide">Connecting Every Community to Care.</p>
          <h2 className="text-xl font-bold text-slate-800">Create Account</h2>
        </div>
        {error && <div className="mb-4 text-red-600 text-sm font-semibold">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded" 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full p-2 border rounded" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required
            />
            <div className="mt-2 text-xs text-slate-500">
              <ul className="grid grid-cols-2 gap-1">
                <li className={password.length >= 12 ? 'text-green-600' : ''}>✓ Min 12 chars</li>
                <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>✓ Uppercase</li>
                <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>✓ Lowercase</li>
                <li className={/\d/.test(password) ? 'text-green-600' : ''}>✓ Number</li>
                <li className={/[@$!%*?&#^_-]/.test(password) ? 'text-green-600' : ''}>✓ Special char</li>
              </ul>
            </div>
            {password && (
              <div className="mt-2 h-1 w-full bg-slate-200 rounded">
                <div 
                  className={`h-full rounded ${strength < 3 ? 'bg-red-500' : strength < 5 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                  style={{ width: `${(strength / 5) * 100}%` }}
                ></div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
            <input 
              type="password" 
              className="w-full p-2 border rounded" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-cyan-600 text-white p-2 rounded hover:bg-cyan-700 font-medium">
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="text-cyan-600 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

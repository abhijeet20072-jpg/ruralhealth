import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Patients: React.FC = () => {
   
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const fetchPatients = async (searchQuery = '') => {
    try {
      setError('');
      const res = await api.get(`/patients/search?query=${searchQuery}`);
      setPatients(res.data.patients);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unauthorized to view patients');
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients(query);
  };

  if (error) return <div className="p-8 text-red-600 font-bold">{error}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{user?.role === 'ROLE_CITIZEN' ? 'My Profile' : 'Patient Directory'}</h1>
          <p className="text-slate-500 mt-2">Search and manage patient medical records securely.</p>
        </div>
        {user?.role !== 'ROLE_CITIZEN' && (
          <Link to="/patients/new" className="px-4 py-2 bg-cyan-600 text-white rounded-md font-semibold hover:bg-cyan-700 transition-colors shadow-sm">
            + Register Patient
          </Link>
        )}
      </div>

      <form onSubmit={handleSearch} className="mb-8 flex gap-4">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Name, Health ID, or Phone..."
          className="flex-1 p-3 border rounded shadow-sm"
        />
        <button type="submit" className="px-6 py-3 bg-slate-800 text-white rounded hover:bg-slate-900">
          Search
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Health ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">DOB / Gender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {patients.map(p => (
              <tr key={p.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{p.abhaId || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{p.firstName} {p.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.dateOfBirth} ({p.gender.charAt(0)})</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.phoneNumber || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/patients/${p.id}`} className="text-cyan-600 hover:text-cyan-900">View Profile</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {patients.length === 0 && <div className="p-12 text-center flex flex-col items-center justify-center">
          <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No patients found</h3>
          <p className="text-slate-500">Try adjusting your search criteria.</p>
        </div>}
      </div>
    </div>
  );
};

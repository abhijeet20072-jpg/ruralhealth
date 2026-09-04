import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

export const Patients: React.FC = () => {
   
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Patient Directory</h1>
        <Link to="/patients/new" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          + Register Patient
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-8 flex gap-4">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Name, ABHA ID, or Phone..."
          className="flex-1 p-3 border rounded shadow-sm"
        />
        <button type="submit" className="px-6 py-3 bg-gray-800 text-white rounded hover:bg-gray-900">
          Search
        </button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ABHA ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DOB / Gender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patients.map(p => (
              <tr key={p.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.abhaId || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.firstName} {p.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.dateOfBirth} ({p.gender.charAt(0)})</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.phoneNumber || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/patients/${p.id}`} className="text-blue-600 hover:text-blue-900">View Profile</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {patients.length === 0 && <div className="p-6 text-center text-gray-500">No patients found.</div>}
      </div>
    </div>
  );
};

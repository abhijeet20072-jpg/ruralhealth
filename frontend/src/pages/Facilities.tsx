import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Facilities: React.FC = () => {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const isAdmin = user?.role === 'ROLE_FACILITY_ADMIN' || user?.role === 'ROLE_DISTRICT_ADMIN';

  const fetchFacilities = async (searchQuery = '') => {
    try {
      // Simulating GPS location for discovery (Normally from navigator.geolocation)
      const res = await api.get(`/facilities/search?query=${searchQuery}&lat=28.70&lng=77.10&radius=100`);
      setFacilities(res.data.facilities);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFacilities(query);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Healthcare Facilities</h1>
        {isAdmin && (
          <Link to="/facilities/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            + Register Facility
          </Link>
        )}
      </div>

      <form onSubmit={handleSearch} className="mb-8 flex gap-4">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, type, or service..."
          className="flex-1 p-3 border rounded shadow-sm"
        />
        <button type="submit" className="px-6 py-3 bg-gray-800 text-white rounded hover:bg-gray-900">
          Search Nearby
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map(f => (
          <div key={f.id} className="bg-white p-6 rounded-lg shadow border border-gray-100 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold text-blue-900">{f.name}</h3>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded font-bold">{f.type.replace('_', ' ')}</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">{f.address || 'Address not provided'}</p>
            
            <div className="flex gap-2 mb-4">
              {f.emergencyAvailability && <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded font-bold">Emergency 24/7</span>}
              {f.medicineStatus === 'AVAILABLE' && <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-bold">Medicines In Stock</span>}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm text-gray-400">{f.distance ? `${f.distance.toFixed(1)} km away` : ''}</span>
              <Link to={`/facilities/${f.id}`} className="text-blue-600 hover:underline font-medium">View Details &rarr;</Link>
            </div>
          </div>
        ))}
        {facilities.length === 0 && <p className="text-gray-500">No facilities found matching your criteria.</p>}
      </div>
    </div>
  );
};

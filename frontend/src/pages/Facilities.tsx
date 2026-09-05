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
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{user?.role === 'ROLE_DISTRICT_ADMIN' ? 'District Facilities' : 'Healthcare Facilities'}</h1>
          <p className="text-slate-500 mt-2">{user?.role === 'ROLE_DISTRICT_ADMIN' ? 'District-level facility directory and oversight.' : 'Discover care and find nearby hospitals, clinics, and health centers.'}</p>
        </div>
        {isAdmin && (
          <Link to="/facilities/new" className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md font-semibold transition-colors shadow-sm">
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
          className="flex-1 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow"
        />
        <button type="submit" className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold transition-colors shadow-sm">
          {user?.role === 'ROLE_DISTRICT_ADMIN' ? 'Search Directory' : 'Search Nearby'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map(f => (
          <div key={f.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col relative">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">{f.name}</h3>
              <span className="text-[10px] px-2 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full font-bold uppercase tracking-wider">{f.type.replace('_', ' ')}</span>
            </div>
            <p className="text-sm text-slate-500 mb-4">{f.address || 'Address not provided'}</p>
            
            <div className="flex gap-2 mb-4">
              {f.emergencyAvailability && <span className="text-xs px-2 py-1 bg-rose-100 text-rose-800 border border-rose-200 rounded-full font-bold">Emergency 24/7</span>}
              {f.medicineStatus === 'AVAILABLE' && <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full font-bold">Medicines In Stock</span>}
            </div>

            <div className="mt-auto pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-sm text-slate-400">{f.distance ? `${f.distance.toFixed(1)} km away` : ''}</span>
              <Link to={`/facilities/${f.id}`} className="text-cyan-600 hover:text-cyan-700 font-semibold transition-colors">View Details &rarr;</Link>
            </div>
          </div>
        ))}
        {facilities.length === 0 && (
          <div className="col-span-full p-12 text-center flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200">
            <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No facilities found</h3>
            <p className="text-slate-500">There are no facilities matching your current search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

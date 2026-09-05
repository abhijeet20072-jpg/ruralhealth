import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const FacilityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [facility, setFacility] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/facilities/${id}`)
      .then(res => setFacility(res.data.facility))
      .catch(err => setError(err.response?.data?.error || 'Failed to load facility'));
  }, [id]);

  if (error) return <div className="p-8 text-red-600 text-center">{error}</div>;
  if (!facility) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500">
        <Link to="/facilities" className="hover:text-cyan-600 transition-colors">Directory</Link>
        <span>/</span>
        <span className="text-slate-900">Facility Details</span>
      </div>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{facility.name}</h1>
            <p className="text-slate-600 text-lg">{facility.address}</p>
          </div>
          <span className="px-4 py-1.5 bg-cyan-100 text-cyan-800 rounded-full font-semibold text-sm tracking-wide shadow-sm">
            {facility.type.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-4">Availability & Status</h2>
            <ul className="space-y-3">
              <li className="flex justify-between p-3 bg-slate-50/50 rounded-md border border-slate-100">
                <span className="font-medium text-slate-700">Operating Hours:</span>
                <span>{facility.operatingHours || 'Not specified'}</span>
              </li>
              <li className="flex justify-between p-3 bg-slate-50/50 rounded-md border border-slate-100">
                <span className="font-medium text-slate-700">Emergency:</span>
                <span className={facility.emergencyAvailability ? 'text-emerald-700 font-bold flex items-center gap-1' : 'text-rose-600 font-bold'}>
                  {facility.emergencyAvailability ? 'Available' : 'No'}
                </span>
              </li>
              <li className="flex justify-between p-3 bg-slate-50/50 rounded-md border border-slate-100">
                <span className="font-medium text-slate-700">Diagnostics:</span>
                <span className={facility.diagnosticsAvailable ? 'text-emerald-700 font-bold flex items-center gap-1' : 'text-slate-600'}>
                  {facility.diagnosticsAvailable ? 'Available' : 'No'}
                </span>
              </li>
              <li className="flex justify-between p-3 bg-slate-50/50 rounded-md border border-slate-100">
                <span className="font-medium text-slate-700">Medicines:</span>
                <span className="font-bold">{facility.medicineStatus.replace('_', ' ')}</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-4">Services Offered</h2>
            {facility.services.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {facility.services.map((s: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-cyan-50/50 text-cyan-800 rounded-md border border-cyan-200 font-medium text-sm">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">No specific services listed.</p>
            )}

            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-8 mb-4">Staff Directory</h2>
            {facility.staff && facility.staff.length > 0 ? (
              <ul className="space-y-2">
                {facility.staff.map((staff: any) => (
                  <li key={staff.id} className="p-3 border border-slate-200 rounded-md flex items-center justify-between hover:border-slate-300 hover:shadow-sm transition-all bg-white">
                    <div>
                      <div className="font-semibold">{staff.username}</div>
                      <div className="text-sm text-slate-500">{staff.role.replace('ROLE_', '')}</div>
                    </div>
                    {user?.role === 'ROLE_CITIZEN' && (staff.role === 'ROLE_DOCTOR_MO' || staff.role === 'ROLE_SPECIALIST') && (
                      <Link 
                        to={`/appointments?facilityId=${facility.id}&doctorId=${staff.id}`} 
                        className="px-4 py-1.5 bg-cyan-600 text-white text-sm rounded-md font-semibold shadow-sm hover:bg-cyan-700 transition-colors"
                      >
                        Book
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500">No staff currently assigned.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

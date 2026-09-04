import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useParams, Link } from 'react-router-dom';

export const FacilityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
      <Link to="/facilities" className="text-blue-600 hover:underline mb-6 inline-block">&larr; Back to Search</Link>
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-start border-b pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{facility.name}</h1>
            <p className="text-gray-600 text-lg">{facility.address}</p>
          </div>
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-bold">
            {facility.type.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Availability & Status</h2>
            <ul className="space-y-3">
              <li className="flex justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">Operating Hours:</span>
                <span>{facility.operatingHours || 'Not specified'}</span>
              </li>
              <li className="flex justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">Emergency:</span>
                <span className={facility.emergencyAvailability ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                  {facility.emergencyAvailability ? 'Available' : 'No'}
                </span>
              </li>
              <li className="flex justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">Diagnostics:</span>
                <span className={facility.diagnosticsAvailable ? 'text-green-600 font-bold' : 'text-gray-600'}>
                  {facility.diagnosticsAvailable ? 'Available' : 'No'}
                </span>
              </li>
              <li className="flex justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">Medicines:</span>
                <span className="font-bold">{facility.medicineStatus.replace('_', ' ')}</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-4">Services Offered</h2>
            {facility.services.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {facility.services.map((s: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No specific services listed.</p>
            )}

            <h2 className="text-xl font-bold mt-8 mb-4">Staff & Doctors</h2>
            {facility.staff && facility.staff.length > 0 ? (
              <ul className="space-y-2">
                {facility.staff.map((staff: any) => (
                  <li key={staff.id} className="p-3 border rounded flex justify-between">
                    <span className="font-semibold">{staff.username}</span>
                    <span className="text-sm text-gray-500">{staff.role.replace('ROLE_', '')}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No staff currently assigned.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

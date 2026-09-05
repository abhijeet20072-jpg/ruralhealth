import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<any>(null);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const isCitizen = user?.role === 'ROLE_CITIZEN';

  useEffect(() => {
    api.get(`/patients/${id}`)
      .then(res => setPatient(res.data.patient))
      .catch(err => setError(err.response?.data?.error || 'Failed to load patient'));
  }, [id]);

  if (error) return <div className="p-8 text-red-600 text-center font-bold">{error}</div>;
  if (!patient) return <div className="p-8 text-center">Loading secure profile...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{isCitizen ? 'Health Information' : 'Patient Profile'}</h1>
        <p className="text-slate-500 mt-2">{isCitizen ? 'Your personal health record and demographics.' : 'View patient demographics and baseline medical info.'}</p>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <Link to={isCitizen ? "/dashboard" : "/patients"} className="text-slate-500 hover:text-slate-800 hover:underline font-medium">&larr; Back to Directory</Link>
        <div className="flex flex-wrap gap-2">
          <Link to={`/patients/${id}/edit`} className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-md font-medium hover:bg-slate-200 transition-colors">
              Edit Profile
          </Link>
          <Link to={`/patients/${id}/records`} className="px-4 py-2 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-md font-medium hover:bg-cyan-100 transition-colors">
            {isCitizen ? 'My Medical Records' : 'View EHR Timeline'}
          </Link>
          {!isCitizen && (
            <Link to={`/patients/${id}/triage`} className="px-4 py-2 bg-red-600 text-white rounded-md font-bold shadow-sm hover:bg-red-700 transition-colors">
              Run Triage
            </Link>
          )}
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-cyan-500">
        <div className="flex justify-between items-start border-b pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{patient.firstName} {patient.lastName}</h1>
            <p className="text-slate-600 font-mono">Gov Health ID: {patient.abhaId || 'Not Linked'}</p>
          </div>
          <div className="text-right">
            <span className="block text-sm text-slate-500">Internal ID</span>
            <span className="text-xs text-slate-400 font-mono">{patient.id}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4 text-slate-800 border-b pb-2">Demographics & Contact</h2>
            <ul className="space-y-3">
              <li className="flex justify-between text-sm"><span className="text-slate-500">DOB:</span> <span className="font-medium">{patient.dateOfBirth}</span></li>
              <li className="flex justify-between text-sm"><span className="text-slate-500">Gender:</span> <span className="font-medium">{patient.gender}</span></li>
              <li className="flex justify-between text-sm"><span className="text-slate-500">Phone:</span> <span className="font-medium">{patient.phoneNumber || 'N/A'}</span></li>
              <li className="flex justify-between text-sm"><span className="text-slate-500">Address:</span> <span className="font-medium">{patient.address || 'N/A'}</span></li>
              <li className="mt-4 pt-4 border-t text-sm">
                <span className="block text-slate-500 mb-1">Emergency Contact:</span>
                <span className="font-medium text-red-600">{patient.emergencyContactName} ({patient.emergencyContactPhone})</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-4 text-slate-800 border-b pb-2">Base Medical Info</h2>
            <ul className="space-y-3 mb-6">
              <li className="flex justify-between text-sm">
                <span className="text-slate-500">Blood Group:</span> 
                <span className="font-bold text-red-600">{patient.bloodGroup || 'Unknown'}</span>
              </li>
            </ul>

            <h3 className="font-bold text-slate-700 mb-2">Known Allergies</h3>
            {patient.allergies && patient.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((a: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 rounded border border-red-200 text-xs font-bold">
                    {a}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-green-600">No known allergies.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

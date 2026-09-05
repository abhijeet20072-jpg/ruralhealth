import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const MyReferrals: React.FC = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.patientId) {
      setLoading(false);
      return;
    }
    
    api.get(`/referrals/patient/${user.patientId}`)
      .then(res => setReferrals(res.data.referrals))
      .catch(err => setError(err.response?.data?.error || 'Failed to fetch referrals'))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">My Referrals</h1>
      
      {!user?.patientId ? (
        <div className="bg-yellow-50 p-6 rounded border border-yellow-200 mb-8">
          <p className="text-yellow-800 font-bold mb-4">You have not registered your Patient Profile yet.</p>
          <Link to="/patients/new" className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">Complete Patient Profile</Link>
        </div>
      ) : loading ? (
        <p>Loading your referrals...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : referrals.length === 0 ? (
        <div className="p-6 bg-white rounded shadow text-center">
          <p className="text-slate-500">You do not have any active or past referrals.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {referrals.map(ref => (
            <div key={ref.id} className="p-6 bg-white rounded shadow-sm border-l-4 border-cyan-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Referred to: {ref.receivingName}</h3>
                  <p className="text-slate-600 text-sm">From: {ref.referringName}</p>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-bold ${ref.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {ref.status}
                </span>
              </div>
              <p className="text-slate-800"><span className="font-semibold text-sm text-slate-500">Reason:</span> {ref.reason}</p>
              <div className="mt-4 text-xs text-slate-400">
                Created on: {new Date(ref.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

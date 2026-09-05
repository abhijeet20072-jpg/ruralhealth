import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const CareManagementDashboard: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPlans = async () => {
    try {
      const res = await api.get('/care-plans/facility');
      setPlans(res.data.carePlans);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleStatusChange = async (id: string, status: string, riskLevel?: string) => {
    try {
      const payload: any = { status };
      if (riskLevel) payload.riskLevel = riskLevel;
      await api.put(`/care-plans/${id}`, payload);
      fetchPlans();
    } catch (e) {
      alert('Failed to update care plan.');
    }
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'CRITICAL': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'HIGH': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MEDIUM': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  if (loading) return <div className="p-6">Loading Care Plans...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center">
          <svg className="w-8 h-8 text-cyan-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          Care Management
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-xl shadow text-center text-slate-500">
            No active care plans.
          </div>
        ) : (
          plans.map(p => (
            <div key={p.id} className={`bg-white p-6 rounded-xl shadow-sm border-t-4 ${getRiskColor(p.riskLevel).split(' ')[2]}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-slate-900 cursor-pointer hover:text-cyan-600" onClick={() => navigate(`/patients/${p.patientId}`)}>
                  {p.firstName} {p.lastName}
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-bold ${getRiskColor(p.riskLevel)}`}>
                  {p.riskLevel}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-700 mb-2">{p.condition}</p>
              
              <div className="text-xs text-slate-500 mb-4 space-y-1">
                <p>Status: <span className="font-bold text-slate-700">{p.status}</span></p>
                <p>Clinician: {p.clinicianName || 'Unassigned'}</p>
                <p>Enrolled: {new Date(p.createdAt).toLocaleDateString()}</p>
              </div>

              {p.goals && (
                <div className="bg-slate-50 p-3 rounded text-sm text-slate-700 mb-4 italic">
                  "{p.goals}"
                </div>
              )}

              {p.status !== 'DISCHARGED' && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                  <select 
                    className="border text-sm p-1 rounded text-slate-700" 
                    value={p.riskLevel} 
                    onChange={e => handleStatusChange(p.id, p.status, e.target.value)}
                  >
                    <option value="LOW">Low Risk</option>
                    <option value="MEDIUM">Medium Risk</option>
                    <option value="HIGH">High Risk</option>
                    <option value="CRITICAL">Critical Risk</option>
                  </select>

                  {p.status === 'ACTIVE' && (
                    <button onClick={() => handleStatusChange(p.id, 'ESCALATED')} className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1 rounded font-bold text-xs transition">Escalate</button>
                  )}
                  {p.status === 'ESCALATED' && (
                    <button onClick={() => handleStatusChange(p.id, 'ACTIVE')} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-1.5 rounded-md font-semibold text-xs transition-colors shadow-sm">De-escalate</button>
                  )}
                  
                  <button onClick={() => {
                    if (window.confirm('Discharge this patient from the care plan?')) {
                      handleStatusChange(p.id, 'DISCHARGED');
                    }
                  }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded font-bold text-xs transition">Discharge</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

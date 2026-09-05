import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const EmergencyDashboard: React.FC = () => {
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchEmergencies = async () => {
    try {
      const res = await api.get('/emergencies/facility');
      setEmergencies(res.data.emergencies);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
    const interval = setInterval(fetchEmergencies, 30000); // 30 sec poll for emergencies
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/emergencies/${id}/status`, { status });
      fetchEmergencies();
    } catch (e) {
      alert('Failed to update emergency status. Make sure you have the correct authorization.');
    }
  };

  if (loading) return <div className="p-6">Loading emergencies...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center">
          <svg className="w-8 h-8 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          Emergency Escalations
        </h1>
      </div>

      <div className="grid gap-6">
        {emergencies.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center text-slate-500">
            No active emergencies at this facility.
          </div>
        ) : (
          emergencies.map(em => (
            <div key={em.id} className={`bg-white p-6 rounded-xl shadow-md border-l-8 ${
              ['DETECTED', 'ACKNOWLEDGED', 'ESCALATED', 'TRANSFER_REQUESTED', 'TRANSFER_ACCEPTED', 'IN_TRANSIT'].includes(em.status) 
              ? 'border-rose-600' : 'border-emerald-500'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 cursor-pointer hover:text-cyan-600" onClick={() => navigate(`/patients/${em.patientId}`)}>
                    {em.firstName} {em.lastName}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">ID: {em.id}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    ['RESOLVED', 'CANCELLED'].includes(em.status) ? 'bg-slate-100 text-slate-600' : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}>
                    {em.status}
                  </span>
                  <p className="text-xs text-slate-400 mt-2">Started: {new Date(em.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {em.notes && (
                <div className="bg-rose-50 text-rose-900 p-3 rounded text-sm mb-4 border border-rose-200 font-medium">
                  {em.notes}
                </div>
              )}

              {em.destinationFacilityName && (
                <div className="mb-4 text-sm font-bold text-slate-700 bg-slate-50 p-2 rounded inline-block">
                  Transfer Destination: {em.destinationFacilityName}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                {em.status === 'DETECTED' && (
                  <>
                    <button onClick={() => handleStatusChange(em.id, 'ACKNOWLEDGED')} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-bold text-sm transition">Acknowledge</button>
                    <button onClick={() => handleStatusChange(em.id, 'CANCELLED')} className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded font-bold text-sm transition">Cancel/False Alarm</button>
                  </>
                )}
                {['ACKNOWLEDGED', 'ESCALATED'].includes(em.status) && (
                  <>
                    <button onClick={() => handleStatusChange(em.id, 'ESCALATED')} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-bold text-sm transition">Escalate (In-House)</button>
                    <button onClick={() => {
                       const destId = prompt('Enter Destination Facility ID to transfer:');
                       if (destId) api.put(`/emergencies/${em.id}/status`, { status: 'TRANSFER_REQUESTED', destinationFacilityId: destId }).then(() => fetchEmergencies());
                    }} className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-md font-semibold text-sm transition-colors shadow-sm">Request Transfer</button>
                    <button onClick={() => handleStatusChange(em.id, 'RESOLVED')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold text-sm transition">Mark Resolved</button>
                  </>
                )}
                {em.status === 'TRANSFER_REQUESTED' && (
                  <button onClick={() => handleStatusChange(em.id, 'TRANSFER_ACCEPTED')} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded font-bold text-sm transition">Accept Transfer (Dest Facility)</button>
                )}
                {em.status === 'TRANSFER_ACCEPTED' && (
                  <button onClick={() => handleStatusChange(em.id, 'IN_TRANSIT')} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-bold text-sm transition">Dispatch Ambulance</button>
                )}
                {em.status === 'IN_TRANSIT' && (
                  <button onClick={() => handleStatusChange(em.id, 'RECEIVED')} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded font-bold text-sm transition">Mark Received</button>
                )}
                {em.status === 'RECEIVED' && (
                  <button onClick={() => handleStatusChange(em.id, 'RESOLVED')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold text-sm transition">Resolve Emergency</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

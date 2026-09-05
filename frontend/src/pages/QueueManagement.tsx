import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const QueueManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [queue, setQueue] = useState<any[]>([]);
  const [error, setError] = useState('');
  
  const facilityId = user?.facilityId;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const fetchQueue = async () => {
    if (!facilityId) return;
    try {
      const res = await api.get(`/appointments/queue?facilityId=${facilityId}&date=${today}`);
      setQueue(res.data.queue || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load queue.');
    }
  };

  useEffect(() => {
    if (facilityId) fetchQueue();
    else setError('You are not assigned to any facility. Please contact administration.');
  }, [facilityId]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/appointments/${id}/queue-status`, { queueStatus: newStatus });
      fetchQueue();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Queue Management</h1>
          <p className="text-slate-500 mt-2">Manage today's live patient queue.</p>
        </div>
        <div className="bg-slate-100 px-4 py-2 rounded-md border border-slate-200">
          <span className="text-sm font-semibold text-slate-700">Date: {today}</span>
        </div>
      </div>
      
      {error && <div className="p-4 mb-4 bg-yellow-50 text-yellow-800 rounded">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Token</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Time Slot</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Patient Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Current Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {queue.map(apt => (
              <tr key={apt.id}>
                <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-slate-900">{apt.tokenNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{apt.timeSlot}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">{apt.firstName} {apt.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-bold 
                    ${apt.queueStatus === 'WAITING' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 
                      apt.queueStatus === 'IN_CONSULTATION' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
                    {apt.queueStatus.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {apt.queueStatus === 'WAITING' && (
                    <button onClick={() => updateStatus(apt.id, 'IN_CONSULTATION')} className="w-full md:w-auto inline-flex items-center justify-center text-cyan-700 hover:text-cyan-800 font-semibold border border-cyan-300 px-4 py-2 rounded-md bg-cyan-50 hover:bg-cyan-100 transition-colors shadow-sm">Call In</button>
                  )}
                  {apt.queueStatus === 'IN_CONSULTATION' && (
                    <button onClick={() => navigate(`/consultation/${apt.id}`)} className="w-full md:w-auto inline-flex items-center justify-center text-white font-semibold border border-transparent px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 transition-colors shadow-sm">Open Workspace &rarr;</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {queue.length === 0 && !error && <div className="p-12 text-center flex flex-col items-center justify-center">
          <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <h3 className="text-lg font-medium text-slate-900 mb-1">Queue is empty</h3>
          <p className="text-slate-500">No patients are currently waiting in the queue.</p>
        </div>}
      </div>
    </div>
  );
};

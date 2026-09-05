import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const StaffFollowUps: React.FC = () => {
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completionNotes, setCompletionNotes] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const fetchFollowUps = async () => {
    try {
      const res = await api.get('/notifications/follow-ups/facility');
      setFollowUps(res.data.followUps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const notes = completionNotes[id];
      await api.put(`/notifications/follow-ups/${id}/status`, { status, notes });
      fetchFollowUps();
    } catch (e) {
      alert('Failed to update follow-up status.');
    }
  };

  if (loading) return <div className="p-6">Loading follow-ups...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Facility Follow-Ups</h1>
        <p className="text-slate-500 mt-2">Manage ongoing patient care and outstanding follow-up tasks.</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {followUps.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" /></svg>
            <h3 className="text-lg font-medium text-slate-900 mb-1">All caught up</h3>
            <p className="text-slate-500">There are no pending follow-ups for this facility.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {followUps.map(fu => (
                <tr key={fu.id} className={fu.status === 'OVERDUE' ? 'bg-rose-50/50' : fu.status === 'DUE' ? 'bg-amber-50/30' : ''}>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 cursor-pointer hover:text-cyan-600 hover:underline" onClick={() => navigate(`/patients/${fu.patientId}`)}>
                      {fu.firstName} {fu.lastName}
                    </div>
                    <div className="text-xs text-slate-500">By {fu.createdByName}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-800">{fu.reason}</td>
                  <td className="px-6 py-4 text-sm text-slate-800">
                    {new Date(fu.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full \${
                      fu.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                      fu.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {fu.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full \${
                      fu.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      fu.status === 'DUE' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      fu.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      fu.status === 'CANCELLED' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                      'bg-cyan-100 text-cyan-800 border border-cyan-200'
                    }`}>
                      {fu.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex flex-col gap-2">
                    {['PENDING', 'DUE', 'OVERDUE'].includes(fu.status) && (
                      <>
                        <input
                          type="text"
                          placeholder="Completion notes (optional)"
                          className="border border-slate-300 rounded px-2 py-1 text-xs"
                          value={completionNotes[fu.id] || ''}
                          onChange={(e) => setCompletionNotes({ ...completionNotes, [fu.id]: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateStatus(fu.id, 'COMPLETED')} className="flex-1 bg-emerald-600 text-white text-xs px-2 py-1.5 rounded-md font-semibold hover:bg-emerald-700 transition-colors shadow-sm">
                            Complete
                          </button>
                          <button onClick={() => handleUpdateStatus(fu.id, 'CANCELLED')} className="flex-1 bg-white text-slate-700 border border-slate-300 text-xs px-2 py-1.5 rounded-md font-semibold hover:bg-slate-50 transition-colors">
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

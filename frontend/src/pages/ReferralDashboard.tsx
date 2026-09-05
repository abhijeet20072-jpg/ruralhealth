import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ReferralDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'INCOMING' | 'OUTGOING'>('INCOMING');
  const [referrals, setReferrals] = useState<any[]>([]);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const facilityId = user?.facilityId;
  const isDistrictAdmin = user?.role === 'ROLE_DISTRICT_ADMIN';

  const fetchDashboard = async () => {
    try {
      if (isDistrictAdmin) {
        const res = await api.get('/referrals/overdue');
        setReferrals(res.data.overdue || []);
      } else if (facilityId) {
        const res = await api.get(`/referrals/dashboard?facilityId=${facilityId}&type=${activeTab}`);
        setReferrals(res.data.referrals || []);
      } else {
        setError('You must be assigned to a facility to view referrals.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard.');
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [activeTab, isDistrictAdmin, facilityId]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const payload: any = { status: newStatus };
      if (newStatus === 'COMPLETED') {
        payload.followUpNotes = prompt('Enter required follow-up notes for completion:');
        if (!payload.followUpNotes) return; // Cancelled
      }
      await api.put(`/referrals/${id}/status`, payload);
      fetchDashboard();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Update failed');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {isDistrictAdmin ? 'District Overdue Referrals' : 'Referrals'}
        </h1>
        <p className="text-slate-500 mt-2">{isDistrictAdmin ? 'Escalated cases requiring intervention.' : 'Manage incoming and outgoing patient transfers.'}</p>
      </div>

      {error && <div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-md font-medium mb-6 shadow-sm">{error}</div>}

      {!isDistrictAdmin && (
        <div className="flex space-x-4 mb-6 border-b">
          <button 
            className={`pb-2 px-4 font-bold ${activeTab === 'INCOMING' ? 'text-cyan-600 border-b-2 border-cyan-600' : 'text-slate-500'}`}
            onClick={() => setActiveTab('INCOMING')}>
            Incoming (To our facility)
          </button>
          <button 
            className={`pb-2 px-4 font-bold ${activeTab === 'OUTGOING' ? 'text-cyan-600 border-b-2 border-cyan-600' : 'text-slate-500'}`}
            onClick={() => setActiveTab('OUTGOING')}>
            Outgoing (From our facility)
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Patient ID / Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{activeTab === 'INCOMING' && !isDistrictAdmin ? 'From' : 'To Facility'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {referrals.map(r => (
              <tr key={r.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="font-mono text-slate-500">{r.patientId.split('-')[0]}...</span>
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${
                    r.priority === 'EMERGENCY' ? 'bg-red-100 text-red-800' : 
                    r.priority === 'URGENT' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                  }`}>{r.priority}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {isDistrictAdmin ? r.receivingFacilityId : (activeTab === 'INCOMING' ? r.referringName : r.receivingName)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{r.reason}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{r.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  {activeTab === 'INCOMING' && !isDistrictAdmin && ['CREATED', 'SCHEDULED'].includes(r.status) && (
                    <>
                      <button onClick={() => updateStatus(r.id, 'ACCEPTED')} className="text-green-600 hover:text-green-900 mr-3">Accept</button>
                      <button onClick={() => updateStatus(r.id, 'REJECTED')} className="text-red-600 hover:text-red-900">Reject</button>
                    </>
                  )}
                  {activeTab === 'INCOMING' && !isDistrictAdmin && r.status === 'ACCEPTED' && (
                    <button onClick={() => updateStatus(r.id, 'COMPLETED')} className="text-cyan-600 hover:text-cyan-900">Mark Completed</button>
                  )}
                  {activeTab === 'OUTGOING' && !isDistrictAdmin && r.status === 'CREATED' && (
                    <button onClick={() => updateStatus(r.id, 'CANCELLED')} className="text-red-600 hover:text-red-900">Cancel</button>
                  )}
                  {isDistrictAdmin && (
                    <span className="text-slate-400">Escalated</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {referrals.length === 0 && <div className="p-12 text-center flex flex-col items-center justify-center">
          <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          <h3 className="text-lg font-medium text-slate-900 mb-1">{isDistrictAdmin ? 'No Escalations' : 'No active referrals'}</h3>
          <p className="text-slate-500">{isDistrictAdmin ? 'There are currently no overdue referrals requiring district intervention.' : 'There are no referrals matching this criteria.'}</p>
        </div>}
      </div>
    </div>
  );
};

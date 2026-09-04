import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ReferralDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'INCOMING' | 'OUTGOING'>('INCOMING');
  const [referrals, setReferrals] = useState<any[]>([]);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const facilityId = user?.facilityId;

  const fetchDashboard = async () => {
    try {
      const res = await api.get(`/referrals/dashboard?facilityId=${facilityId}&type=${activeTab}`);
      setReferrals(res.data.referrals);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard. Make sure facilityId is bound.');
    }
  };

  useEffect(() => {
    if (facilityId) fetchDashboard(); else setError('You must be assigned to a facility to view referrals.');
  }, [activeTab]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const payload: any = { status: newStatus };
      if (newStatus === 'COMPLETED') {
        payload.followUpNotes = prompt('Enter required follow-up notes for completion:');
        if (!payload.followUpNotes) return; // Cancelled
      }
      await api.put(`/referrals/${id}/status`, payload);
      if (facilityId) fetchDashboard(); else setError('You must be assigned to a facility to view referrals.');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Referral Management Dashboard</h1>

      {error && <div className="p-4 mb-4 bg-red-50 text-red-700 rounded border border-red-200">{error}</div>}

      <div className="flex space-x-4 mb-6 border-b">
        <button 
          onClick={() => setActiveTab('INCOMING')}
          className={`py-2 px-4 font-bold border-b-2 ${activeTab === 'INCOMING' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}>
          Incoming Referrals (To Us)
        </button>
        <button 
          onClick={() => setActiveTab('OUTGOING')}
          className={`py-2 px-4 font-bold border-b-2 ${activeTab === 'OUTGOING' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}>
          Outgoing Referrals (From Us)
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{activeTab === 'INCOMING' ? 'From Facility' : 'To Facility'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {referrals.map(ref => {
              const isOverdue = new Date(ref.dueDate) < new Date() && !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(ref.status);
              return (
                <tr key={ref.id} className={isOverdue ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{ref.firstName} {ref.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{activeTab === 'INCOMING' ? ref.referringName : ref.receivingName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${ref.priority === 'EMERGENCY' ? 'bg-red-200 text-red-900' : ref.priority === 'URGENT' ? 'bg-orange-200 text-orange-900' : 'bg-blue-100 text-blue-800'}`}>
                      {ref.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{ref.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(ref.dueDate).toLocaleDateString()}
                    {isOverdue && <span className="ml-2 text-red-600 font-bold">OVERDUE</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {activeTab === 'INCOMING' && ref.status === 'CREATED' && (
                      <>
                        <button onClick={() => updateStatus(ref.id, 'ACCEPTED')} className="text-green-600 font-bold hover:underline">Accept</button>
                        <button onClick={() => updateStatus(ref.id, 'REJECTED')} className="text-red-600 font-bold hover:underline">Reject</button>
                      </>
                    )}
                    {activeTab === 'INCOMING' && ref.status === 'ACCEPTED' && (
                      <button onClick={() => updateStatus(ref.id, 'COMPLETED')} className="text-indigo-600 font-bold hover:underline">Mark Complete</button>
                    )}
                    {activeTab === 'OUTGOING' && ref.status === 'CREATED' && (
                      <button onClick={() => updateStatus(ref.id, 'CANCELLED')} className="text-red-600 font-bold hover:underline">Cancel</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {referrals.length === 0 && !error && <div className="p-8 text-center text-gray-500">No {activeTab.toLowerCase()} referrals found.</div>}
      </div>
    </div>
  );
};

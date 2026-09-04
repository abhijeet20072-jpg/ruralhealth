import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export const QueueManagement: React.FC = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [error, setError] = useState('');
  
  const facilityId = 'demo-facility-id'; // In real app, tied to logged-in MO/Staff
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const fetchQueue = async () => {
    try {
      // Dummy fetch to satisfy UI scaffolding
      const res = await api.get(`/appointments/queue?facilityId=${facilityId}&date=${today}`);
      setQueue(res.data.queue || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load queue. Note: Using mocked facility ID for scaffolding.');
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Queue Management (Live)</h1>
      <p className="text-gray-500 mb-8">Date: {today}</p>
      
      {error && <div className="p-4 mb-4 bg-yellow-50 text-yellow-800 rounded">{error}</div>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Token</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time Slot</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {queue.map(apt => (
              <tr key={apt.id}>
                <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-900">{apt.tokenNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{apt.timeSlot}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{apt.firstName} {apt.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-bold 
                    ${apt.queueStatus === 'WAITING' ? 'bg-yellow-100 text-yellow-800' : 
                      apt.queueStatus === 'IN_CONSULTATION' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {apt.queueStatus.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {apt.queueStatus === 'WAITING' && (
                    <button onClick={() => updateStatus(apt.id, 'IN_CONSULTATION')} className="text-blue-600 hover:text-blue-900">Call In</button>
                  )}
                  {apt.queueStatus === 'IN_CONSULTATION' && (
                    <button onClick={() => updateStatus(apt.id, 'DONE')} className="text-green-600 hover:text-green-900">Mark Done</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {queue.length === 0 && !error && <div className="p-6 text-center text-gray-500">No patients in queue for today.</div>}
      </div>
    </div>
  );
};

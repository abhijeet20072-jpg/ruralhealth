import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export const MyNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
    } catch (e) {}
  };

  if (loading) return <div className="p-6">Loading notifications...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-slate-500 mt-2">Updates on your appointments, prescriptions, and health alerts.</p>
        </div>
        {notifications.some(n => !n.readAt) && (
          <button onClick={handleMarkAllRead} className="bg-white border-l-4 border-transparent text-slate-700 px-4 py-2 rounded-md font-semibold border border-slate-300 hover:bg-slate-50 shadow-sm transition-colors">
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No notifications</h3>
            <p className="text-slate-500">You're all caught up!</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {notifications.map(n => (
              <li key={n.id} className={`p-4 flex gap-4 \${!n.readAt ? 'bg-cyan-50/40 border-l-4 border-cyan-500' : 'bg-white'}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold \${!n.readAt ? 'text-slate-900' : 'text-slate-600'}`}>{n.title}</h3>
                    {!n.readAt && <span className="bg-cyan-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">NEW</span>}
                    {n.priority === 'HIGH' && <span className="bg-rose-100 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-bold">HIGH PRIORITY</span>}
                  </div>
                  <p className={`text-sm \${!n.readAt ? 'text-slate-800' : 'text-slate-500'} mb-2`}>{n.message}</p>
                  <p className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.readAt && (
                  <div className="flex items-center">
                    <button onClick={() => handleMarkRead(n.id)} className="text-sm font-bold text-cyan-600 hover:bg-cyan-50 px-3 py-1 rounded transition-colors">
                      Mark read
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

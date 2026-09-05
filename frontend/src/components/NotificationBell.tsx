import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  readAt: string | null;
  createdAt: string;
}

export const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (e) {}
  };

  const fetchPreview = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications.slice(0, 5));
    } catch (e) {}
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Poll every 1 min
    return () => clearInterval(interval);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) fetchPreview();
  };

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (e) {}
  };

  return (
    <div className="relative">
      <button onClick={handleOpen} className="p-2 relative text-slate-400 hover:text-white transition-colors" aria-label="Notifications">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden">
          <div className="p-3 border-b flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={async () => {
                await api.put('/notifications/read-all');
                setUnreadCount(0);
                setNotifications(notifications.map(n => ({ ...n, readAt: new Date().toISOString() })));
              }} className="text-xs text-cyan-600 font-bold hover:underline">Mark all read</button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">No notifications.</div>
            ) : (
              <ul className="divide-y">
                {notifications.map(n => (
                  <li key={n.id} onClick={() => { setIsOpen(false); navigate('/my-notifications'); }} className={`p-3 cursor-pointer hover:bg-slate-50 ${!n.readAt ? 'bg-cyan-50/30' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm font-bold ${!n.readAt ? 'text-slate-900' : 'text-slate-600'}`}>{n.title}</span>
                      {!n.readAt && <span className="w-2 h-2 rounded-full bg-cyan-600 mt-1 shrink-0"></span>}
                    </div>
                    <p className={`text-xs ${!n.readAt ? 'text-slate-700' : 'text-slate-500'} line-clamp-2`}>{n.message}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                      {!n.readAt && (
                        <button onClick={(e) => handleMarkRead(n.id, e)} className="text-[10px] text-cyan-600 hover:underline">Mark read</button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="p-2 border-t text-center bg-slate-50">
            <button onClick={() => { setIsOpen(false); navigate('/my-notifications'); }} className="text-sm font-bold text-cyan-600 hover:underline">View All Notifications</button>
          </div>
        </div>
      )}
    </div>
  );
};

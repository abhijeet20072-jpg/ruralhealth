import React from 'react';
import { useConnectivity } from '../context/ConnectivityContext';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';
import { NotificationBell } from './NotificationBell';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { isOnline, isSyncing, pendingCount } = useConnectivity();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-slate-900 border-b border-slate-800 shadow-sm z-10 relative">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center md:hidden mr-4">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300 hover:text-white focus:outline-none">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
              <Link to="/dashboard" className="flex flex-col flex-shrink-0 group">
                <span className="text-white font-bold text-xl tracking-wide group-hover:text-cyan-400 transition-colors">
                  Arogya Connect
                </span>
                <span className="text-xs text-slate-400 font-medium">Connecting Every Community to Care.</span>
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-white">
                {isOnline ? (
                  <span className="flex items-center text-emerald-400 font-semibold text-sm">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span> Online
                  </span>
                ) : (
                  <span className="flex items-center text-rose-300 font-semibold text-sm">
                    <span className="w-2 h-2 bg-rose-500 rounded-full mr-2 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse"></span> Offline
                  </span>
                )}
                
                {pendingCount > 0 && (
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                    {pendingCount} Pending
                  </span>
                )}
                {isSyncing && (
                  <span className="text-cyan-300 text-xs animate-pulse font-bold flex items-center gap-1.5">
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Syncing...
                  </span>
                )}
              </div>
              <NotificationBell />
              <div className="text-slate-300 text-sm hidden md:block">
                Logged in as <span className="font-bold text-white">{user?.username}</span> ({user?.role.replace('ROLE_', '')})
              </div>
              <button onClick={handleLogout} className="text-cyan-400 hover:text-cyan-300 text-sm font-medium border border-cyan-700 hover:border-cyan-400 rounded-md px-3 py-1.5 transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

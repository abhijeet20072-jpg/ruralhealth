import React from 'react';
import { useConnectivity } from '../context/ConnectivityContext';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOnline, isSyncing, pendingCount } = useConnectivity();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-indigo-600 border-b border-indigo-700 pb-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex-shrink-0 text-white font-bold text-xl">
                SIH Healthcare
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-white">
                {isOnline ? (
                  <span className="flex items-center text-green-300">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span> Online
                  </span>
                ) : (
                  <span className="flex items-center text-red-300">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span> Offline
                  </span>
                )}
                
                {pendingCount > 0 && (
                  <span className="bg-yellow-500 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold">
                    {pendingCount} Pending Sync
                  </span>
                )}
                {isSyncing && (
                  <span className="text-gray-200 text-xs animate-pulse">Syncing...</span>
                )}
              </div>
              <button onClick={handleLogout} className="text-indigo-200 hover:text-white text-sm font-medium">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

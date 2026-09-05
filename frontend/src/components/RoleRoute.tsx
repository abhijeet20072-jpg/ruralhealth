import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export const RoleRoute: React.FC<{ allowedRoles: string[], children: React.ReactNode }> = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 max-w-4xl mx-auto mt-10">
        <div className="bg-white border-l-4 border-red-500 p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-red-600 mb-4">Access Restricted</h2>
          <p className="text-slate-700 text-lg mb-6">
            You do not have permission to access this area. Your current role ({user.role.replace('ROLE_', '')}) is not authorized for this workflow.
          </p>
          <a href="/dashboard" className="text-cyan-600 font-bold hover:underline">
            &larr; Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC<{ isOpen?: boolean; setIsOpen?: (v: boolean) => void }> = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const getNavItems = () => {
    const role = user?.role || '';
    const items = [
      { name: 'Dashboard', path: '/dashboard', roles: ['ROLE_DISTRICT_ADMIN', 'ROLE_FACILITY_ADMIN', 'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_HEALTH_WORKER', 'ROLE_ASHA', 'ROLE_ANM', 'ROLE_CHO', 'ROLE_CITIZEN'] }
    ];

    if (role === 'ROLE_DISTRICT_ADMIN') {
      items.push({ name: 'Facilities', path: '/facilities', roles: ['ROLE_DISTRICT_ADMIN'] });
      items.push({ name: 'Patients', path: '/patients', roles: ['ROLE_DISTRICT_ADMIN'] });
      items.push({ name: 'Referrals', path: '/referrals', roles: ['ROLE_DISTRICT_ADMIN'] });
    } else if (role === 'ROLE_CITIZEN') {
      items.push({ name: 'My Appointments', path: '/appointments', roles: ['ROLE_CITIZEN'] });
      items.push({ name: 'Find Facility', path: '/facilities', roles: ['ROLE_CITIZEN'] });
      if (user?.patientId) {
        items.push({ name: 'My Health Info', path: `/patients/${user.patientId}`, roles: ['ROLE_CITIZEN'] });
        items.push({ name: 'My Referrals', path: '/my-referrals', roles: ['ROLE_CITIZEN'] });
      }
    } else {
      // Clinical Staff
      items.push({ name: 'Patients', path: '/patients', roles: ['ROLE_FACILITY_ADMIN', 'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_HEALTH_WORKER', 'ROLE_ASHA', 'ROLE_ANM', 'ROLE_CHO'] });
      items.push({ name: 'Today\'s Queue', path: '/queue', roles: ['ROLE_FACILITY_ADMIN', 'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_HEALTH_WORKER', 'ROLE_ASHA', 'ROLE_ANM', 'ROLE_CHO'] });
      items.push({ name: 'Referrals', path: '/referrals', roles: ['ROLE_FACILITY_ADMIN', 'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_HEALTH_WORKER', 'ROLE_ASHA', 'ROLE_ANM', 'ROLE_CHO'] });
    }
    
    if (['ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_HEALTH_WORKER', 'ROLE_CITIZEN'].includes(role)) {
      items.push({ name: 'Teleconsultations', path: '/teleconsultations', roles: ['ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_HEALTH_WORKER', 'ROLE_CITIZEN'] });
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <div className={`${isOpen ? 'block absolute z-20 h-full' : 'hidden'} md:block md:relative w-64 bg-slate-900 border-r border-slate-800 text-slate-300 min-h-[calc(100vh-4.5rem)] flex flex-col shrink-0 overflow-y-auto`}>
      <div className="p-4 border-b border-slate-800/50">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Main Navigation</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link onClick={() => setIsOpen && setIsOpen(false)}
            key={item.name}
            to={item.path}
            className={`block px-4 py-2.5 rounded-r-md transition-all font-medium text-sm ${
              isActive(item.path) ? 'bg-cyan-900/40 border-l-2 border-cyan-400 text-cyan-50 shadow-sm' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

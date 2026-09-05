import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { useConnectivity } from '../context/ConnectivityContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { isOnline } = useConnectivity();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isOnline) {
        setLoading(false);
        return;
      }
      try {
        if (user?.role === 'ROLE_DISTRICT_ADMIN') {
          const [facilitiesRes, overdueRes] = await Promise.all([
            api.get('/facilities/search?type=ALL'), // Or whatever gets all facilities
            api.get('/referrals/overdue').catch(() => ({ data: { overdue: [] } }))
          ]);
          setData({
            facilitiesCount: facilitiesRes.data.facilities?.length || 0,
            overdueReferrals: overdueRes.data.overdue?.length || 0
          });
        } else if (user?.facilityId) {
          const [queueRes, referralsRes] = await Promise.all([
            api.get(`/appointments/queue?facilityId=${user.facilityId}`).catch(() => ({ data: { queue: [] } })),
            api.get(`/referrals/dashboard?facilityId=${user.facilityId}&type=INCOMING`).catch(() => ({ data: { referrals: [] } }))
          ]);
          setData({
            queueCount: queueRes.data.queue?.length || 0,
            incomingReferrals: referralsRes.data.referrals?.length || 0
          });
        }
      } catch (err: any) {
        setError('Failed to load dashboard data. ' + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user, isOnline]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-cyan-500">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Arogya Connect</h1>
        <p className="text-slate-500 text-sm mb-4 uppercase tracking-wider font-semibold">Your healthcare at a glance.</p>
        <p className="text-slate-600 text-lg">
          Logged in as <span className="font-semibold">{user.username}</span>. Your role is <span className="font-bold text-cyan-700">{user.role.replace('ROLE_', '')}</span>.
        </p>
      </div>

      {!isOnline && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-sm">
          <p className="text-yellow-800 font-medium">You are currently offline. Dashboard statistics cannot be refreshed until connectivity is restored.</p>
        </div>
      )}

      {loading && isOnline && (
        <div className="text-slate-500 flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-cyan-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span>Loading operational statistics...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded shadow-sm">
          {error}
        </div>
      )}

      {!loading && data && user.role === 'ROLE_DISTRICT_ADMIN' && (
        <div className="mt-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">District Operations Overview</h2>
            <p className="text-sm text-slate-500 mt-1">Monitor facilities and resolve escalations across the district.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
              <div>
                <h3 className="text-slate-500 font-semibold mb-2 uppercase tracking-wide text-xs">Total Facilities</h3>
                <div className="flex items-baseline mb-4">
                  <p className="text-4xl font-extrabold text-slate-900">{data.facilitiesCount}</p>
                  <span className="ml-2 text-sm font-medium text-slate-500">in network</span>
                </div>
              </div>
              <Link to="/facilities" className="text-cyan-600 hover:text-cyan-700 font-semibold text-sm inline-flex items-center">
                Manage Facilities <span className="ml-1">&rarr;</span>
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
              <div>
                <h3 className="text-rose-500 font-semibold mb-2 uppercase tracking-wide text-xs">Overdue Referrals</h3>
                <div className="flex items-baseline mb-4">
                  <p className="text-4xl font-extrabold text-rose-600">{data.overdueReferrals}</p>
                  <span className="ml-2 text-sm font-medium text-slate-500">require escalation</span>
                </div>
              </div>
              <Link to="/referrals" className="text-rose-600 hover:text-rose-700 font-semibold text-sm inline-flex items-center">
                Review Escalations <span className="ml-1">&rarr;</span>
              </Link>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
              <div>
                <h3 className="text-slate-400 font-semibold mb-2 uppercase tracking-wide text-xs">District Administration</h3>
                <p className="text-lg font-bold text-white mt-2 mb-1">Directory & Oversight</p>
              </div>
              <div className="flex flex-col gap-3 mt-4">
                <Link to="/patients" className="text-cyan-400 hover:text-cyan-300 font-medium text-sm inline-flex items-center">
                  Search Patient Directory <span className="ml-1">&rarr;</span>
                </Link>
                <Link to="/facilities/new" className="text-cyan-400 hover:text-cyan-300 font-medium text-sm inline-flex items-center">
                  Register New Facility <span className="ml-1">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && data && user.role !== 'ROLE_DISTRICT_ADMIN' && user.facilityId && (
        <div className="mt-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">{user.role === 'ROLE_FACILITY_ADMIN' ? 'Facility Operations Dashboard' : 'Operational Overview'}</h2>
            <p className="text-sm text-slate-500">Requires your attention today.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
              <h3 className="text-slate-500 font-semibold mb-2 uppercase tracking-wide text-xs">Patients in Queue</h3>
              <div className="flex items-baseline mb-4">
                <p className="text-4xl font-extrabold text-slate-900">{data.queueCount}</p>
                <span className="ml-2 text-sm font-medium text-slate-500">waiting</span>
              </div>
              <Link to="/queue" className="text-cyan-600 hover:text-cyan-700 font-medium text-sm inline-flex items-center">
                Manage Queue <span className="ml-1">&rarr;</span>
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <h3 className="text-slate-500 font-semibold mb-2 uppercase tracking-wide text-xs">Incoming Referrals</h3>
              <div className="flex items-baseline mb-4">
                <p className="text-4xl font-extrabold text-slate-900">{data.incomingReferrals}</p>
                <span className="ml-2 text-sm font-medium text-slate-500">pending</span>
              </div>
              <Link to="/referrals" className="text-cyan-600 hover:text-cyan-700 font-medium text-sm inline-flex items-center">
                Review Referrals <span className="ml-1">&rarr;</span>
              </Link>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <h3 className="text-slate-500 font-semibold mb-2 uppercase tracking-wide text-xs">Patient Directory</h3>
              <div className="flex items-baseline mb-4">
                <p className="text-lg font-bold text-slate-900 mt-2 mb-1">Search & View</p>
              </div>
              <Link to="/patients" className="text-cyan-600 hover:text-cyan-700 font-medium text-sm inline-flex items-center mt-1">
                Access Records <span className="ml-1">&rarr;</span>
              </Link>
            </div>
            
            {user.role === 'ROLE_FACILITY_ADMIN' && (
              <div className="bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                <div>
                  <h3 className="text-slate-400 font-semibold mb-2 uppercase tracking-wide text-xs">Inventory & Settings</h3>
                  <p className="text-lg font-bold text-white mt-2 mb-1">Manage Facility</p>
                </div>
                <div className="flex gap-4 mt-4">
                  <Link to="/medicines/inventory" className="text-cyan-400 hover:text-cyan-300 font-medium text-sm inline-flex items-center">
                    Medicines
                  </Link>
                  <Link to="/facilities/new" className="text-cyan-400 hover:text-cyan-300 font-medium text-sm inline-flex items-center">
                    Settings
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {user.role === 'ROLE_CITIZEN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <h3 className="text-slate-500 font-semibold mb-2 uppercase tracking-wide text-xs">My Appointments</h3>
            <p className="text-sm text-slate-600 mb-4">View and manage your upcoming care.</p>
            <Link to="/appointments" className="text-cyan-600 hover:text-cyan-700 font-medium text-sm inline-flex items-center">
              Manage Appointments <span className="ml-1">&rarr;</span>
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <h3 className="text-slate-500 font-semibold mb-2 uppercase tracking-wide text-xs">Health Information</h3>
            <p className="text-sm text-slate-600 mb-4">Your personal health record and timeline.</p>
            <Link to={user.patientId ? `/patients/${user.patientId}` : "/patients/new"} className="text-cyan-600 hover:text-cyan-700 font-medium text-sm inline-flex items-center">
              {user.patientId ? "View Health Record" : "Complete Patient Profile"} <span className="ml-1">&rarr;</span>
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <h3 className="text-slate-500 font-semibold mb-2 uppercase tracking-wide text-xs">Discover Care</h3>
            <p className="text-sm text-slate-600 mb-4">Find nearby facilities and healthcare services.</p>
            <Link to="/facilities" className="text-cyan-600 hover:text-cyan-700 font-medium text-sm inline-flex items-center">
              Search Facilities <span className="ml-1">&rarr;</span>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
};

const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/pages/Dashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

const regex = /\{!loading && data && user\.role !== 'ROLE_DISTRICT_ADMIN' && user\.facilityId && \([\s\S]*?\)\}/;

const newStaffDash = `{!loading && data && user.role !== 'ROLE_DISTRICT_ADMIN' && user.facilityId && (
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
      )}`;

content = content.replace(regex, newStaffDash);
fs.writeFileSync(file, content);

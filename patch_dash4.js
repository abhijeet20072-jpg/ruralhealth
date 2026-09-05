const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/pages/Dashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

const target = `{!loading && data && user.role === 'ROLE_DISTRICT_ADMIN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <h3 className="text-slate-500 font-semibold mb-2 uppercase tracking-wide text-sm">Total Facilities</h3>
            <p className="text-4xl font-extrabold text-slate-900">{data.facilitiesCount}</p>
            <Link to="/facilities" className="mt-4 text-cyan-600 hover:text-cyan-700 font-medium text-sm">Manage Facilities &rarr;</Link>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 flex flex-col items-center justify-center text-center">
            <h3 className="text-red-500 font-semibold mb-2 uppercase tracking-wide text-sm">Overdue Referrals</h3>
            <p className="text-4xl font-extrabold text-red-600">{data.overdueReferrals}</p>
            <p className="mt-4 text-red-600 font-medium text-sm">Requires immediate escalation</p>
          </div>
        </div>
      )}`;

const replacement = `{!loading && data && user.role === 'ROLE_DISTRICT_ADMIN' && (
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
      )}`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);

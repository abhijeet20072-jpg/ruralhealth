const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/pages/Dashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

// For Staff/Doctor cards, the previous implementation was:
// <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
//   <h3 className="text-slate-500 font-semibold mb-1 uppercase tracking-wide text-sm">Patients in Queue</h3>...

content = content.replace(
  `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 font-semibold mb-1 uppercase tracking-wide text-sm">Patients in Queue</h3>
            <p className="text-3xl font-bold text-slate-900">{data.queueCount}</p>
            <Link to="/queue" className="mt-4 inline-block text-cyan-600 hover:text-cyan-800 font-medium text-sm">View Active Queue &rarr;</Link>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 font-semibold mb-1 uppercase tracking-wide text-sm">Incoming Referrals</h3>
            <p className="text-3xl font-bold text-slate-900">{data.incomingReferrals}</p>
            <Link to="/referrals" className="mt-4 inline-block text-cyan-600 hover:text-cyan-800 font-medium text-sm">Manage Referrals &rarr;</Link>
          </div>
        </div>`,
  `<div className="mb-6"><h2 className="text-xl font-bold text-slate-800">Operational Overview</h2><p className="text-sm text-slate-500">Requires your attention today.</p></div>
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
        </div>`
);

fs.writeFileSync(file, content);

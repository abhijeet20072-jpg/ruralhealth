const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/pages/EmergencyDashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Emergency Dashboard</h1>`,
  `<div className="flex justify-between items-start md:items-center flex-col md:flex-row mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Emergency Dashboard</h1>
          <p className="text-slate-500 mt-2">Live monitoring of high-acuity cases and active transfers.</p>
        </div>`
);

content = content.replace(
  `<div className="p-12 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
            No active emergencies for this facility.
          </div>`,
  `<div className="p-12 text-center flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200">
            <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h3 className="text-lg font-medium text-slate-900 mb-1">Clear Status</h3>
            <p className="text-slate-500">No active emergencies for this facility.</p>
          </div>`
);

content = content.replace(
  `border-red-600`,
  `border-rose-600`
);
content = content.replace(
  `border-green-500`,
  `border-emerald-500`
);
content = content.replace(
  `bg-red-100 text-red-800`,
  `bg-rose-100 text-rose-800 border border-rose-200`
);
content = content.replace(
  `bg-red-50 text-red-900`,
  `bg-rose-50 text-rose-900`
);
content = content.replace(
  `border-red-100`,
  `border-rose-200`
);
content = content.replace(
  `bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded font-bold text-sm transition`,
  `bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-md font-semibold text-sm transition-colors shadow-sm`
);

fs.writeFileSync(file, content);

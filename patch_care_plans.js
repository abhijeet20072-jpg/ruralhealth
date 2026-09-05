const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/pages/CareManagementDashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Care Management</h1>`,
  `<div className="flex justify-between items-start md:items-center flex-col md:flex-row mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Care Management</h1>
          <p className="text-slate-500 mt-2">Active care plans for longitudinal tracking.</p>
        </div>`
);

content = content.replace(
  `{plans.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
            No active care plans for this facility.
          </div>
        )`,
  `{plans.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200">
            <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" /></svg>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No active care plans</h3>
            <p className="text-slate-500">There are no longitudinal care plans assigned to this facility.</p>
          </div>
        )`
);

content = content.replace(
  `bg-cyan-100 hover:bg-cyan-200 text-cyan-700 px-3 py-1 rounded font-bold text-xs transition`,
  `bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-1.5 rounded-md font-semibold text-xs transition-colors shadow-sm`
);

content = content.replace(
  `case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-500';`,
  `case 'CRITICAL': return 'bg-rose-100 text-rose-800 border-rose-200';`
);
content = content.replace(
  `case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-400';`,
  `case 'HIGH': return 'bg-amber-100 text-amber-800 border-amber-200';`
);
content = content.replace(
  `case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-400';`,
  `case 'MEDIUM': return 'bg-yellow-50 text-yellow-800 border-yellow-200';`
);
content = content.replace(
  `case 'LOW': return 'bg-green-100 text-green-800 border-green-400';`,
  `case 'LOW': return 'bg-emerald-100 text-emerald-800 border-emerald-200';`
);

content = content.replace(
  `className="text-xl font-bold text-slate-900 cursor-pointer hover:text-cyan-600 mb-1"`,
  `className="text-xl font-extrabold text-slate-900 cursor-pointer hover:text-cyan-600 mb-1 tracking-tight"`
);

fs.writeFileSync(file, content);

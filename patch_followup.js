const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/pages/StaffFollowUps.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<h1 className="text-2xl font-bold text-slate-800 mb-6">Facility Follow-Ups</h1>`,
  `<div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Facility Follow-Ups</h1>
        <p className="text-slate-500 mt-2">Manage ongoing patient care and outstanding follow-up tasks.</p>
      </div>`
);

content = content.replace(
  `className="bg-white rounded-xl shadow overflow-hidden"`,
  `className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"`
);

content = content.replace(
  `{followUps.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No active follow-ups for this facility.</div>
        )`,
  `{followUps.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" /></svg>
            <h3 className="text-lg font-medium text-slate-900 mb-1">All caught up</h3>
            <p className="text-slate-500">There are no pending follow-ups for this facility.</p>
          </div>
        )`
);

content = content.replace(
  `divide-gray-200`,
  `divide-slate-200`
);
content = content.replace(
  `divide-gray-200`,
  `divide-slate-200`
);

content = content.replace(
  /fu.status === 'OVERDUE' \? 'bg-red-50\/50' : fu.status === 'DUE' \? 'bg-yellow-50\/50' : ''/g,
  `fu.status === 'OVERDUE' ? 'bg-rose-50/50' : fu.status === 'DUE' ? 'bg-amber-50/30' : ''`
);

content = content.replace(
  `fu.status === 'OVERDUE' ? 'bg-red-600 text-white' :`,
  `fu.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800 border border-rose-200' :`
);
content = content.replace(
  `fu.status === 'DUE' ? 'bg-yellow-400 text-yellow-900' :`,
  `fu.status === 'DUE' ? 'bg-amber-100 text-amber-800 border border-amber-200' :`
);
content = content.replace(
  `fu.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :`,
  `fu.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :`
);
content = content.replace(
  `fu.status === 'CANCELLED' ? 'bg-slate-100 text-slate-500' :`,
  `fu.status === 'CANCELLED' ? 'bg-slate-100 text-slate-600 border border-slate-200' :`
);
content = content.replace(
  `'bg-cyan-100 text-cyan-800'`,
  `'bg-cyan-100 text-cyan-800 border border-cyan-200'`
);

content = content.replace(
  `<button onClick={() => handleUpdateStatus(fu.id, 'COMPLETED')} className="bg-green-600 text-white text-xs px-2 py-1 rounded font-bold hover:bg-green-700 transition">`,
  `<button onClick={() => handleUpdateStatus(fu.id, 'COMPLETED')} className="flex-1 bg-emerald-600 text-white text-xs px-2 py-1.5 rounded-md font-semibold hover:bg-emerald-700 transition-colors shadow-sm">`
);

content = content.replace(
  `<button onClick={() => handleUpdateStatus(fu.id, 'CANCELLED')} className="bg-slate-200 text-slate-800 text-xs px-2 py-1 rounded font-bold hover:bg-slate-300 transition">`,
  `<button onClick={() => handleUpdateStatus(fu.id, 'CANCELLED')} className="flex-1 bg-white text-slate-700 border border-slate-300 text-xs px-2 py-1.5 rounded-md font-semibold hover:bg-slate-50 transition-colors">`
);


fs.writeFileSync(file, content);

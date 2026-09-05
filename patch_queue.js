const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/pages/QueueManagement.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<h1 className="text-3xl font-bold text-slate-800 mb-6">Queue Management (Live)</h1>
      <p className="text-slate-500 mb-8">Date: {today}</p>`,
  `<div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Queue Management</h1>
          <p className="text-slate-500 mt-2">Manage today's live patient queue.</p>
        </div>
        <div className="bg-slate-100 px-4 py-2 rounded-md border border-slate-200">
          <span className="text-sm font-semibold text-slate-700">Date: {today}</span>
        </div>
      </div>`
);

content = content.replace(
  `<div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">`,
  `<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">`
);

content = content.replace(
  `divide-gray-200`,
  `divide-slate-200`
);

content = content.replace(
  `</table>\n        {queue.length === 0 && !error && <div className="p-6 text-center text-slate-500">No patients in queue for today.</div>}\n      </div>`,
  `</table>\n        </div>\n        {queue.length === 0 && !error && <div className="p-12 text-center flex flex-col items-center justify-center">\n          <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>\n          <h3 className="text-lg font-medium text-slate-900 mb-1">Queue is empty</h3>\n          <p className="text-slate-500">No patients are currently waiting in the queue.</p>\n        </div>}\n      </div>`
);

content = content.replace(
  `<button onClick={() => updateStatus(apt.id, 'IN_CONSULTATION')} className="text-cyan-600 hover:text-cyan-900 font-bold border border-cyan-200 px-3 py-1 rounded bg-cyan-50">Call In</button>`,
  `<button onClick={() => updateStatus(apt.id, 'IN_CONSULTATION')} className="w-full md:w-auto inline-flex items-center justify-center text-cyan-700 hover:text-cyan-800 font-semibold border border-cyan-300 px-4 py-2 rounded-md bg-cyan-50 hover:bg-cyan-100 transition-colors shadow-sm">Call In</button>`
);

content = content.replace(
  `<button onClick={() => navigate(\`/consultation/\${apt.id}\`)} className="text-cyan-600 hover:text-cyan-900 font-bold border border-cyan-200 px-3 py-1 rounded bg-cyan-50">Open Clinical Workspace</button>`,
  `<button onClick={() => navigate(\`/consultation/\${apt.id}\`)} className="w-full md:w-auto inline-flex items-center justify-center text-white font-semibold border border-transparent px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 transition-colors shadow-sm">Open Workspace &rarr;</button>`
);

content = content.replace(
  `apt.queueStatus === 'WAITING' ? 'bg-yellow-100 text-yellow-800' :`,
  `apt.queueStatus === 'WAITING' ? 'bg-amber-100 text-amber-800 border border-amber-200' :`
);
content = content.replace(
  `apt.queueStatus === 'IN_CONSULTATION' ? 'bg-cyan-100 text-cyan-800'`,
  `apt.queueStatus === 'IN_CONSULTATION' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'`
);
content = content.replace(
  `bg-green-100 text-green-800'`,
  `bg-emerald-100 text-emerald-800 border border-emerald-200'`
);

fs.writeFileSync(file, content);

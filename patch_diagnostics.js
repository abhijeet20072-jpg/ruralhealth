const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/pages/DiagnosticOrders.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<h1 className="text-3xl font-bold text-slate-800 mb-6">Diagnostic Laboratory Orders</h1>`,
  `<div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Diagnostic Orders</h1>
        <p className="text-slate-500 mt-2">Manage incoming lab requests, sample collection, and result entry.</p>
      </div>`
);

content = content.replace(
  `{orders.length === 0 && <p className="text-slate-500">No incoming diagnostic orders.</p>}`,
  `{orders.length === 0 && <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-slate-200">
          <svg className="w-12 h-12 text-slate-300 mb-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No orders pending</h3>
          <p className="text-slate-500">There are no diagnostic orders requiring attention.</p>
        </div>}`
);

content = content.replace(
  /bg-cyan-600 text-white px-3 py-2 rounded text-sm font-bold/g,
  `bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md text-sm font-semibold shadow-sm transition-colors w-full`
);

content = content.replace(
  /bg-red-50 text-red-700 px-3 py-2 rounded text-sm font-bold border border-red-200/g,
  `bg-white text-red-700 px-4 py-2 rounded-md text-sm font-semibold border border-red-200 hover:bg-red-50 transition-colors w-full`
);

content = content.replace(
  `className="bg-white p-5 rounded-xl shadow border border-slate-100 flex flex-col md:flex-row justify-between"`,
  `className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between hover:shadow-md transition-shadow"`
);

content = content.replace(
  `<h3 className="font-bold text-lg">{o.testName}`,
  `<h3 className="font-extrabold text-slate-900 text-lg tracking-tight">{o.testName}`
);

content = content.replace(
  `bg-cyan-50 text-cyan-700 font-bold border border-cyan-200`,
  `bg-slate-100 text-slate-800 font-bold border border-slate-200 tracking-wide uppercase` // More subtle, standard tracking
);

fs.writeFileSync(file, content);

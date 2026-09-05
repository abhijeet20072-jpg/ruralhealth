const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/pages/Facilities.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<h1 className="text-3xl font-bold text-slate-900 tracking-tight">Healthcare Facilities</h1>
          <p className="text-slate-500 mt-2">Discover care and find nearby hospitals, clinics, and health centers.</p>`,
  `<h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{user?.role === 'ROLE_DISTRICT_ADMIN' ? 'District Facilities' : 'Healthcare Facilities'}</h1>
          <p className="text-slate-500 mt-2">{user?.role === 'ROLE_DISTRICT_ADMIN' ? 'District-level facility directory and oversight.' : 'Discover care and find nearby hospitals, clinics, and health centers.'}</p>`
);

content = content.replace(
  `px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700`,
  `px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md font-semibold transition-colors shadow-sm`
);

content = content.replace(
  `className="flex-1 p-3 border rounded shadow-sm"`,
  `className="flex-1 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow"`
);

content = content.replace(
  `className="px-6 py-3 bg-slate-800 text-white rounded hover:bg-slate-900"`,
  `className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold transition-colors shadow-sm"`
);

content = content.replace(
  `Search Nearby`,
  `{user?.role === 'ROLE_DISTRICT_ADMIN' ? 'Search Directory' : 'Search Nearby'}`
);

content = content.replace(
  `className="bg-white p-6 rounded-lg shadow border border-slate-100 flex flex-col"`,
  `className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col relative"`
);

content = content.replace(
  `text-xl font-semibold text-cyan-900`,
  `text-lg font-bold text-slate-900 tracking-tight`
);

content = content.replace(
  `text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded font-bold`,
  `text-[10px] px-2 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full font-bold uppercase tracking-wider`
);

content = content.replace(
  `bg-red-100 text-red-700 rounded`,
  `bg-rose-100 text-rose-800 border border-rose-200 rounded-full`
);
content = content.replace(
  `bg-green-100 text-green-700 rounded`,
  `bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full`
);

content = content.replace(
  `{facilities.length === 0 && <p className="text-slate-500">No facilities found matching your criteria.</p>}`,
  `{facilities.length === 0 && (
          <div className="col-span-full p-12 text-center flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200">
            <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No facilities found</h3>
            <p className="text-slate-500">There are no facilities matching your current search criteria.</p>
          </div>
        )}`
);

content = content.replace(
  `border-t border-slate-100`,
  `border-t border-slate-200`
);
content = content.replace(
  `text-cyan-600 hover:underline font-medium`,
  `text-cyan-600 hover:text-cyan-700 font-semibold transition-colors`
);

fs.writeFileSync(file, content);

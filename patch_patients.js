const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/pages/Patients.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">{user?.role === 'ROLE_CITIZEN' ? 'My Profile' : 'Patient Directory'}</h1>`,
  `<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{user?.role === 'ROLE_CITIZEN' ? 'My Profile' : 'Patient Directory'}</h1>
          <p className="text-slate-500 mt-2">Search and manage patient medical records securely.</p>
        </div>`
);

content = content.replace(
  `px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700`,
  `px-4 py-2 bg-cyan-600 text-white rounded-md font-semibold hover:bg-cyan-700 transition-colors shadow-sm`
);

content = content.replace(
  `placeholder="Search by Name, ABHA ID, or Phone..."`,
  `placeholder="Search by Name, Health ID, or Phone..."`
);

content = content.replace(
  `ABHA ID`,
  `Health ID`
);

content = content.replace(
  `className="bg-white rounded-lg shadow overflow-hidden"`,
  `className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"`
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
  `{patients.length === 0 && <div className="p-6 text-center text-slate-500">No patients found.</div>}`,
  `{patients.length === 0 && <div className="p-12 text-center flex flex-col items-center justify-center">
          <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No patients found</h3>
          <p className="text-slate-500">Try adjusting your search criteria.</p>
        </div>}`
);

fs.writeFileSync(file, content);

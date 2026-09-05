const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/pages/FacilityManage.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<h1 className="text-2xl font-bold mb-6">Register New Facility</h1>`,
  `<div className="mb-6 border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Facility Configuration</h1>
          <p className="text-slate-500 mt-1 text-sm">Register a new healthcare facility and configure services.</p>
        </div>`
);

content = content.replace(
  `className="w-full py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"`,
  `className="w-full py-3 bg-cyan-600 text-white rounded-md font-semibold text-lg hover:bg-cyan-700 shadow-md transition-colors mt-6"`
);

content = content.replace(
  /className="mt-1 block w-full p-2 border rounded"/g,
  `className="mt-1 block w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow"`
);

fs.writeFileSync(file, content);

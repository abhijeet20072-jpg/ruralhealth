const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'frontend', 'src', 'pages', 'Facilities.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Healthcare Facilities</h1>`,
  `<div className="flex justify-between items-start md:items-center flex-col md:flex-row mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Healthcare Facilities</h1>
          <p className="text-slate-500 mt-2">Discover care and find nearby hospitals, clinics, and health centers.</p>
        </div>`
);

content = content.replace(/text-blue-900/g, 'text-cyan-900');
content = content.replace(/text-blue-600/g, 'text-cyan-600');
content = content.replace(/bg-gray-800/g, 'bg-slate-800');
content = content.replace(/hover:bg-gray-900/g, 'hover:bg-slate-900');
content = content.replace(/bg-gray-100/g, 'bg-slate-100');
content = content.replace(/border-gray-100/g, 'border-slate-100');
content = content.replace(/text-gray-400/g, 'text-slate-400');

fs.writeFileSync(file, content);

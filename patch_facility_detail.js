const fs = require('fs');
const path = require('path');

const fdPath = path.join(__dirname, 'frontend', 'src', 'pages', 'FacilityDetail.tsx');
let fdContent = fs.readFileSync(fdPath, 'utf8');

// The replacement script earlier replaced blue with cyan, so let's fix bg-blue-100 if it missed it (it only replaced bg-blue-600)
fdContent = fdContent.replace(/text-gray-900/g, 'text-slate-900');
fdContent = fdContent.replace(/text-gray-600/g, 'text-slate-600');
fdContent = fdContent.replace(/text-gray-700/g, 'text-slate-700');
fdContent = fdContent.replace(/text-gray-500/g, 'text-slate-500');
fdContent = fdContent.replace(/bg-gray-50/g, 'bg-slate-50');

fdContent = fdContent.replace(
  `<span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-bold">`,
  `<span className="px-4 py-1.5 bg-cyan-100 text-cyan-800 rounded-full font-semibold text-sm tracking-wide shadow-sm">`
);

fdContent = fdContent.replace(
  `<Link to="/facilities" className="text-blue-600 hover:underline mb-6 inline-block">&larr; Back to Search</Link>`,
  `<Link to="/facilities" className="text-slate-500 hover:text-slate-800 hover:underline mb-6 inline-block font-medium">&larr; Back to Search</Link>`
);

fs.writeFileSync(fdPath, fdContent);

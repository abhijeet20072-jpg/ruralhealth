const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/pages/FacilityDetail.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<Link to="/facilities" className="text-slate-500 hover:text-slate-800 hover:underline mb-6 inline-block font-medium">&larr; Back to Search</Link>`,
  `<div className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500">
        <Link to="/facilities" className="hover:text-cyan-600 transition-colors">Directory</Link>
        <span>/</span>
        <span className="text-slate-900">Facility Details</span>
      </div>`
);

content = content.replace(
  `className="bg-white p-8 rounded-xl shadow-lg"`,
  `className="bg-white p-8 rounded-xl shadow-sm border border-slate-200"`
);

content = content.replace(
  `border-b pb-6 mb-6`,
  `border-b border-slate-200 pb-6 mb-6`
);

content = content.replace(
  `className="text-3xl font-bold text-slate-900 mb-2"`,
  `className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2"`
);

content = content.replace(
  `<h2 className="text-xl font-bold mb-4">Availability & Status</h2>`,
  `<h2 className="text-xl font-bold text-slate-900 tracking-tight mb-4">Availability & Status</h2>`
);

content = content.replace(
  `<h2 className="text-xl font-bold mb-4">Services Offered</h2>`,
  `<h2 className="text-xl font-bold text-slate-900 tracking-tight mb-4">Services Offered</h2>`
);

content = content.replace(
  `<h2 className="text-xl font-bold mt-8 mb-4">Staff & Doctors</h2>`,
  `<h2 className="text-xl font-bold text-slate-900 tracking-tight mt-8 mb-4">Staff Directory</h2>`
);

content = content.replace(
  `bg-slate-50 rounded`,
  `bg-slate-50/50 rounded-md border border-slate-100`
);
content = content.replace(
  /bg-slate-50 rounded/g,
  `bg-slate-50/50 rounded-md border border-slate-100`
);

content = content.replace(
  `text-green-600 font-bold`,
  `text-emerald-700 font-bold flex items-center gap-1`
);
content = content.replace(
  /text-green-600 font-bold/g,
  `text-emerald-700 font-bold flex items-center gap-1`
);

content = content.replace(
  `text-red-600 font-bold`,
  `text-rose-600 font-bold`
);

content = content.replace(
  `px-3 py-1 bg-cyan-50 text-cyan-700 rounded border border-cyan-100`,
  `px-3 py-1 bg-cyan-50/50 text-cyan-800 rounded-md border border-cyan-200 font-medium text-sm`
);

content = content.replace(
  `p-3 border rounded flex items-center justify-between`,
  `p-3 border border-slate-200 rounded-md flex items-center justify-between hover:border-slate-300 hover:shadow-sm transition-all bg-white`
);

content = content.replace(
  `className="px-3 py-1 bg-cyan-600 text-white text-sm rounded hover:bg-cyan-700"`,
  `className="px-4 py-1.5 bg-cyan-600 text-white text-sm rounded-md font-semibold shadow-sm hover:bg-cyan-700 transition-colors"`
);


fs.writeFileSync(file, content);

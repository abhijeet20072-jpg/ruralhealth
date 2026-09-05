const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/pages/Triage.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<h1 className="text-3xl font-bold text-slate-800 mb-6">Digital Triage & Assessment</h1>
      <p className="text-slate-600 mb-8">Structured intake for healthcare workers.</p>`,
  `<div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Digital Triage</h1>
        <p className="text-slate-500 mt-2">Structured clinical intake and CDSS emergency assessment.</p>
      </div>`
);

content = content.replace(
  `border-t-4 border-cyan-600`,
  `border-t-4 border-cyan-500 rounded-xl shadow-sm border-slate-200`
);

content = content.replace(
  `className="mt-1 block w-full p-2 border rounded"`,
  `className="mt-1 block w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow"`
);
content = content.replace(
  /className="mt-1 block w-full p-2 border rounded"/g,
  `className="mt-1 block w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow"`
);
content = content.replace(
  /className="mt-1 block w-full p-3 border rounded border-slate-300"/g,
  `className="mt-1 block w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow"`
);

content = content.replace(
  `bg-red-600`,
  `bg-rose-600 shadow-md`
);
content = content.replace(
  `bg-orange-500`,
  `bg-amber-600 shadow-md`
);
content = content.replace(
  `bg-green-600`,
  `bg-emerald-600 shadow-md`
);

content = content.replace(
  `bg-black/20 p-4 rounded text-sm italic border-l-4 border-black/40`,
  `bg-white/20 p-4 rounded-md text-sm font-medium border-l-4 border-white/50 backdrop-blur-sm`
);

content = content.replace(
  `bg-white text-black font-bold rounded shadow hover:bg-slate-100`,
  `bg-white text-slate-900 font-bold rounded-md shadow hover:bg-slate-50 transition-colors`
);

content = content.replace(
  `<h3 className="text-lg font-bold border-b pb-2 mb-4">Vitals (Optional)</h3>`,
  `<h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Vitals (Optional)</h3>`
);

content = content.replace(
  `<h3 className="text-lg font-bold border-b pb-2 mb-4">Clinical Intake</h3>`,
  `<h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Clinical Intake</h3>`
);

fs.writeFileSync(file, content);

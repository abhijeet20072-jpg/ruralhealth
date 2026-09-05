const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/pages/TeleconsultationRoom.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<div className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">`,
  `<div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-slate-900 shadow-xl px-4 py-5 sm:rounded-2xl sm:p-6 text-white border border-slate-800">`
);

content = content.replace(
  `<h2 className="text-lg leading-6 font-medium text-slate-900">`,
  `<h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
            <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>`
);

content = content.replace(
  `bg-green-100 text-green-800`,
  `bg-emerald-500/20 text-emerald-300 border border-emerald-500/30`
);
content = content.replace(
  `bg-yellow-100 text-yellow-800`,
  `bg-amber-500/20 text-amber-300 border border-amber-500/30`
);

content = content.replace(
  `<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">`,
  `<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 relative">`
);

content = content.replace(
  `bg-slate-100 aspect-video flex items-center justify-center rounded-lg overflow-hidden relative`,
  `bg-black aspect-video flex items-center justify-center rounded-xl overflow-hidden relative border-2 border-slate-700/50 shadow-inner`
);
content = content.replace(
  `bg-slate-100 aspect-video flex items-center justify-center rounded-lg overflow-hidden relative`,
  `bg-black aspect-video flex items-center justify-center rounded-xl overflow-hidden relative border-2 border-slate-700/50 shadow-inner`
);

content = content.replace(
  `absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs`,
  `absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/10`
);
content = content.replace(
  `absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs`,
  `absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/10`
);

content = content.replace(
  `<div className="flex space-x-4 mb-6">`,
  `<div className="flex justify-center space-x-4 py-4 bg-slate-800/50 rounded-xl mb-6">`
);

content = content.replace(
  `className="bg-cyan-600 text-white px-4 py-2 rounded shadow hover:bg-cyan-700"`,
  `className="bg-cyan-600 text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-cyan-700 transition-colors inline-flex items-center gap-2"`
);
content = content.replace(
  `className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"`,
  `className="bg-rose-600 text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-rose-700 transition-colors inline-flex items-center gap-2"`
);

content = content.replace(
  `<div className="mt-6 border-t pt-6">`,
  `<div className="mt-6 border-t border-slate-700 pt-6">`
);

content = content.replace(
  `<h3 className="text-md font-medium text-slate-900 mb-2">Clinical Documentation</h3>`,
  `<h3 className="text-lg font-medium text-slate-100 mb-3">Clinical Documentation</h3>`
);

content = content.replace(
  `className="shadow-sm focus:ring-cyan-500 focus:border-cyan-500 block w-full sm:text-sm border-slate-300 rounded-md"`,
  `className="bg-slate-800 text-white border-slate-700 shadow-inner focus:ring-cyan-500 focus:border-cyan-500 block w-full p-3 rounded-lg resize-none placeholder-slate-500"`
);

content = content.replace(
  `className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"`,
  `className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:bg-emerald-700 transition-colors"`
);


fs.writeFileSync(file, content);

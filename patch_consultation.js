const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/pages/ConsultationWorkspace.tsx');
let content = fs.readFileSync(file, 'utf8');

// The main layout wrapping
content = content.replace(
  `<h1 className="text-3xl font-bold text-slate-800 mb-6">Clinical Consultation Workspace</h1>`,
  `<div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Consultation Workspace</h1>
        <p className="text-slate-500 mt-2">Document chief complaint, diagnosis, and issue prescriptions.</p>
      </div>`
);

content = content.replace(
  `bg-slate-50 border border-slate-200 mb-6`,
  `bg-slate-50 border border-slate-200 mb-8 rounded-xl shadow-sm`
);

content = content.replace(
  `<h2 className="text-xl font-bold mb-4">Patient Information</h2>`,
  `<h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Patient Information</h2>`
);

content = content.replace(
  `bg-amber-100 text-amber-800`,
  `bg-amber-50 text-amber-800 border border-amber-200`
);

content = content.replace(
  `<form onSubmit={handleSubmit} className="space-y-6">`,
  `<form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">`
);

content = content.replace(
  `<div className="grid grid-cols-1 md:grid-cols-2 gap-6">`,
  `<div className="grid grid-cols-1 md:grid-cols-2 gap-8">`
);

content = content.replace(
  `<h3 className="font-bold border-b pb-2 mb-4">Clinical Notes</h3>`,
  `<h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Clinical Notes</h3>`
);

content = content.replace(
  `<h3 className="font-bold border-b pb-2 mb-4">Diagnosis & Plan</h3>`,
  `<h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Diagnosis & Plan</h3>`
);

content = content.replace(
  `<h3 className="font-bold border-b pb-2 mb-4 text-cyan-800">Prescriptions</h3>`,
  `<h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Prescriptions</h3>`
);

content = content.replace(
  `<button type="button" onClick={addMedicine} className="text-sm bg-cyan-100 text-cyan-700 px-3 py-1 rounded hover:bg-cyan-200">+ Add Medicine</button>`,
  `<button type="button" onClick={addMedicine} className="text-sm font-semibold bg-cyan-50 text-cyan-700 px-4 py-2 rounded-md border border-cyan-200 hover:bg-cyan-100 transition-colors">+ Add Medicine</button>`
);

content = content.replace(
  `<button type="button" onClick={() => setShowDiagnosticModal(true)} className="mt-2 text-sm bg-cyan-50 text-cyan-700 font-bold px-3 py-1 rounded border border-cyan-200">`,
  `<button type="button" onClick={() => setShowDiagnosticModal(true)} className="mt-2 text-sm bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100 transition-colors inline-flex items-center">`
);

content = content.replace(
  `<button type="submit" disabled={saving || !complaint.trim()} className="px-8 py-3 bg-cyan-600 text-white rounded font-bold hover:bg-cyan-700 disabled:opacity-50 shadow-md">
              {saving ? 'Completing...' : 'Complete Consultation'}
            </button>`,
  `<button type="submit" disabled={saving || !complaint.trim()} className="w-full md:w-auto px-8 py-3.5 bg-cyan-600 text-white rounded-md font-bold text-lg hover:bg-cyan-700 disabled:opacity-50 shadow-md transition-all">
              {saving ? 'Completing...' : 'Complete Consultation & Save'}
            </button>`
);

// Form input styling globally
content = content.replace(
  /className="w-full p-2 border rounded"/g,
  `className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"`
);
content = content.replace(
  /className="w-full p-2 border rounded resize-none"/g,
  `className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none"`
);


fs.writeFileSync(file, content);

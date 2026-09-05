const fs = require('fs');
const path = require('path');

const applyDesignSystem = (filePath, transformations) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Apply standard color replacements
  content = content.replace(/bg-blue-50/g, 'bg-cyan-50');
  content = content.replace(/text-blue-700/g, 'text-cyan-700');
  content = content.replace(/border-blue-200/g, 'border-cyan-200');
  content = content.replace(/bg-blue-600/g, 'bg-cyan-600');
  content = content.replace(/text-blue-600/g, 'text-cyan-600');
  
  content = content.replace(/text-gray-800/g, 'text-slate-800');
  content = content.replace(/text-gray-900/g, 'text-slate-900');
  content = content.replace(/text-gray-500/g, 'text-slate-500');
  content = content.replace(/text-gray-600/g, 'text-slate-600');
  content = content.replace(/text-gray-400/g, 'text-slate-400');
  content = content.replace(/text-gray-700/g, 'text-slate-700');

  // Apply custom transformations
  if (transformations) {
    for (const [target, replacement] of transformations) {
      content = content.replace(target, replacement);
    }
  }

  fs.writeFileSync(filePath, content);
};

applyDesignSystem(path.join(__dirname, 'frontend/src/pages/MyNotifications.tsx'), [
  [
    `<div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Notifications</h1>`,
    `<div className="flex justify-between items-start md:items-center flex-col md:flex-row mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-slate-500 mt-2">Updates on your appointments, prescriptions, and health alerts.</p>
        </div>`
  ]
]);

applyDesignSystem(path.join(__dirname, 'frontend/src/pages/TeleconsultationsList.tsx'), [
  [
    `<h1 className="text-2xl font-bold mb-4">Teleconsultations</h1>`,
    `<div className="mb-8"><h1 className="text-3xl font-bold text-slate-900 tracking-tight">Teleconsultations</h1><p className="text-slate-500 mt-2">Join scheduled video consultations with your healthcare providers.</p></div>`
  ],
  [
    /text-indigo-/g, 'text-cyan-'
  ],
  [
    /bg-indigo-/g, 'bg-cyan-'
  ]
]);


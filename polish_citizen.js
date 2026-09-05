const fs = require('fs');
const path = require('path');

const applyDesignSystem = (filePath, transformations) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Apply standard color replacements
  content = content.replace(/border-indigo-600/g, 'border-cyan-500');
  content = content.replace(/text-indigo-600/g, 'text-cyan-600');
  content = content.replace(/text-indigo-700/g, 'text-cyan-700');
  content = content.replace(/bg-indigo-600/g, 'bg-cyan-600');
  content = content.replace(/hover:bg-indigo-700/g, 'hover:bg-cyan-700');
  content = content.replace(/focus:ring-indigo-500/g, 'focus:ring-cyan-500');
  content = content.replace(/focus:border-indigo-500/g, 'focus:border-cyan-500');
  
  content = content.replace(/bg-blue-600/g, 'bg-cyan-600');
  content = content.replace(/hover:bg-blue-700/g, 'hover:bg-cyan-700');
  
  content = content.replace(/text-gray-800/g, 'text-slate-800');
  content = content.replace(/text-gray-900/g, 'text-slate-900');
  content = content.replace(/text-gray-500/g, 'text-slate-500');
  content = content.replace(/text-gray-600/g, 'text-slate-600');
  content = content.replace(/text-gray-700/g, 'text-slate-700');
  content = content.replace(/bg-gray-50/g, 'bg-slate-50');
  content = content.replace(/border-gray-200/g, 'border-slate-200');

  // Apply custom transformations
  if (transformations) {
    for (const [target, replacement] of transformations) {
      content = content.replace(target, replacement);
    }
  }

  fs.writeFileSync(filePath, content);
};

// 1. PatientManage.tsx (Citizen Profile)
applyDesignSystem(path.join(__dirname, 'frontend/src/pages/PatientManage.tsx'), [
  [
    `border-t-4 border-green-600`, 
    `border-t-4 border-cyan-500`
  ],
  [
    `bg-green-600 text-white rounded font-bold hover:bg-green-700`,
    `bg-cyan-600 text-white rounded-md font-semibold shadow-sm hover:bg-cyan-700 transition-colors`
  ],
  [
    `ABHA ID`,
    `Government Health ID (Optional)`
  ],
  [
    `<h1 className="text-2xl font-bold mb-6">{isEditing ? 'Update Patient Profile' : (isCitizen ? 'Complete Patient Profile' : 'Register New Patient')}</h1>`,
    `<div className="mb-6"><h1 className="text-2xl font-bold tracking-tight text-slate-900">{isEditing ? 'Update Profile' : (isCitizen ? 'Complete Patient Profile' : 'Register New Patient')}</h1>
    {isCitizen && !isEditing && <p className="text-slate-500 text-sm mt-1">Please complete your health profile to access clinical services, book appointments, and track your medical history.</p>}</div>`
  ]
]);

// 2. Appointments.tsx
applyDesignSystem(path.join(__dirname, 'frontend/src/pages/Appointments.tsx'), [
  [
    `<h1 className="text-3xl font-bold text-slate-800 mb-6">My Appointments</h1>`,
    `<div className="mb-8"><h1 className="text-3xl font-bold text-slate-900 tracking-tight">Appointments</h1><p className="text-slate-500 mt-2">View and manage your upcoming care.</p></div>`
  ],
  [
    `<Link to="/patients/new" className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">Complete Patient Profile</Link>`,
    `<Link to="/patients/new" className="inline-flex items-center px-5 py-2.5 bg-cyan-600 text-white rounded-md font-semibold hover:bg-cyan-700 transition-colors">Complete Patient Profile &rarr;</Link>`
  ],
  [
    `bg-yellow-50 p-6 rounded border border-yellow-200`,
    `bg-amber-50 p-6 rounded-xl border border-amber-200 shadow-sm`
  ],
  [
    `<div className="p-6 bg-blue-50 border border-blue-200 rounded text-center">`,
    `<div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-sm">`
  ]
]);

// 3. MyReferrals.tsx
applyDesignSystem(path.join(__dirname, 'frontend/src/pages/MyReferrals.tsx'), [
  [
    `<h1 className="text-3xl font-bold mb-6 text-gray-800">My Referrals</h1>`,
    `<div className="mb-8"><h1 className="text-3xl font-bold text-slate-900 tracking-tight">Referrals</h1><p className="text-slate-500 mt-2">Track referrals and specialist care.</p></div>`
  ]
]);

// 4. MyDiagnostics.tsx
applyDesignSystem(path.join(__dirname, 'frontend/src/pages/MyDiagnostics.tsx'), [
  [
    `<h1 className="text-3xl font-bold mb-6 text-gray-800">My Diagnostic Tests</h1>`,
    `<div className="mb-8"><h1 className="text-3xl font-bold text-slate-900 tracking-tight">Diagnostics</h1><p className="text-slate-500 mt-2">Track diagnostic tests and results.</p></div>`
  ]
]);

// 5. PatientDetail.tsx (My Health Info)
applyDesignSystem(path.join(__dirname, 'frontend/src/pages/PatientDetail.tsx'), [
  [
    `border-t-4 border-green-600`,
    `border-t-4 border-cyan-500`
  ]
]);

// 6. Facilities.tsx
applyDesignSystem(path.join(__dirname, 'frontend/src/pages/Facilities.tsx'), [
  [
    `<h1 className="text-3xl font-bold mb-6 text-gray-800">Healthcare Facilities</h1>`,
    `<div className="mb-8"><h1 className="text-3xl font-bold text-slate-900 tracking-tight">Healthcare Facilities</h1><p className="text-slate-500 mt-2">Discover care and find nearby hospitals, clinics, and health centers.</p></div>`
  ]
]);


const fs = require('fs');
const path = require('path');

const pPath = path.join(__dirname, 'frontend', 'src', 'pages', 'PatientDetail.tsx');
let pContent = fs.readFileSync(pPath, 'utf8');

pContent = pContent.replace(
  `ABHA ID: {patient.abhaId || 'Not Linked'}`,
  `Gov Health ID: {patient.abhaId || 'Not Linked'}`
);

pContent = pContent.replace(
  `border-t-4 border-blue-600`,
  `border-t-4 border-cyan-500`
);

pContent = pContent.replace(
  `text-blue-600 hover:underline`,
  `text-slate-500 hover:text-slate-800 hover:underline font-medium`
);

pContent = pContent.replace(
  `<div className="flex justify-between items-center mb-6">`,
  `<div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{isCitizen ? 'Health Information' : 'Patient Profile'}</h1>
        <p className="text-slate-500 mt-2">{isCitizen ? 'Your personal health record and demographics.' : 'View patient demographics and baseline medical info.'}</p>
      </div>
      <div className="flex justify-between items-center mb-6">`
);

fs.writeFileSync(pPath, pContent);

const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/pages/PatientDetail.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<div className="flex justify-between items-center mb-6">
        <Link to={isCitizen ? "/dashboard" : "/patients"} className="text-slate-500 hover:text-slate-800 hover:underline font-medium">&larr; Back</Link>
        <div>
          <Link to={\`/patients/\${id}/edit\`} className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
              Edit Profile
            </Link>
          <Link to={\`/patients/\${id}/records\`} className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 ml-2">
            {isCitizen ? 'My Medical Records' : 'View EHR Timeline'}
          </Link>
          {!isCitizen && (
            <Link to={\`/patients/\${id}/triage\`} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ml-2">
              Run Triage
            </Link>
          )}
        </div>
      </div>`,
  `<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <Link to={isCitizen ? "/dashboard" : "/patients"} className="text-slate-500 hover:text-slate-800 hover:underline font-medium">&larr; Back to Directory</Link>
        <div className="flex flex-wrap gap-2">
          <Link to={\`/patients/\${id}/edit\`} className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-md font-medium hover:bg-slate-200 transition-colors">
              Edit Profile
          </Link>
          <Link to={\`/patients/\${id}/records\`} className="px-4 py-2 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-md font-medium hover:bg-cyan-100 transition-colors">
            {isCitizen ? 'My Medical Records' : 'View EHR Timeline'}
          </Link>
          {!isCitizen && (
            <Link to={\`/patients/\${id}/triage\`} className="px-4 py-2 bg-red-600 text-white rounded-md font-bold shadow-sm hover:bg-red-700 transition-colors">
              Run Triage
            </Link>
          )}
        </div>
      </div>`
);

content = content.replace(
  `<h1 className="text-3xl font-bold text-slate-900 mb-2">{patient.firstName} {patient.lastName}</h1>`,
  `<h1 className="text-3xl font-extrabold text-slate-900 mb-2">{patient.firstName} {patient.lastName}</h1>`
);

fs.writeFileSync(file, content);

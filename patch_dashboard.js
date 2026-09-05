const fs = require('fs');
const path = require('path');

const dashPath = path.join(__dirname, 'frontend', 'src', 'pages', 'Dashboard.tsx');
let content = fs.readFileSync(dashPath, 'utf8');

// Replace standard header with Arogya Connect header
content = content.replace(
  `<h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to SIH Healthcare</h1>`,
  `<h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Arogya Connect</h1>
        <p className="text-slate-500 text-sm mb-4 uppercase tracking-wider font-semibold">Your healthcare at a glance.</p>`
);
content = content.replace(
  `border-indigo-600`,
  `border-cyan-500`
);
content = content.replace(
  `text-indigo-700`,
  `text-cyan-700`
);
content = content.replace(/text-indigo-600/g, `text-cyan-600`);
content = content.replace(/hover:text-indigo-800/g, `hover:text-cyan-700`);

// Now let's add the Citizen-specific section
const citizenSection = `
      {user.role === 'ROLE_CITIZEN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <h3 className="text-slate-500 font-semibold mb-2 uppercase tracking-wide text-xs">My Appointments</h3>
            <p className="text-sm text-slate-600 mb-4">View and manage your upcoming care.</p>
            <Link to="/appointments" className="text-cyan-600 hover:text-cyan-700 font-medium text-sm inline-flex items-center">
              Manage Appointments <span className="ml-1">&rarr;</span>
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <h3 className="text-slate-500 font-semibold mb-2 uppercase tracking-wide text-xs">Health Information</h3>
            <p className="text-sm text-slate-600 mb-4">Your personal health record and timeline.</p>
            <Link to={user.patientId ? \`/patients/\${user.patientId}\` : "/patients/new"} className="text-cyan-600 hover:text-cyan-700 font-medium text-sm inline-flex items-center">
              {user.patientId ? "View Health Record" : "Complete Patient Profile"} <span className="ml-1">&rarr;</span>
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <h3 className="text-slate-500 font-semibold mb-2 uppercase tracking-wide text-xs">Discover Care</h3>
            <p className="text-sm text-slate-600 mb-4">Find nearby facilities and healthcare services.</p>
            <Link to="/facilities" className="text-cyan-600 hover:text-cyan-700 font-medium text-sm inline-flex items-center">
              Search Facilities <span className="ml-1">&rarr;</span>
            </Link>
          </div>
        </div>
      )}
`;

// Insert the citizen section right before the end
content = content.replace(
  `    </div>\n  );\n};\n`,
  `${citizenSection}\n    </div>\n  );\n};\n`
);

fs.writeFileSync(dashPath, content);


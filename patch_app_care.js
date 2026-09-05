const fs = require('fs');
let path = 'frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const importFind = `import { EmergencyDashboard } from './pages/EmergencyDashboard';`;
const importReplace = importFind + `\nimport { CareManagementDashboard } from './pages/CareManagementDashboard';`;
if(!code.includes('CareManagementDashboard')) code = code.replace(importFind, importReplace);

const routeFind = `<Route path="/emergencies" element={<ProtectedRoute><RoleRoute allowedRoles={ALL_STAFF}><EmergencyDashboard /></RoleRoute></ProtectedRoute>} />`;
const routeReplace = routeFind + `\n      <Route path="/care-plans" element={<ProtectedRoute><RoleRoute allowedRoles={ALL_STAFF}><CareManagementDashboard /></RoleRoute></ProtectedRoute>} />`;
if(!code.includes('/care-plans')) code = code.replace(routeFind, routeReplace);

fs.writeFileSync(path, code);

path = 'frontend/src/components/Sidebar.tsx';
code = fs.readFileSync(path, 'utf8');

const linkFind = `<span>Emergencies</span>
          </NavLink>`;

const linkReplace = linkFind + `\n          <NavLink to="/care-plans" className={({isActive}) => \`flex items-center space-x-3 p-3 rounded-xl transition-all \${isActive ? 'bg-pink-500/20 text-pink-400 font-medium' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}\`}>
            <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            <span className="text-pink-500 font-bold">Care Plans</span>
          </NavLink>`;

if(!code.includes('Care Plans')) code = code.replace(linkFind, linkReplace);

fs.writeFileSync(path, code);

const fs = require('fs');
let path = 'frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const importFind = `import { StaffFollowUps } from './pages/StaffFollowUps';`;
const importReplace = importFind + `\nimport { EmergencyDashboard } from './pages/EmergencyDashboard';`;
if(!code.includes('EmergencyDashboard')) code = code.replace(importFind, importReplace);

const routeFind = `<Route path="/follow-ups" element={<ProtectedRoute><RoleRoute allowedRoles={ALL_STAFF}><StaffFollowUps /></RoleRoute></ProtectedRoute>} />`;
const routeReplace = routeFind + `\n      <Route path="/emergencies" element={<ProtectedRoute><RoleRoute allowedRoles={ALL_STAFF}><EmergencyDashboard /></RoleRoute></ProtectedRoute>} />`;
if(!code.includes('/emergencies')) code = code.replace(routeFind, routeReplace);

fs.writeFileSync(path, code);

path = 'frontend/src/components/Sidebar.tsx';
code = fs.readFileSync(path, 'utf8');

const linkFind = `<span>Follow-Ups</span>
          </NavLink>`;

const linkReplace = linkFind + `\n          <NavLink to="/emergencies" className={({isActive}) => \`flex items-center space-x-3 p-3 rounded-xl transition-all \${isActive ? 'bg-red-500/20 text-red-400 font-medium' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}\`}>
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span className="text-red-500 font-bold">Emergencies</span>
          </NavLink>`;

if(!code.includes('Emergencies')) code = code.replace(linkFind, linkReplace);

fs.writeFileSync(path, code);

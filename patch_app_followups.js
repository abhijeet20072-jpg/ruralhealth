const fs = require('fs');
let path = 'frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const importFind = `import { MyNotifications } from './pages/MyNotifications';`;
const importReplace = importFind + `\nimport { StaffFollowUps } from './pages/StaffFollowUps';`;
if(!code.includes('StaffFollowUps')) code = code.replace(importFind, importReplace);

const routeFind = `<Route path="/patients/:id" element={<ProtectedRoute allowedRoles={['ROLE_ASHA', 'ROLE_ANM', 'ROLE_CHO', 'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_CITIZEN']}><PatientDetail /></ProtectedRoute>} />`;
const routeReplace = routeFind + `\n      <Route path="/follow-ups" element={<ProtectedRoute allowedRoles={['ROLE_ASHA', 'ROLE_ANM', 'ROLE_CHO', 'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_FACILITY_ADMIN']}><StaffFollowUps /></ProtectedRoute>} />`;
if(!code.includes('/follow-ups')) code = code.replace(routeFind, routeReplace);

fs.writeFileSync(path, code);

path = 'frontend/src/components/Sidebar.tsx';
code = fs.readFileSync(path, 'utf8');

const linkFind = `          <NavLink to="/facility-queue" className={({isActive}) => \`flex items-center space-x-3 p-3 rounded-xl transition-all \${isActive ? 'bg-cyan-500/20 text-cyan-400 font-medium' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}\`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Facility Queue</span>
          </NavLink>`;

const linkReplace = linkFind + `\n          <NavLink to="/follow-ups" className={({isActive}) => \`flex items-center space-x-3 p-3 rounded-xl transition-all \${isActive ? 'bg-cyan-500/20 text-cyan-400 font-medium' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}\`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Follow-Ups</span>
          </NavLink>`;

if(!code.includes('Follow-Ups')) code = code.replace(linkFind, linkReplace);

fs.writeFileSync(path, code);

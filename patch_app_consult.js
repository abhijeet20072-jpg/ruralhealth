const fs = require('fs');
const path = 'frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const importFind = `import { ReferralDashboard } from './pages/ReferralDashboard';`;
const importReplace = `import { ReferralDashboard } from './pages/ReferralDashboard';\nimport { ConsultationWorkspace } from './pages/ConsultationWorkspace';`;
if(!code.includes('ConsultationWorkspace')) code = code.replace(importFind, importReplace);

const routeFind = `<Route path="/patients/:id/records" element={<ProtectedRoute><MedicalRecords /></ProtectedRoute>} />`;
const routeReplace = `<Route path="/patients/:id/records" element={<ProtectedRoute><MedicalRecords /></ProtectedRoute>} />\n          <Route path="/consultation/:appointmentId" element={<ProtectedRoute><RoleRoute allowedRoles={ALL_STAFF}><ConsultationWorkspace /></RoleRoute></ProtectedRoute>} />`;
if(!code.includes('/consultation/:appointmentId')) code = code.replace(routeFind, routeReplace);

fs.writeFileSync(path, code);

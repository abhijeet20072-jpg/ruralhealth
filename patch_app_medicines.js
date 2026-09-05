const fs = require('fs');
const path = 'frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const importFind = `import { DiagnosticOrders } from './pages/DiagnosticOrders';`;
const importReplace = `import { DiagnosticOrders } from './pages/DiagnosticOrders';\nimport { FacilityMedicines } from './pages/FacilityMedicines';\nimport { MyMedicines } from './pages/MyMedicines';`;
if(!code.includes('FacilityMedicines')) code = code.replace(importFind, importReplace);

const citFind = `<Route path="/citizen/referrals" element={<ProtectedRoute><RoleRoute allowedRoles={['ROLE_CITIZEN']}><MyReferrals /></RoleRoute></ProtectedRoute>} />`;
const citReplace = citFind + `\n          <Route path="/citizen/medicines" element={<ProtectedRoute><RoleRoute allowedRoles={['ROLE_CITIZEN']}><MyMedicines /></RoleRoute></ProtectedRoute>} />`;
if(!code.includes('/citizen/medicines')) code = code.replace(citFind, citReplace);

const staffFind = `<Route path="/diagnostics/orders" element={<ProtectedRoute><RoleRoute allowedRoles={['ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_FACILITY_ADMIN']}><DiagnosticOrders /></RoleRoute></ProtectedRoute>} />`;
const staffReplace = staffFind + `\n          <Route path="/medicines/inventory" element={<ProtectedRoute><RoleRoute allowedRoles={['ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_FACILITY_ADMIN', 'ROLE_DISTRICT_ADMIN', 'ROLE_CHO']}><FacilityMedicines /></RoleRoute></ProtectedRoute>} />`;
if(!code.includes('/medicines/inventory')) code = code.replace(staffFind, staffReplace);

fs.writeFileSync(path, code);

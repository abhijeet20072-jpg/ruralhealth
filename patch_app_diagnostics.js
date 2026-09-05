const fs = require('fs');
const path = 'frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const importFind = `import { MyReferrals } from './pages/MyReferrals';`;
const importReplace = `import { MyReferrals } from './pages/MyReferrals';\nimport { MyDiagnostics } from './pages/MyDiagnostics';\nimport { DiagnosticOrders } from './pages/DiagnosticOrders';`;
if(!code.includes('MyDiagnostics')) code = code.replace(importFind, importReplace);

const myRefFind = `<Route path="/citizen/referrals" element={<ProtectedRoute><RoleRoute allowedRoles={['ROLE_CITIZEN']}><MyReferrals /></RoleRoute></ProtectedRoute>} />`;
const myRefReplace = myRefFind + `\n          <Route path="/citizen/diagnostics" element={<ProtectedRoute><RoleRoute allowedRoles={['ROLE_CITIZEN']}><MyDiagnostics /></RoleRoute></ProtectedRoute>} />`;
if(!code.includes('/citizen/diagnostics')) code = code.replace(myRefFind, myRefReplace);

const diagOrdersFind = `</Routes>`;
const diagOrdersReplace = `  <Route path="/diagnostics/orders" element={<ProtectedRoute><RoleRoute allowedRoles={['ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_FACILITY_ADMIN']}><DiagnosticOrders /></RoleRoute></ProtectedRoute>} />\n        </Routes>`;
if(!code.includes('/diagnostics/orders')) code = code.replace(diagOrdersFind, diagOrdersReplace);

fs.writeFileSync(path, code);

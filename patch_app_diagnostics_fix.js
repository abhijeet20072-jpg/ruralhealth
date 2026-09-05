const fs = require('fs');
const path = 'frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const myRefFind = `<Route path="/my-referrals" element={<ProtectedRoute><RoleRoute allowedRoles={['ROLE_CITIZEN']}><MyReferrals /></RoleRoute></ProtectedRoute>} />`;
const myRefReplace = myRefFind + `\n      <Route path="/my-diagnostics" element={<ProtectedRoute><RoleRoute allowedRoles={['ROLE_CITIZEN']}><MyDiagnostics /></RoleRoute></ProtectedRoute>} />`;
if(!code.includes('/my-diagnostics')) code = code.replace(myRefFind, myRefReplace);

fs.writeFileSync(path, code);

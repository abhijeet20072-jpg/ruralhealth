const fs = require('fs');
const path = 'frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const myDiagFind = `<Route path="/my-diagnostics" element={<ProtectedRoute><RoleRoute allowedRoles={['ROLE_CITIZEN']}><MyDiagnostics /></RoleRoute></ProtectedRoute>} />`;
const myDiagReplace = myDiagFind + `\n      <Route path="/my-medicines" element={<ProtectedRoute><RoleRoute allowedRoles={['ROLE_CITIZEN']}><MyMedicines /></RoleRoute></ProtectedRoute>} />`;
if(!code.includes('/my-medicines')) code = code.replace(myDiagFind, myDiagReplace);

fs.writeFileSync(path, code);

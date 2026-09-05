const fs = require('fs');
let path = 'frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const routeFind = `<Route path="/my-notifications" element={<ProtectedRoute><MyNotifications /></ProtectedRoute>} />`;
const routeReplace = routeFind + `\n      <Route path="/follow-ups" element={<ProtectedRoute><RoleRoute allowedRoles={ALL_STAFF}><StaffFollowUps /></RoleRoute></ProtectedRoute>} />`;
if(!code.includes('/follow-ups')) code = code.replace(routeFind, routeReplace);

fs.writeFileSync(path, code);

const fs = require('fs');
const path = 'frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const importFind = `import { ReferralDashboard } from './pages/ReferralDashboard';`;
const importReplace = `import { ReferralDashboard } from './pages/ReferralDashboard';
import { MyReferrals } from './pages/MyReferrals';`;

if (!code.includes('MyReferrals')) {
    code = code.replace(importFind, importReplace);
}

const routeFind = `<Route path="/referrals" element={<ProtectedRoute><RoleRoute allowedRoles={ALL_STAFF}><ReferralDashboard /></RoleRoute></ProtectedRoute>} />`;
const routeReplace = `<Route path="/referrals" element={<ProtectedRoute><RoleRoute allowedRoles={ALL_STAFF}><ReferralDashboard /></RoleRoute></ProtectedRoute>} />
          <Route path="/my-referrals" element={<ProtectedRoute><RoleRoute allowedRoles={['ROLE_CITIZEN']}><MyReferrals /></RoleRoute></ProtectedRoute>} />`;

if (!code.includes('/my-referrals')) {
    code = code.replace(routeFind, routeReplace);
}

fs.writeFileSync(path, code);

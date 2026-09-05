const fs = require('fs');
const path = 'frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const importFind = `import { MyMedicines } from './pages/MyMedicines';`;
const importReplace = importFind + `\nimport { MyNotifications } from './pages/MyNotifications';`;
if(!code.includes('MyNotifications')) code = code.replace(importFind, importReplace);

// Notifications is accessible by everyone. So we can add it to ProtectedRoute directly.
const dashFind = `<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />`;
const dashReplace = dashFind + `\n      <Route path="/my-notifications" element={<ProtectedRoute><MyNotifications /></ProtectedRoute>} />`;
if(!code.includes('/my-notifications')) code = code.replace(dashFind, dashReplace);

fs.writeFileSync(path, code);

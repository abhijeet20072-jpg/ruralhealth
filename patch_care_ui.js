const fs = require('fs');
let path = 'frontend/src/pages/CareManagementDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync(path, code);

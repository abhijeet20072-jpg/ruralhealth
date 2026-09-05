const fs = require('fs');

let path = 'frontend/src/pages/EmergencyDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync(path, code);

path = 'frontend/src/pages/Triage.tsx';
code = fs.readFileSync(path, 'utf8');
code = code.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync(path, code);


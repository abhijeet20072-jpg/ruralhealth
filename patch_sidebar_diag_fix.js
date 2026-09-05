const fs = require('fs');
const path = 'frontend/src/components/Sidebar.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace('to="/citizen/diagnostics"', 'to="/my-diagnostics"');

fs.writeFileSync(path, code);

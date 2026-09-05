const fs = require('fs');
const path = 'frontend/src/pages/DiagnosticOrders.tsx';
let code = fs.readFileSync(path, 'utf8');
code = code.replace("import { useAuth } from '../context/AuthContext';", "");
fs.writeFileSync(path, code);

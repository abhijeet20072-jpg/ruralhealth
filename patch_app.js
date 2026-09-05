const fs = require('fs');
const path = 'frontend/src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("const ALL_ROLES = ['ROLE_CITIZEN', 'ROLE_ASHA', 'ROLE_ANM', 'ROLE_CHO', 'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_FACILITY_ADMIN', 'ROLE_DISTRICT_ADMIN'];\n", "");
code = code.replace("const DISTRICT_ADMIN = ['ROLE_DISTRICT_ADMIN'];\n", "");

fs.writeFileSync(path, code);

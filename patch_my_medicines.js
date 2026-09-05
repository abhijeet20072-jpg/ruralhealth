const fs = require('fs');
const path = 'frontend/src/pages/MyMedicines.tsx';
let code = fs.readFileSync(path, 'utf8');
code = code.replace("api.get('/auth/me').then(async (me) => {", "api.get('/auth/me').then(async () => {");
fs.writeFileSync(path, code);

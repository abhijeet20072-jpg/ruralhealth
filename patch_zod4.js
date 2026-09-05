const fs = require('fs');
const path = 'backend/src/patient.controller.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/details: err.errors/g, "details: err.errors, message: err.message");

fs.writeFileSync(path, code);

const fs = require('fs');
const path = 'backend/src/patient.controller.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("if (err.name === 'ZodError') {", "console.log('CATCH BLOCK HIT', err); if (err.name === 'ZodError') {");

fs.writeFileSync(path, code);

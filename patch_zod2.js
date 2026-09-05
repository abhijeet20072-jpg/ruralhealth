const fs = require('fs');
const path = 'backend/src/patient.controller.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/err instanceof z.ZodError/g, "err.name === 'ZodError'");

fs.writeFileSync(path, code);
console.log("Patched patient zod condition");

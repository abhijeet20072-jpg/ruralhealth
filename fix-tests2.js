const fs = require('fs');
let code = fs.readFileSync('backend/src/teleconsultation.test.ts', 'utf8');
code = code.replace(/\\`/g, '`');
fs.writeFileSync('backend/src/teleconsultation.test.ts', code);

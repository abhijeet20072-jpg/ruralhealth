const fs = require('fs');
let code = fs.readFileSync('backend/src/sync.test.ts', 'utf8');
code = code.replace(/\\\$/g, '$');
fs.writeFileSync('backend/src/sync.test.ts', code);

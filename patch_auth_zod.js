const fs = require('fs');
let path = 'backend/src/auth.controller.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/err\.errors\[0\]/g, 'err.issues[0]');

fs.writeFileSync(path, code);

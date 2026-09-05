const fs = require('fs');
const path = 'backend/src/diagnostic.controller.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("if (!facilityId) return;", "if (!facilityId) { res.status(403).json({ error: 'No facility assigned' }); return; }");

fs.writeFileSync(path, code);

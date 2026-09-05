const fs = require('fs');
const path = 'backend/src/appointment.controller.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("} else {\\n        res.status(500).json({ error: 'Internal server error' });\\n      }", "} else {\\n        console.error('SERVER ERROR:', err); res.status(500).json({ error: 'Internal server error' });\\n      }");
fs.writeFileSync(path, code);

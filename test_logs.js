const fs = require('fs');
let path = 'backend/src/emergency.controller.ts';
let code = fs.readFileSync(path, 'utf8');
code = code.replace("} else {\\n      res.status(500).json({ error: 'Internal server error' });", "} else {\\n      console.error(err); res.status(500).json({ error: 'Internal server error' });");
fs.writeFileSync(path, code);

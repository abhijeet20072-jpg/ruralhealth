const fs = require('fs');
let code = fs.readFileSync('frontend/public/sw.js', 'utf8');
code = code.replace(/sih-healthcare-v1/g, 'sih-healthcare-v2');
fs.writeFileSync('frontend/public/sw.js', code);

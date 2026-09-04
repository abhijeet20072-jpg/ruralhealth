const fs = require('fs');
let code = fs.readFileSync('backend/src/sync.test.ts', 'utf8');
code = code.replace(/expect\(res\.body\.results\[0\]\.status\)\.toBe\('SUCCESS'\);/g, `if (res.body.results[0].status !== 'SUCCESS') console.log(res.body.results[0]); expect(res.body.results[0].status).toBe('SUCCESS');`);
fs.writeFileSync('backend/src/sync.test.ts', code);

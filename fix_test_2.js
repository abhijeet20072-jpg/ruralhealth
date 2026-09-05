const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'backend', 'src', 'rbac_01.test.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace("expect(res.body.patient).toBeDefined();", "expect(res.body.timeline).toBeDefined();");
content = content.replace("post('/api/emergency/declare')", "post('/api/emergency')");

fs.writeFileSync(file, content);

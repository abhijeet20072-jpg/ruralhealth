const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'backend', 'src', 'rbac_01.test.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace("let aptId_A = '';\n});", "});");
content = content.replace("let patientBId = '';", "let patientBId = '';\nlet aptId_A = '';");

fs.writeFileSync(file, content);

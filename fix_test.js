const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'backend', 'src', 'rbac_01.test.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace("phoneNumber: '1111111111'", "phoneNumber: '9876543210'");
content = content.replace("phoneNumber: '2222222222'", "phoneNumber: '9876543211'");

fs.writeFileSync(file, content);

const fs = require('fs');
const path = 'backend/src/citizen_journey.test.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("console.log('AssignRes', assignRes.body);", "console.log('AssignRes', assignRes.status, assignRes.body);");

fs.writeFileSync(path, code);

const fs = require('fs');
const path = 'backend/src/citizen_journey.test.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("console.log('AssignRes', assignRes.status, assignRes.body);", "");
code = code.replace("console.log('PatRes', res.body);", "");
code = code.replace("console.log('FacRes', res.body);", "");
code = code.replace("if(res.status !== 201) console.log('BookRes', res.body); expect(res.status).toBe(201);", "expect(res.status).toBe(201);");

fs.writeFileSync(path, code);

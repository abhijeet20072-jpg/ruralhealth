const fs = require('fs');
const path = 'backend/src/patient_workflow.test.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("if (res.status !== 201) console.log(res.body); expect(res.status).toBe(201);", "if (res.status !== 201) console.log(JSON.stringify(res.body, null, 2)); expect(res.status).toBe(201);");
fs.writeFileSync(path, code);

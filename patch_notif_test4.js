const fs = require('fs');
let path = 'backend/src/notification_journey.test.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("expect(res.status).toBe(201);", "if(res.status !== 201) console.log(res.body); expect(res.status).toBe(201);");

fs.writeFileSync(path, code);

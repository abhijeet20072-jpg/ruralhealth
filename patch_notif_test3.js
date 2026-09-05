const fs = require('fs');
let path = 'backend/src/notification_journey.test.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("doctorId: null, date: '2026-10-10', timeSlot: '10:00 AM'", "date: '2026-10-10', timeSlot: '10:00'");
code = code.replace("if(res.status !== 201) console.log(res.body); expect(res.status).toBe(201);", "expect(res.status).toBe(201);");

fs.writeFileSync(path, code);

const fs = require('fs');
let path = 'backend/src/notification_journey.test.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("date: '2026-10-10', timeSlot: '10:00'", "doctorId: docAId, date: '2026-10-10', timeSlot: '10:00'");
code = code.replace("let facilityBId = '';", "let facilityBId = '';\nlet docAId = '';");
code = code.replace("const docAId = ", "docAId = ");

fs.writeFileSync(path, code);

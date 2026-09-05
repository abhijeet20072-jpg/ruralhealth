const fs = require('fs');
let path = 'backend/src/care_management.controller.ts';
let code = fs.readFileSync(path, 'utf8');

const findInsert = "INSERT INTO follow_ups (id, patientId, facilityId, reason, dueDate, status)\\n          VALUES (?, ?, ?, ?, ?, 'PENDING')";
const replaceInsert = "INSERT INTO follow_ups (id, patientId, createdByUserId, facilityId, reason, dueDate, status)\\n          VALUES (?, ?, ?, ?, ?, ?, 'PENDING')";

code = code.replace(findInsert, replaceInsert);

const findRun = "run(crypto.randomUUID(), parsed.patientId, facilityId, `Care Plan Follow-up: ${parsed.condition}`, d.toISOString());";
const replaceRun = "run(crypto.randomUUID(), parsed.patientId, req.user!.id, facilityId, `Care Plan Follow-up: ${parsed.condition}`, d.toISOString());";

code = code.replace(findRun, replaceRun);

fs.writeFileSync(path, code);

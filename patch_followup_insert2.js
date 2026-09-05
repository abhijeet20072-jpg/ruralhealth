const fs = require('fs');
let path = 'backend/src/care_management.controller.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "INSERT INTO follow_ups (id, patientId, facilityId, reason, dueDate, status)",
  "INSERT INTO follow_ups (id, patientId, createdByUserId, facilityId, reason, dueDate, status)"
);

code = code.replace(
  "VALUES (?, ?, ?, ?, ?, 'PENDING')",
  "VALUES (?, ?, ?, ?, ?, ?, 'PENDING')"
);

fs.writeFileSync(path, code);

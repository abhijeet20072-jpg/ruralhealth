const fs = require('fs');
let path = 'backend/src/emergency.controller.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "INSERT INTO referrals (id, patientId, originatingFacilityId, destinationFacilityId, reason, priority)",
  "INSERT INTO referrals (id, patientId, referringFacilityId, receivingFacilityId, referringDoctorId, reason, priority)"
);

code = code.replace(
  "VALUES (?, ?, ?, ?, ?, 'URGENT')",
  "VALUES (?, ?, ?, ?, ?, ?, 'URGENT')"
);

fs.writeFileSync(path, code);

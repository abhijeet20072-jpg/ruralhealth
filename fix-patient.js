const fs = require('fs');
let code = fs.readFileSync('backend/src/patient.controller.ts', 'utf8');

code = code.replace(
  /\(id, abhaId, firstName, lastName, dateOfBirth, gender, phoneNumber, address, emergencyContactName, emergencyContactPhone, bloodGroup, allergies, userId\)/g,
  "(id, abhaId, firstName, lastName, dateOfBirth, gender, phoneNumber, address, emergencyContactName, emergencyContactPhone, bloodGroup, allergies, userId)"
);

code = code.replace(
  /parsed.emergencyContactPhone \|\| null, parsed.bloodGroup \|\| null, JSON.stringify\(parsed.allergies\)/g,
  'parsed.emergencyContactPhone || null, parsed.bloodGroup || null, JSON.stringify(parsed.allergies), req.user.role === "ROLE_CITIZEN" ? req.user.id : null'
);

fs.writeFileSync('backend/src/patient.controller.ts', code);

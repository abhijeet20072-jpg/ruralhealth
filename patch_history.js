const fs = require('fs');
const path = 'backend/src/appointment.controller.ts';
let code = fs.readFileSync(path, 'utf8');

const toFind = `const patientId = req.params.patientId;`;
const toReplace = `const patientId = req.params.patientId;

    if (req.user.role === 'ROLE_CITIZEN') {
      const citizenPatientRecord = db.prepare('SELECT id FROM patients WHERE userId = ?').get(req.user.id);
      if (!citizenPatientRecord || citizenPatientRecord.id !== patientId) {
        res.status(403).json({ error: 'Unauthorized to access this patient history' });
        return;
      }
    }
`;

if (code.includes(toFind)) {
  code = code.replace(toFind, toReplace);
  fs.writeFileSync(path, code);
  console.log("Patched getPatientHistory successfully.");
} else {
  console.log("Failed to patch");
}

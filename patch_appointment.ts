import fs from 'fs';
const path = 'backend/src/appointment.controller.ts';
let code = fs.readFileSync(path, 'utf8');

// The logic to patch:
// Find: const parsed = appointmentSchema.parse(req.body);
// Add authorization check below it.

const toFind = `const parsed = appointmentSchema.parse(req.body);`;
const toReplace = `const parsed = appointmentSchema.parse(req.body);

    // SECURITY: Citizens can only book for themselves. Staff can book for any patient.
    if (req.user!.role === 'ROLE_CITIZEN') {
      const citizenPatientRecord = db.prepare('SELECT id FROM patients WHERE userId = ?').get(req.user!.id) as any;
      if (!citizenPatientRecord) {
        res.status(403).json({ error: 'You must complete your patient profile before booking.' });
        return;
      }
      if (parsed.patientId !== citizenPatientRecord.id) {
        res.status(403).json({ error: 'You are not authorized to book for another patient.' });
        return;
      }
    }
`;

if (code.includes(toFind)) {
  code = code.replace(toFind, toReplace);
  fs.writeFileSync(path, code);
  console.log("Patched appointment.controller.ts successfully.");
} else {
  console.log("Failed to patch appointment.controller.ts");
}

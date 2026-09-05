const fs = require('fs');
const path = 'backend/src/appointment.controller.ts';
let code = fs.readFileSync(path, 'utf8');

const toFind = `const id = req.params.id;
    const result = db.prepare(\`UPDATE appointments SET status = 'CANCELLED', updatedAt = CURRENT_TIMESTAMP WHERE id = ?\`).run(id);`;
const toReplace = `const id = req.params.id;
    
    // Check ownership
    const apt = db.prepare('SELECT patientId FROM appointments WHERE id = ?').get(id);
    if (!apt) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }
    
    if (req.user.role === 'ROLE_CITIZEN') {
      const citizenPatientRecord = db.prepare('SELECT id FROM patients WHERE userId = ?').get(req.user.id);
      if (!citizenPatientRecord || citizenPatientRecord.id !== apt.patientId) {
        res.status(403).json({ error: 'Unauthorized to cancel this appointment' });
        return;
      }
    }

    const result = db.prepare(\`UPDATE appointments SET status = 'CANCELLED', updatedAt = CURRENT_TIMESTAMP WHERE id = ?\`).run(id);`;

if (code.includes(toFind)) {
  code = code.replace(toFind, toReplace);
  fs.writeFileSync(path, code);
  console.log("Patched cancelAppointment successfully.");
} else {
  console.log("Failed to patch cancelAppointment");
}

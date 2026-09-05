const fs = require('fs');
const path = 'backend/src/appointment.controller.ts';
let code = fs.readFileSync(path, 'utf8');

const importStr = `import { createNotification } from './notification.service';`;
if (!code.includes(importStr)) {
  code = code.replace("import { logAudit } from './audit';", "import { logAudit } from './audit';\n" + importStr);
}

// Book appointment
const bookFind = `res.status(201).json({ appointmentId: id });`;
const bookReplace = `
      // Notify Patient
      const ptUser = db.prepare('SELECT userId FROM patients WHERE id = ?').get(parsed.patientId) as any;
      if (ptUser && ptUser.userId) {
        createNotification({
          recipientUserId: ptUser.userId,
          type: 'APPOINTMENT_CONFIRMED',
          title: 'Appointment Confirmed',
          message: \`Your appointment for \${parsed.date} at \${parsed.timeSlot} is confirmed.\`,
          relatedEntityType: 'APPOINTMENT',
          relatedEntityId: id
        });
      }
      ` + bookFind;
if (!code.includes("APPOINTMENT_CONFIRMED")) {
  code = code.replace(bookFind, bookReplace);
}

// Update appointment (CANCELLATION)
const updateFind = `res.json({ message: 'Appointment updated successfully' });`;
const updateReplace = `
      if (parsed.status === 'CANCELLED') {
        const pt = db.prepare('SELECT p.userId FROM appointments a JOIN patients p ON a.patientId = p.id WHERE a.id = ?').get(id) as any;
        if (pt && pt.userId) {
          createNotification({
            recipientUserId: pt.userId,
            type: 'APPOINTMENT_CANCELLED',
            title: 'Appointment Cancelled',
            message: 'Your appointment has been cancelled.',
            relatedEntityType: 'APPOINTMENT',
            relatedEntityId: id,
            priority: 'HIGH'
          });
        }
      }
      ` + updateFind;
if (!code.includes("APPOINTMENT_CANCELLED")) {
  code = code.replace(updateFind, updateReplace);
}

fs.writeFileSync(path, code);

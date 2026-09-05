const fs = require('fs');
const path = 'backend/src/appointment.controller.ts';
let code = fs.readFileSync(path, 'utf8');

const bookFind = `res.status(201).json({ message: 'Appointment booked', appointmentId: result.id, tokenNumber: result.tokenNumber });`;
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
          relatedEntityId: result.id
        }, false);
      }
      ` + bookFind;

if (!code.includes("APPOINTMENT_CONFIRMED")) {
  code = code.replace(bookFind, bookReplace);
}

// CANCELLATION
const cancelFind = `res.json({ message: 'Appointment cancelled successfully' });`;
const cancelReplace = `
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
      }, false);
    }
    ` + cancelFind;
if (!code.includes("APPOINTMENT_CANCELLED")) {
  code = code.replace(cancelFind, cancelReplace);
}

fs.writeFileSync(path, code);

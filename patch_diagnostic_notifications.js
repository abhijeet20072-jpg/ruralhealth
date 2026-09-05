const fs = require('fs');
const path = 'backend/src/diagnostic.controller.ts';
let code = fs.readFileSync(path, 'utf8');

const importStr = `import { createNotification } from './notification.service';`;
if (!code.includes(importStr)) {
  code = code.replace("import { logAudit } from './audit';", "import { logAudit } from './audit';\n" + importStr);
}

// Result Ready (in updateStatus)
// Wait, result is submitted in `recordResult` which then sets status to RESULT_READY
const rrFind = `logAudit(req.user!.id, 'DIAGNOSTIC_RECORDED', order.patientId, { orderId: id });`;
const rrReplace = rrFind + `
      
      // Notify ordering doctor/facility
      const doc = db.prepare('SELECT orderingDoctorId, patientId FROM diagnostic_orders WHERE id = ?').get(id) as any;
      if (doc && doc.orderingDoctorId) {
        createNotification({
          recipientUserId: doc.orderingDoctorId,
          type: 'DIAGNOSTIC_READY',
          title: 'Diagnostic Result Ready',
          message: 'A diagnostic result is ready for your review.',
          relatedEntityType: 'DIAGNOSTIC_ORDER',
          relatedEntityId: id,
          priority: 'HIGH'
        });
      }
      
      const ptUser = db.prepare('SELECT userId FROM patients WHERE id = ?').get(order.patientId) as any;
      if (ptUser && ptUser.userId) {
        createNotification({
          recipientUserId: ptUser.userId,
          type: 'DIAGNOSTIC_READY',
          title: 'Lab Result Ready',
          message: 'Your diagnostic test result is ready.',
          relatedEntityType: 'DIAGNOSTIC_ORDER',
          relatedEntityId: id
        });
      }
`;
if (!code.includes("DIAGNOSTIC_READY")) {
  code = code.replace(rrFind, rrReplace);
}

// Review Result (in reviewResult)
const revFind = `logAudit(req.user!.id, 'DIAGNOSTIC_REVIEWED', order.patientId, { orderId: id });`;
const revReplace = revFind + `
      
      const ptUser2 = db.prepare('SELECT userId FROM patients WHERE id = ?').get(order.patientId) as any;
      if (ptUser2 && ptUser2.userId) {
        createNotification({
          recipientUserId: ptUser2.userId,
          type: 'DIAGNOSTIC_REVIEWED',
          title: 'Doctor Reviewed Lab Result',
          message: 'Your doctor has reviewed your diagnostic result and updated your clinical record.',
          relatedEntityType: 'DIAGNOSTIC_ORDER',
          relatedEntityId: id
        });
      }
`;
if (!code.includes("DIAGNOSTIC_REVIEWED")) {
  code = code.replace(revFind, revReplace);
}

fs.writeFileSync(path, code);

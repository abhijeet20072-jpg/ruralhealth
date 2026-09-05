const fs = require('fs');
const path = 'backend/src/referral.controller.ts';
let code = fs.readFileSync(path, 'utf8');

const importStr = `import { createNotification } from './notification.service';`;
if (!code.includes(importStr)) {
  code = code.replace("import { logAudit } from './audit';", "import { logAudit } from './audit';\n" + importStr);
}

// Create Referral
const createFind = `logAudit(req.user!.id, 'REFERRAL_CREATED', parsed.patientId, { referralId: id, destinationFacilityId: parsed.destinationFacilityId });`;
const createReplace = createFind + `
      
      const ptUser = db.prepare('SELECT userId FROM patients WHERE id = ?').get(parsed.patientId) as any;
      if (ptUser && ptUser.userId) {
        createNotification({
          recipientUserId: ptUser.userId,
          type: 'REFERRAL_CREATED',
          title: 'New Referral',
          message: 'Your doctor has issued a new referral.',
          relatedEntityType: 'REFERRAL',
          relatedEntityId: id
        });
      }
`;
if (!code.includes("REFERRAL_CREATED")) {
  code = code.replace(createFind, createReplace);
}

// Update Status
const updateFind = `logAudit(req.user!.id, 'REFERRAL_STATUS_UPDATED', referral.patientId, { referralId: id, status: parsed.status });`;
const updateReplace = updateFind + `
      
      if (parsed.status === 'ACCEPTED') {
        const ptUser = db.prepare('SELECT userId FROM patients WHERE id = ?').get(referral.patientId) as any;
        if (ptUser && ptUser.userId) {
          createNotification({
            recipientUserId: ptUser.userId,
            type: 'REFERRAL_ACCEPTED',
            title: 'Referral Accepted',
            message: 'Your referral has been accepted by the destination facility.',
            relatedEntityType: 'REFERRAL',
            relatedEntityId: id
          });
        }
      }
`;
if (!code.includes("REFERRAL_ACCEPTED")) {
  code = code.replace(updateFind, updateReplace);
}

fs.writeFileSync(path, code);

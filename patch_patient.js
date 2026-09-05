const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'backend', 'src', 'patient.controller.ts');
let content = fs.readFileSync(file, 'utf8');

const target = `    const isCitizen = req.user!.role === 'ROLE_CITIZEN';

    db.prepare(\``;

const replacement = `    const isCitizen = req.user!.role === 'ROLE_CITIZEN';

    if (isCitizen) {
      const existingProfile = db.prepare('SELECT id FROM patients WHERE userId = ?').get(userId);
      if (existingProfile) {
        res.status(409).json({ error: 'You already have a patient profile linked to this account.' });
        return;
      }
    }

    db.prepare(\``;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);

const fs = require('fs');

const files = [
  'backend/src/appointment.controller.ts',
  'backend/src/diagnostic.controller.ts',
  'backend/src/referral.controller.ts'
];

for (const p of files) {
  let code = fs.readFileSync(p, 'utf8');
  if (!code.includes("import { createNotification } from './notification.service';")) {
    code = code.replace("import { db } from './db';", "import { db } from './db';\nimport { createNotification } from './notification.service';");
    fs.writeFileSync(p, code);
  }
}

const fs = require('fs');
const path = 'backend/src/index.ts';
let code = fs.readFileSync(path, 'utf8');

const importFind = `import referralRoutes from './referral.routes';`;
const importReplace = `import referralRoutes from './referral.routes';\nimport consultationRoutes from './consultation.routes';`;
if(!code.includes('consultationRoutes')) code = code.replace(importFind, importReplace);

const useFind = `app.use('/api/referrals', referralRoutes);`;
const useReplace = `app.use('/api/referrals', referralRoutes);\napp.use('/api/consultation', consultationRoutes);`;
if(!code.includes('/api/consultation')) code = code.replace(useFind, useReplace);

fs.writeFileSync(path, code);

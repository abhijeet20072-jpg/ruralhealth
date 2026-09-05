const fs = require('fs');
const path = 'backend/src/index.ts';
let code = fs.readFileSync(path, 'utf8');

const importFind = `import notificationRoutes from './notification.routes';`;
const importReplace = `import notificationRoutes from './notification.routes';\nimport emergencyRoutes from './emergency.routes';`;
if(!code.includes('emergencyRoutes')) code = code.replace(importFind, importReplace);

const useFind = `app.use('/api/notifications', notificationRoutes);`;
const useReplace = `app.use('/api/notifications', notificationRoutes);\napp.use('/api/emergencies', emergencyRoutes);`;
if(!code.includes('/api/emergencies')) code = code.replace(useFind, useReplace);

fs.writeFileSync(path, code);

const fs = require('fs');
const path = 'backend/src/index.ts';
let code = fs.readFileSync(path, 'utf8');

const importFind = `import medicineRoutes from './medicine.routes';`;
const importReplace = `import medicineRoutes from './medicine.routes';\nimport notificationRoutes from './notification.routes';`;
if(!code.includes('notificationRoutes')) code = code.replace(importFind, importReplace);

const useFind = `app.use('/api/medicines', medicineRoutes);`;
const useReplace = `app.use('/api/medicines', medicineRoutes);\napp.use('/api/notifications', notificationRoutes);`;
if(!code.includes('/api/notifications')) code = code.replace(useFind, useReplace);

fs.writeFileSync(path, code);

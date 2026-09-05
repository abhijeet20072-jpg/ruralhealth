const fs = require('fs');
const path = 'backend/src/index.ts';
let code = fs.readFileSync(path, 'utf8');

const importFind = `import emergencyRoutes from './emergency.routes';`;
const importReplace = `import emergencyRoutes from './emergency.routes';\nimport careManagementRoutes from './care_management.routes';`;
if(!code.includes('careManagementRoutes')) code = code.replace(importFind, importReplace);

const useFind = `app.use('/api/emergencies', emergencyRoutes);`;
const useReplace = `app.use('/api/emergencies', emergencyRoutes);\napp.use('/api/care-plans', careManagementRoutes);`;
if(!code.includes('/api/care-plans')) code = code.replace(useFind, useReplace);

fs.writeFileSync(path, code);

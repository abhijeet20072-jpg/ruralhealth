const fs = require('fs');

let ctx = fs.readFileSync('frontend/src/context/ConnectivityContext.tsx', 'utf8');
ctx = ctx.replace(
  `import { getPendingOperations, addSyncOperation, SyncOperation } from '../services/db';`,
  `import { getPendingOperations, addSyncOperation } from '../services/db';\nimport type { SyncOperation } from '../services/db';`
);
fs.writeFileSync('frontend/src/context/ConnectivityContext.tsx', ctx);

let dbCode = fs.readFileSync('frontend/src/services/db.ts', 'utf8');
dbCode = dbCode.replace(
  `import { openDB, DBSchema, IDBPDatabase } from 'idb';`,
  `import { openDB } from 'idb';\nimport type { DBSchema, IDBPDatabase } from 'idb';`
);
fs.writeFileSync('frontend/src/services/db.ts', dbCode);

let medCode = fs.readFileSync('frontend/src/pages/MedicalRecords.tsx', 'utf8');
medCode = medCode.replace(
  `const { user } = useAuth();`,
  `// const { user } = useAuth();`
);
fs.writeFileSync('frontend/src/pages/MedicalRecords.tsx', medCode);

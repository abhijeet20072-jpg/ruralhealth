const Database = require('better-sqlite3');
const db = new Database('./backend/dev.db');
console.log(db.prepare('PRAGMA table_info(patients)').all());

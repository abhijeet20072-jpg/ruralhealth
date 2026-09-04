const fs = require('fs');
let code = fs.readFileSync('backend/src/db.ts', 'utf8');

if (!code.includes('processed_operations')) {
  code = code.replace(
    'CREATE TABLE IF NOT EXISTS audit_logs (',
    `CREATE TABLE IF NOT EXISTS processed_operations (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    entityType TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS audit_logs (`
  );
  fs.writeFileSync('backend/src/db.ts', code);
}

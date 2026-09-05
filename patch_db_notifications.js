const fs = require('fs');
const path = 'backend/src/db.ts';
let code = fs.readFileSync(path, 'utf8');

const newTables = `
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    recipientUserId TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    relatedEntityType TEXT,
    relatedEntityId TEXT,
    priority TEXT NOT NULL DEFAULT 'NORMAL',
    readAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipientUserId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS follow_ups (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    createdByUserId TEXT NOT NULL,
    facilityId TEXT NOT NULL,
    relatedEntityType TEXT,
    relatedEntityId TEXT,
    reason TEXT NOT NULL,
    dueDate DATETIME NOT NULL,
    priority TEXT NOT NULL DEFAULT 'NORMAL',
    status TEXT NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    completedAt DATETIME,
    completedByUserId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (createdByUserId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (facilityId) REFERENCES facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (completedByUserId) REFERENCES users(id) ON DELETE SET NULL
  );
  
  CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipientUserId);
  CREATE INDEX IF NOT EXISTS idx_followups_patient ON follow_ups(patientId);
  CREATE INDEX IF NOT EXISTS idx_followups_facility ON follow_ups(facilityId);
  CREATE INDEX IF NOT EXISTS idx_followups_status ON follow_ups(status);
`;

const insertIndex = code.indexOf("CREATE TABLE IF NOT EXISTS medicine_catalog");
code = code.substring(0, insertIndex) + newTables + code.substring(insertIndex);

fs.writeFileSync(path, code);

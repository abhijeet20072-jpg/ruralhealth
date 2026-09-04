import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.NODE_ENV === 'test' 
  ? path.resolve(__dirname, '../test.db')
  : path.resolve(__dirname, '../dev.db');

export const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'ROLE_CITIZEN',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

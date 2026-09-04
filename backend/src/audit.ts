import { db } from './db';
import crypto from 'crypto';

export const logAudit = (userId: string, action: string, resourceId?: string, details?: any) => {
  try {
    const id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO audit_logs (id, userId, action, resourceId, details)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userId, action, resourceId || null, details ? JSON.stringify(details) : null);
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};

import { Response } from 'express';
import { z } from 'zod';
import { db } from './db';
import crypto from 'crypto';
import { AuthRequest } from './auth.middleware';
import { createNotification } from './notification.service';
import { logAudit } from './audit';

// --- NOTIFICATIONS ---

export const getUserNotifications = (req: AuthRequest, res: Response): void => {
  try {
    const notifications = db.prepare(`
      SELECT * FROM notifications 
      WHERE recipientUserId = ? 
      ORDER BY createdAt DESC 
      LIMIT 100
    `).all(req.user!.id);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
};

export const getUnreadCount = (req: AuthRequest, res: Response): void => {
  try {
    const count = (db.prepare(`
      SELECT count(*) as count FROM notifications 
      WHERE recipientUserId = ? AND readAt IS NULL
    `).get(req.user!.id) as any).count;
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
};

export const markAsRead = (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    // Enforce IDOR protection: only update if it belongs to req.user
    const result = db.prepare(`
      UPDATE notifications SET readAt = CURRENT_TIMESTAMP 
      WHERE id = ? AND recipientUserId = ? AND readAt IS NULL
    `).run(id, req.user!.id);
    
    if (result.changes === 0) {
      res.status(404).json({ error: 'Notification not found or already read' }); return;
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
};

export const markAllAsRead = (req: AuthRequest, res: Response): void => {
  try {
    db.prepare(`
      UPDATE notifications SET readAt = CURRENT_TIMESTAMP 
      WHERE recipientUserId = ? AND readAt IS NULL
    `).run(req.user!.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
};

// --- FOLLOW-UPS ---

const followUpSchema = z.object({
  patientId: z.string().min(1),
  reason: z.string().min(1),
  dueDate: z.string().min(1),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.string().optional(),
  notes: z.string().optional()
});

export const createFollowUp = (req: AuthRequest, res: Response): void => {
  try {
    const facilityId = req.user!.facilityId;
    if (!facilityId) {
      res.status(403).json({ error: 'No facility assigned' }); return;
    }
    
    const parsed = followUpSchema.parse(req.body);

    // Authorization: Does the patient exist? (We allow cross-facility if they search by ID, but realistically the patient should exist)
    const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(parsed.patientId);
    if (!patient) {
      res.status(404).json({ error: 'Patient not found' }); return;
    }

    const id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO follow_ups (id, patientId, createdByUserId, facilityId, relatedEntityType, relatedEntityId, reason, dueDate, priority, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, parsed.patientId, req.user!.id, facilityId,
      parsed.relatedEntityType || null, parsed.relatedEntityId || null,
      parsed.reason, parsed.dueDate, parsed.priority, parsed.notes || null
    );

    logAudit(req.user!.id, 'FOLLOW_UP_CREATED', parsed.patientId, { followUpId: id });
    res.status(201).json({ followUpId: id });
  } catch (err: any) {
    res.status(400).json({ error: 'Invalid request', details: err.issues });
  }
};

export const getFacilityFollowUps = (req: AuthRequest, res: Response): void => {
  try {
    const facilityId = req.user!.facilityId;
    if (!facilityId) {
      res.status(403).json({ error: 'No facility assigned' }); return;
    }

    const followUps = db.prepare(`
      SELECT f.*, p.firstName, p.lastName, u.username as createdByName 
      FROM follow_ups f
      JOIN patients p ON f.patientId = p.id
      JOIN users u ON f.createdByUserId = u.id
      WHERE f.facilityId = ? 
      ORDER BY 
        CASE status WHEN 'PENDING' THEN 1 WHEN 'DUE' THEN 2 WHEN 'OVERDUE' THEN 3 ELSE 4 END, 
        f.dueDate ASC
    `).all(facilityId);

    res.json({ followUps });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
};

export const getPatientFollowUps = (req: AuthRequest, res: Response): void => {
  try {
    const { patientId } = req.params;

    // IDOR Check for citizen
    if (req.user!.role === 'ROLE_CITIZEN') {
       const p = db.prepare('SELECT id FROM patients WHERE userId = ?').get(req.user!.id);
       if (!p || (p as any).id !== patientId) {
         res.status(403).json({ error: 'Unauthorized' }); return;
       }
    }

    const followUps = db.prepare(`
      SELECT f.*, f_fac.name as facilityName
      FROM follow_ups f
      JOIN facilities f_fac ON f.facilityId = f_fac.id
      WHERE f.patientId = ?
      ORDER BY f.createdAt DESC
    `).all(patientId);

    res.json({ followUps });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
};

export const updateFollowUpStatus = (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const facilityId = req.user!.facilityId;
    if (!facilityId) {
      res.status(403).json({ error: 'No facility assigned' }); return;
    }

    const validStatuses = ['PENDING', 'DUE', 'COMPLETED', 'CANCELLED', 'OVERDUE'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' }); return;
    }

    db.transaction(() => {
      // IDOR constraint: Must belong to the user's facility
      const f = db.prepare('SELECT id, status FROM follow_ups WHERE id = ? AND facilityId = ?').get(id, facilityId) as any;
      if (!f) throw new Error('NOT_FOUND');

      // State machine logic
      if (f.status === 'COMPLETED' || f.status === 'CANCELLED') {
        throw new Error('INVALID_TRANSITION');
      }

      const completedBy = (status === 'COMPLETED' || status === 'CANCELLED') ? req.user!.id : null;
      const completedAt = (status === 'COMPLETED' || status === 'CANCELLED') ? new Date().toISOString() : null;

      db.prepare(`
        UPDATE follow_ups 
        SET status = ?, notes = COALESCE(?, notes), completedByUserId = ?, completedAt = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(status, notes || null, completedBy, completedAt, id);

      logAudit(req.user!.id, 'FOLLOW_UP_UPDATED', f.patientId, { followUpId: id, status });
    })();

    res.json({ success: true });
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') res.status(404).json({ error: 'Follow-up not found or unauthorized' });
    else if (err.message === 'INVALID_TRANSITION') res.status(400).json({ error: 'Cannot transition from a terminal state' });
    else res.status(500).json({ error: 'Internal error' });
  }
};

// --- IDEMPOTENT RECONCILIATION JOB ---

export const reconcileFollowUps = (req: AuthRequest, res: Response): void => {
  try {
    // Determine which follow-ups are DUE (due date <= tomorrow, > today, but simpler logic: due date < now + 24h)
    // Determine which are OVERDUE (due date < now)
    // Send notifications.
    
    // This is idempotent. We don't send multiple notifications for the same state transition.
    // We can use relatedEntityId + status in notifications to check existence, or simply rely on
    // checking if a notification of a specific type exists for that followUpId.
    
    // Get PENDING that should be DUE or OVERDUE
    // Get DUE that should be OVERDUE
    const now = new Date();
    const nowStr = now.toISOString();
    
    db.transaction(() => {
      // 1. Move PENDING/DUE -> OVERDUE
      const toOverdue = db.prepare(`
        SELECT * FROM follow_ups 
        WHERE status IN ('PENDING', 'DUE') AND dueDate < ?
      `).all(nowStr) as any[];

      for (const fu of toOverdue) {
        db.prepare('UPDATE follow_ups SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run('OVERDUE', fu.id);
        
        // Notify the patient
        const pt = db.prepare('SELECT userId FROM patients WHERE id = ?').get(fu.patientId) as any;
        if (pt && pt.userId) {
          // Idempotency check
          const exists = db.prepare('SELECT id FROM notifications WHERE relatedEntityId = ? AND type = ?').get(fu.id, 'FOLLOW_UP_OVERDUE');
          if (!exists) {
            createNotification({
              recipientUserId: pt.userId,
              type: 'FOLLOW_UP_OVERDUE',
              title: 'Follow-up Overdue',
              message: `Your follow-up for ${fu.reason} is overdue.`,
              relatedEntityType: 'FOLLOW_UP',
              relatedEntityId: fu.id,
              priority: 'HIGH'
            }, false);
          }
        }
      }

      // 2. Move PENDING -> DUE (if due within 3 days)
      const future = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
      const toDue = db.prepare(`
        SELECT * FROM follow_ups 
        WHERE status = 'PENDING' AND dueDate >= ? AND dueDate <= ?
      `).all(nowStr, future) as any[];

      for (const fu of toDue) {
        db.prepare('UPDATE follow_ups SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run('DUE', fu.id);
        
        const pt = db.prepare('SELECT userId FROM patients WHERE id = ?').get(fu.patientId) as any;
        if (pt && pt.userId) {
          const exists = db.prepare('SELECT id FROM notifications WHERE relatedEntityId = ? AND type = ?').get(fu.id, 'FOLLOW_UP_DUE');
          if (!exists) {
            createNotification({
              recipientUserId: pt.userId,
              type: 'FOLLOW_UP_DUE',
              title: 'Upcoming Follow-up',
              message: `You have a follow-up due soon for ${fu.reason}.`,
              relatedEntityType: 'FOLLOW_UP',
              relatedEntityId: fu.id,
              priority: 'NORMAL'
            }, false);
          }
        }
      }
    })();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
};


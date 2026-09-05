import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from './db';
import { hasLegitimateCareRelationship } from './auth.utils';
import crypto from 'crypto';
import { AuthRequest } from './auth.middleware';
import { logAudit } from './audit';
import { createNotification } from './notification.service';

const ACTIVE_STATUSES = ['CREATED', 'ACCEPTED', 'SCHEDULED', 'IN_PROGRESS'];
const TERMINAL_STATUSES = ['COMPLETED', 'CANCELLED', 'REJECTED'];

const referralSchema = z.object({
  patientId: z.string().uuid(),
  referringFacilityId: z.string().uuid(),
  receivingFacilityId: z.string().uuid(),
  reason: z.string().min(1),
  priority: z.enum(['ROUTINE', 'URGENT', 'EMERGENCY']),
  supportingInfo: z.any().optional()
});

const calculateDueDate = (priority: string) => {
  const d = new Date();
  if (priority === 'EMERGENCY') d.setHours(d.getHours() + 4);
  else if (priority === 'URGENT') d.setHours(d.getHours() + 48);
  else d.setDate(d.getDate() + 14); // ROUTINE = 14 days
  return d.toISOString();
};

export const createReferral = (req: AuthRequest, res: Response): void => {
  try {
    const parsed = referralSchema.parse(req.body);
    const doctorId = req.user!.id;

    // Verify clinician belongs to the referring facility
    const mapping = db.prepare('SELECT 1 FROM facility_staff WHERE facilityId = ? AND userId = ?').get(parsed.referringFacilityId, doctorId);
    if (!mapping) {
      res.status(403).json({ error: 'Not authorized to refer from this facility.' });
      return;
    }

    // Verify receiving facility exists
    const recvExists = db.prepare('SELECT 1 FROM facilities WHERE id = ?').get(parsed.receivingFacilityId);
    if (!recvExists) {
      res.status(404).json({ error: 'Receiving facility not found.' });
      return;
    }

    // Prevent duplicate active referral to same facility
    const placeholders = ACTIVE_STATUSES.map(() => '?').join(',');
    const dupQuery = `SELECT 1 FROM referrals WHERE patientId = ? AND receivingFacilityId = ? AND status IN (${placeholders})`;
    const duplicate = db.prepare(dupQuery).get(parsed.patientId, parsed.receivingFacilityId, ...ACTIVE_STATUSES);
    
    if (duplicate) {
      res.status(409).json({ error: 'Patient already has an active referral to this facility.' });
      return;
    }

    const id = crypto.randomUUID();
    const dueDate = calculateDueDate(parsed.priority);

    db.prepare(`
      INSERT INTO referrals 
      (id, patientId, referringFacilityId, receivingFacilityId, referringDoctorId, reason, priority, dueDate, supportingInfo) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, parsed.patientId, parsed.referringFacilityId, parsed.receivingFacilityId, doctorId, 
      parsed.reason, parsed.priority, dueDate, parsed.supportingInfo ? JSON.stringify(parsed.supportingInfo) : null
    );

    logAudit(doctorId, 'CREATE_REFERRAL', id, { patientId: parsed.patientId, receivingFacilityId: parsed.receivingFacilityId });

    res.status(201).json({ message: 'Referral created', referralId: id });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: err.issues });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const updateReferralStatus = (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { status, followUpNotes, appointmentId } = req.body;
    const userId = req.user!.id;

    if (![...ACTIVE_STATUSES, ...TERMINAL_STATUSES].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const referral: any = db.prepare('SELECT * FROM referrals WHERE id = ?').get(id);
    if (!referral) {
      res.status(404).json({ error: 'Referral not found' });
      return;
    }

    // Check Authorization:
    // Only referring facility can CANCEL
    // Only receiving facility can ACCEPT, REJECT, SCHEDULE, IN_PROGRESS, COMPLETED
    const isReferringStaff = db.prepare('SELECT 1 FROM facility_staff WHERE facilityId = ? AND userId = ?').get(referral.referringFacilityId, userId);
    const isReceivingStaff = db.prepare('SELECT 1 FROM facility_staff WHERE facilityId = ? AND userId = ?').get(referral.receivingFacilityId, userId);

    if (status === 'CANCELLED' && !isReferringStaff) {
      res.status(403).json({ error: 'Only referring facility can cancel.' });
      return;
    }
    
    if (status !== 'CANCELLED' && !isReceivingStaff) {
      res.status(403).json({ error: 'Only receiving facility can update to this status.' });
      return;
    }

    // Business rule: Completing requires followUpNotes
    if (status === 'COMPLETED' && !followUpNotes) {
      res.status(400).json({ error: 'Follow-up notes are required to mark a referral as completed.' });
      return;
    }

    const updates = ['status = ?', 'updatedAt = CURRENT_TIMESTAMP'];
    const values = [status];

    if (followUpNotes) { updates.push('followUpNotes = ?'); values.push(followUpNotes); }
    if (appointmentId) { updates.push('appointmentId = ?'); values.push(appointmentId); }

    values.push(id);
    
    db.prepare(`UPDATE referrals SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    logAudit(userId, 'UPDATE_REFERRAL', id, { newStatus: status });

    res.json({ message: 'Referral updated successfully' });
  } catch (err: any) {
    if (err.message && err.message.includes('network simulation failure')) {
      res.status(500).json({ error: 'Network failure during status update' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getDashboard = (req: AuthRequest, res: Response): void => {
  try {
    const { facilityId, type } = req.query; // type = 'INCOMING' | 'OUTGOING'
    const userId = req.user!.id;

    const mapping = db.prepare('SELECT 1 FROM facility_staff WHERE facilityId = ? AND userId = ?').get(facilityId, userId);
    if (!mapping) {
      res.status(403).json({ error: 'Not authorized for this facility.' });
      return;
    }

    let query = `
      SELECT r.*, p.firstName, p.lastName, f_ref.name as referringName, f_rec.name as receivingName 
      FROM referrals r
      JOIN patients p ON r.patientId = p.id
      JOIN facilities f_ref ON r.referringFacilityId = f_ref.id
      JOIN facilities f_rec ON r.receivingFacilityId = f_rec.id
    `;

    if (type === 'INCOMING') {
      query += ` WHERE r.receivingFacilityId = ? ORDER BY r.createdAt DESC`;
    } else {
      query += ` WHERE r.referringFacilityId = ? ORDER BY r.createdAt DESC`;
    }

    const referrals = db.prepare(query).all(facilityId);
    res.json({ referrals });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOverdueReferrals = (req: AuthRequest, res: Response): void => {
  try {
    // Escalate overdue referrals: dueDate < now AND status active
    const placeholders = ACTIVE_STATUSES.map(() => '?').join(',');
    const query = `
      SELECT * FROM referrals 
      WHERE dueDate < CURRENT_TIMESTAMP AND status IN (${placeholders})
    `;
    const overdue = db.prepare(query).all(...ACTIVE_STATUSES);
    res.json({ overdue });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPatientReferrals = (req: AuthRequest, res: Response): void => {
  try {
    const patientId = req.params.patientId;
    const userId = req.user!.id;

    if (req.user!.role === 'ROLE_CITIZEN') {
      const citizenPatientRecord: any = db.prepare('SELECT id FROM patients WHERE userId = ?').get(userId);
      if (!citizenPatientRecord || citizenPatientRecord.id !== patientId) {
        res.status(403).json({ error: 'Unauthorized to view these referrals' }); return;
      }
    } else if (req.user!.role !== 'ROLE_DISTRICT_ADMIN') {
      const facilityId = req.user!.facilityId;
      if (!facilityId || !hasLegitimateCareRelationship(patientId, facilityId)) {
        res.status(403).json({ error: 'Unauthorized: No active care relationship' }); return;
      }
    }

    const referrals = db.prepare(`
      SELECT r.*, f_ref.name as referringName, f_rec.name as receivingName 
      FROM referrals r
      JOIN facilities f_ref ON r.referringFacilityId = f_ref.id
      JOIN facilities f_rec ON r.receivingFacilityId = f_rec.id
      WHERE r.patientId = ?
      ORDER BY r.createdAt DESC
    `).all(patientId);

    res.json({ referrals });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

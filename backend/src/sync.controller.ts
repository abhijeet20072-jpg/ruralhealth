import { Response } from 'express';
import { db } from './db';
import { z } from 'zod';
import { logAudit } from './audit';
import crypto from 'crypto';
import { AuthRequest } from './auth.middleware';

const syncPayloadSchema = z.object({
  operations: z.array(z.object({
    id: z.string().uuid(),
    type: z.enum(['CREATE_TRIAGE', 'CREATE_MEDICAL_RECORD', 'UPDATE_APPOINTMENT_STATUS', 'CREATE_REFERRAL', 'UPDATE_TELECONSULTATION_STATUS']),
    payload: z.any(),
    timestamp: z.string()
  })).max(50) // Max 50 ops per batch
});

export const processSync = (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    // Offline sync is generally for facility workers, not patients directly (though could be extended)
    if (userRole === 'ROLE_CITIZEN') {
      res.status(403).json({ error: 'Citizens cannot use batch sync API' });
      return;
    }

    const facilityId = req.user!.facilityId;
    if (!facilityId) {
      res.status(403).json({ error: 'User not associated with a facility' });
      return;
    }

    const parsed = syncPayloadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid sync payload', details: parsed.error });
      return;
    }

    const results = [];

    for (const op of parsed.data.operations) {
      // 1. Idempotency Check
      const existing = db.prepare('SELECT id FROM processed_operations WHERE id = ?').get(op.id);
      if (existing) {
        results.push({ id: op.id, status: 'SUCCESS', message: 'Already processed (Idempotent)' });
        continue;
      }

      try {
        db.transaction(() => {
          if (op.type === 'CREATE_TRIAGE') {
            const schema = z.object({
              patientId: z.string(),
              vitals: z.string().optional(),
              symptoms: z.string().min(1),
              riskFactors: z.string().optional(),
              urgencyLevel: z.enum(['EMERGENCY', 'URGENT', 'ROUTINE']),
              recommendedAction: z.string().min(1),
              referralNeeded: z.boolean().default(false)
            });
            const data = schema.parse(op.payload);
            
            const triageId = crypto.randomUUID();
            db.prepare(`
              INSERT INTO triage_assessments 
              (id, patientId, assessedBy, vitals, symptoms, riskFactors, urgencyLevel, recommendedAction, referralNeeded, disclaimer)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              triageId, data.patientId, userId, data.vitals || null, data.symptoms, data.riskFactors || null,
              data.urgencyLevel, data.recommendedAction, data.referralNeeded ? 1 : 0, 
              'Automated sync: Not a replacement for a doctor.'
            );
            logAudit(userId, 'CREATE_TRIAGE_OFFLINE', triageId);

          } else if (op.type === 'CREATE_MEDICAL_RECORD') {
            const schema = z.object({
              patientId: z.string(),
              recordType: z.string().min(1),
              notes: z.string().min(1),
              data: z.string().optional()
            });
            const data = schema.parse(op.payload);
            const recordId = crypto.randomUUID();
            
            db.prepare(`
              INSERT INTO medical_records (id, patientId, doctorId, facilityId, recordType, notes, data)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(recordId, data.patientId, userId, facilityId, data.recordType, data.notes, data.data || null);
            logAudit(userId, 'CREATE_MEDICAL_RECORD_OFFLINE', recordId);

          } else if (op.type === 'UPDATE_APPOINTMENT_STATUS') {
            const schema = z.object({
              appointmentId: z.string(),
              status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
              queueStatus: z.enum(['WAITING', 'IN_CONSULTATION', 'COMPLETED']).optional(),
              expectedPreviousStatus: z.string().optional() // for conflict detection
            });
            const data = schema.parse(op.payload);
            
            const appt: any = db.prepare('SELECT status, facilityId FROM appointments WHERE id = ?').get(data.appointmentId);
            if (!appt) throw new Error('Appointment not found');
            if (appt.facilityId !== facilityId) throw new Error('Forbidden: Facility mismatch');
            
            // Conflict detection
            if (data.expectedPreviousStatus && appt.status !== data.expectedPreviousStatus) {
               throw new Error('CONFLICT: Server state modified since offline sync');
            }

            db.prepare(`UPDATE appointments SET status = ?, queueStatus = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`)
              .run(data.status, data.queueStatus || 'COMPLETED', data.appointmentId);
            logAudit(userId, 'UPDATE_APPOINTMENT_OFFLINE', data.appointmentId);

          } else if (op.type === 'CREATE_REFERRAL') {
             const schema = z.object({
               patientId: z.string(),
               receivingFacilityId: z.string(),
               reason: z.string().min(1),
               priority: z.enum(['ROUTINE', 'URGENT', 'EMERGENCY']),
               supportingInfo: z.string().optional()
             });
             const data = schema.parse(op.payload);
             const refId = crypto.randomUUID();
             db.prepare(`
               INSERT INTO referrals 
               (id, patientId, referringFacilityId, receivingFacilityId, referringDoctorId, reason, priority, status, supportingInfo)
               VALUES (?, ?, ?, ?, ?, ?, ?, 'CREATED', ?)
             `).run(refId, data.patientId, facilityId, data.receivingFacilityId, userId, data.reason, data.priority, data.supportingInfo || null);
             logAudit(userId, 'CREATE_REFERRAL_OFFLINE', refId);
          } else if (op.type === 'UPDATE_TELECONSULTATION_STATUS') {
            const schema = z.object({
              tcId: z.string(),
              status: z.enum(['COMPLETED', 'CANCELLED']),
              clinicalNotes: z.string().optional()
            });
            const data = schema.parse(op.payload);
            const tc: any = db.prepare('SELECT * FROM teleconsultations WHERE id = ?').get(data.tcId);
            if (!tc) throw new Error('Not found');
            if (tc.facilityId !== facilityId && tc.doctorId !== userId) throw new Error('Forbidden');
            
            if (data.status === 'COMPLETED' && !data.clinicalNotes) throw new Error('Clinical notes required');
            
            db.prepare('UPDATE teleconsultations SET status = ?, clinicalNotes = ?, endedAt = CURRENT_TIMESTAMP WHERE id = ? AND status != ?').run(data.status, data.clinicalNotes || '', data.tcId, data.status);
            
            if (data.status === 'COMPLETED') {
               const recordId = crypto.randomUUID();
               db.prepare(`
                 INSERT INTO medical_records (id, patientId, doctorId, facilityId, recordType, notes)
                 VALUES (?, ?, ?, ?, 'TELECONSULTATION', ?)
               `).run(recordId, tc.patientId, tc.doctorId, tc.facilityId, data.clinicalNotes);
            }
          }

          // Mark operation as processed
          db.prepare('INSERT INTO processed_operations (id, userId, entityType) VALUES (?, ?, ?)').run(op.id, userId, op.type);

        })(); // execute transaction
        
        results.push({ id: op.id, status: 'SUCCESS' });

      } catch (err: any) {
        if (err.name === 'ZodError') {
          results.push({ id: op.id, status: 'FAILED', error: err.issues[0].message });
        } else if (err.message && err.message.startsWith('CONFLICT')) {
          results.push({ id: op.id, status: 'CONFLICT', error: err.message });
        } else {
          results.push({ id: op.id, status: 'FAILED', error: err.message || 'Server processing error' });
        }
      }
    }

    res.status(200).json({ results });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

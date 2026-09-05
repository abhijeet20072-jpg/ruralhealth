import { Response } from 'express';
import { z } from 'zod';
import { db } from './db';
import crypto from 'crypto';
import { AuthRequest } from './auth.middleware';
import { logAudit } from './audit';

const completeSchema = z.object({
  appointmentId: z.string().uuid(),
  patientId: z.string().uuid(),
  facilityId: z.string().uuid(),
  complaint: z.string().min(1),
  observations: z.string(),
  diagnosis: z.string(),
  prescription: z.array(z.object({
    medicine: z.string().min(1),
    dosage: z.string(),
    frequency: z.string(),
    duration: z.string()
  })).optional(),
  investigations: z.string().optional(),
  followUp: z.string().optional()
});

export const completeConsultation = (req: AuthRequest, res: Response): void => {
  try {
    const parsed = completeSchema.parse(req.body);
    const doctorId = req.user!.id;

    // 1. Authorization Verification
    const authCheck = db.prepare(`SELECT 1 FROM facility_staff WHERE facilityId = ? AND userId = ?`).get(parsed.facilityId, doctorId);
    if (!authCheck) {
      res.status(403).json({ error: 'Unauthorized cross-facility action' });
      return;
    }

    // 2. Transaction Start
    const completeTx = db.transaction(() => {
      // a. Verify Appointment State & Ownership
      const apt: any = db.prepare(`SELECT * FROM appointments WHERE id = ? AND facilityId = ? AND doctorId = ? AND patientId = ?`).get(
        parsed.appointmentId, parsed.facilityId, doctorId, parsed.patientId
      );
      
      if (!apt) {
        throw new Error('Appointment not found or unauthorized');
      }
      if (apt.status === 'COMPLETED') {
        throw new Error('Consultation is already completed');
      }

      // b. Update Appointment and Queue
      db.prepare(`UPDATE appointments SET status = 'COMPLETED', queueStatus = 'DONE' WHERE id = ?`).run(parsed.appointmentId);

      // c. Insert Clinical Records (Timeline)
      const insertRecord = db.prepare(`INSERT INTO medical_records (id, patientId, doctorId, facilityId, recordType, notes, data) VALUES (?, ?, ?, ?, ?, ?, ?)`);
      
      // Consultation Notes
      insertRecord.run(crypto.randomUUID(), parsed.patientId, doctorId, parsed.facilityId, 'CONSULTATION', `Complaint: ${parsed.complaint}\nObservations: ${parsed.observations}`, null);

      // Diagnosis
      if (parsed.diagnosis) {
        insertRecord.run(crypto.randomUUID(), parsed.patientId, doctorId, parsed.facilityId, 'DIAGNOSIS', parsed.diagnosis, null);
      }

      // Prescription
      if (parsed.prescription && parsed.prescription.length > 0) {
        insertRecord.run(crypto.randomUUID(), parsed.patientId, doctorId, parsed.facilityId, 'PRESCRIPTION', 'Medicines prescribed', JSON.stringify(parsed.prescription));
      }

      // Investigations
      if (parsed.investigations) {
        insertRecord.run(crypto.randomUUID(), parsed.patientId, doctorId, parsed.facilityId, 'INVESTIGATION', parsed.investigations, null);
      }

      // Follow-up
      if (parsed.followUp) {
        insertRecord.run(crypto.randomUUID(), parsed.patientId, doctorId, parsed.facilityId, 'FOLLOW_UP', parsed.followUp, null);
      }

      // d. Audit
      logAudit(doctorId, 'CONSULTATION_COMPLETED', parsed.appointmentId, { patientId: parsed.patientId });
    });

    completeTx();

    res.json({ message: 'Consultation completed securely' });

  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid clinical data', details: err.issues, message: err.message });
    } else {
      res.status(err.message.includes('unauthorized') || err.message.includes('completed') ? 400 : 500).json({ error: err.message || 'Internal server error' });
    }
  }
};

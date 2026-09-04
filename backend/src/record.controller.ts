import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from './db';
import crypto from 'crypto';
import { AuthRequest } from './auth.middleware';
import { logAudit } from './audit';

const recordSchema = z.object({
  patientId: z.string().uuid(),
  facilityId: z.string().uuid(),
  recordType: z.enum(['CONSULTATION', 'DIAGNOSIS', 'PRESCRIPTION', 'VITALS', 'INVESTIGATION', 'TREATMENT', 'FOLLOW_UP']),
  notes: z.string().min(1, "Notes are required"),
  data: z.any().optional() // JSON payload for specific types like meds
});

export const createMedicalRecord = (req: AuthRequest, res: Response): void => {
  try {
    const parsed = recordSchema.parse(req.body);
    const doctorId = req.user!.id;

    // Verify patient exists
    const patientExists = db.prepare('SELECT 1 FROM patients WHERE id = ?').get(parsed.patientId);
    if (!patientExists) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    // Verify clinician belongs to the facility they are claiming to write from
    const mapping = db.prepare('SELECT 1 FROM facility_staff WHERE facilityId = ? AND userId = ?').get(parsed.facilityId, doctorId);
    if (!mapping) {
      res.status(403).json({ error: 'You are not authorized to create records for this facility.' });
      return;
    }

    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO medical_records 
      (id, patientId, doctorId, facilityId, recordType, notes, data) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, parsed.patientId, doctorId, parsed.facilityId, parsed.recordType, parsed.notes, 
      parsed.data ? JSON.stringify(parsed.data) : null
    );

    // Audit log
    logAudit(doctorId, 'CREATE_MEDICAL_RECORD', id, { patientId: parsed.patientId, recordType: parsed.recordType });

    res.status(201).json({ message: 'Medical record created successfully', recordId: id });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: err.errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getPatientTimeline = (req: AuthRequest, res: Response): void => {
  try {
    const patientId = req.params.patientId;
    const userId = req.user!.id;

    // Cross-facility lookup is intentionally supported for continuity of care.
    // Ensure patient exists
    const patientExists = db.prepare('SELECT 1 FROM patients WHERE id = ?').get(patientId);
    if (!patientExists) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    const records = db.prepare(`
      SELECT m.*, u.username as doctorName, f.name as facilityName 
      FROM medical_records m
      JOIN users u ON m.doctorId = u.id
      JOIN facilities f ON m.facilityId = f.id
      WHERE m.patientId = ?
      ORDER BY m.createdAt DESC
    `).all(patientId);

    // Audit log
    logAudit(userId, 'VIEW_MEDICAL_TIMELINE', patientId);

    const formatted = records.map((r: any) => ({
      ...r,
      data: r.data ? JSON.parse(r.data) : null
    }));

    res.json({ timeline: formatted });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

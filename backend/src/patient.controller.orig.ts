import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from './db';
import crypto from 'crypto';
import { logAudit } from './audit';
import { AuthRequest } from './auth.middleware';

const patientSchema = z.object({
  abhaId: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD"),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.array(z.string()).default([])
});

export const registerPatient = (req: AuthRequest, res: Response): void => {
  try {
    const parsed = patientSchema.parse(req.body);
    const userId = req.user!.id;

    if (parsed.abhaId) {
      const existing = db.prepare('SELECT id FROM patients WHERE abhaId = ?').get(parsed.abhaId);
      if (existing) {
        res.status(400).json({ error: 'Patient with this ABHA ID already exists' });
        return;
      }
    }

    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO patients 
      (id, abhaId, firstName, lastName, dateOfBirth, gender, phoneNumber, address, emergencyContactName, emergencyContactPhone, bloodGroup, allergies) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, parsed.abhaId || null, parsed.firstName, parsed.lastName, parsed.dateOfBirth, parsed.gender,
      parsed.phoneNumber || null, parsed.address || null, parsed.emergencyContactName || null, 
      parsed.emergencyContactPhone || null, parsed.bloodGroup || null, JSON.stringify(parsed.allergies)
    );

    logAudit(userId, 'REGISTER_PATIENT', id, { abhaId: parsed.abhaId });
    res.status(201).json({ message: 'Patient registered successfully', patientId: id });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid patient data', details: err.errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const updatePatient = (req: AuthRequest, res: Response): void => {
  try {
    const id = req.params.id;
    const userId = req.user!.id;
    const parsed = patientSchema.partial().parse(req.body);

    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    const updates: string[] = [];
    const values: any[] = [];
    
    for (const [key, value] of Object.entries(parsed)) {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(key === 'allergies' ? JSON.stringify(value) : value);
      }
    }

    if (updates.length > 0) {
      updates.push(`updatedAt = CURRENT_TIMESTAMP`);
      values.push(id);
      db.prepare(`UPDATE patients SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    logAudit(userId, 'UPDATE_PATIENT', id, Object.keys(parsed));
    res.json({ message: 'Patient updated successfully' });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid patient data', details: err.errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const searchPatients = (req: AuthRequest, res: Response): void => {
  try {
    const { query } = req.query;
    const userId = req.user!.id;
    
    // Using a simplistic search for sqlite MVP.
    let patients: any[] = [];
    if (query) {
      const lowerQuery = `%${String(query).toLowerCase()}%`;
      patients = db.prepare(`
        SELECT id, abhaId, firstName, lastName, dateOfBirth, gender, phoneNumber
        FROM patients 
        WHERE LOWER(firstName) LIKE ? 
           OR LOWER(lastName) LIKE ? 
           OR abhaId LIKE ? 
           OR phoneNumber LIKE ?
        LIMIT 50
      `).all(lowerQuery, lowerQuery, lowerQuery, lowerQuery);
    } else {
      patients = db.prepare(`SELECT id, abhaId, firstName, lastName, dateOfBirth, gender, phoneNumber FROM patients LIMIT 50`).all();
    }

    logAudit(userId, 'SEARCH_PATIENTS', undefined, { query });
    res.json({ patients });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPatientDetails = (req: AuthRequest, res: Response): void => {
  try {
    const id = req.params.id;
    const userId = req.user!.id;

    const patient: any = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
    
    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    patient.allergies = patient.allergies ? JSON.parse(patient.allergies) : [];

    logAudit(userId, 'VIEW_PATIENT_PROFILE', id);
    res.json({ patient });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

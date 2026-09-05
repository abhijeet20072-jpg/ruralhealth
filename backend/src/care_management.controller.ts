import { Response } from 'express';
import { z } from 'zod';
import { db } from './db';
import { hasLegitimateCareRelationship } from './auth.utils';
import crypto from 'crypto';
import { AuthRequest } from './auth.middleware';
import { logAudit } from './audit';
import { createNotification } from './notification.service';
import { calculateRisk, RiskInput } from './care_management.rules';

const carePlanSchema = z.object({
  patientId: z.string().uuid(),
  condition: z.string().min(2),
  goals: z.string().optional(),
  comorbidities: z.array(z.string()).optional(),
  overrideRiskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  initialFollowUpDays: z.number().min(1).max(365).optional()
});

export const enrollPatient = (req: AuthRequest, res: Response): void => {
  try {
    const parsed = carePlanSchema.parse(req.body);
    const facilityId = req.user!.facilityId;

    if (!facilityId) {
      res.status(403).json({ error: 'No facility assigned to user' }); return;
    }

    const patient = db.prepare('SELECT id, dateOfBirth FROM patients WHERE id = ?').get(parsed.patientId) as any;
    if (!patient) {
      res.status(404).json({ error: 'Patient not found' }); return;
    }

    // Check if duplicate ACTIVE plan exists for the same condition
    const existing = db.prepare(`
      SELECT id FROM care_plans 
      WHERE patientId = ? AND condition = ? AND status != 'DISCHARGED'
    `).get(parsed.patientId, parsed.condition);

    if (existing) {
      res.status(409).json({ error: 'Patient is already enrolled for this condition' }); return;
    }

    // Calculate Risk
    let age = 30;
    if (patient.dateOfBirth) {
      const diff = new Date().getTime() - new Date(patient.dateOfBirth).getTime();
      age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    }
    
    const recentEmergencies = (db.prepare(`
      SELECT COUNT(*) as cnt FROM emergency_cases WHERE patientId = ? AND createdAt >= date('now', '-30 days')
    `).get(parsed.patientId) as any).cnt;

    const computedRisk = calculateRisk({
      condition: parsed.condition,
      age,
      comorbidities: parsed.comorbidities,
      recentEmergencies
    });

    const finalRisk = parsed.overrideRiskLevel || computedRisk;

    const planId = crypto.randomUUID();

    const transaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO care_plans (id, patientId, facilityId, assignedClinicianId, condition, riskLevel, goals, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
      `).run(planId, parsed.patientId, facilityId, req.user!.id, parsed.condition, finalRisk, parsed.goals || null);

      if (parsed.initialFollowUpDays) {
        const d = new Date();
        d.setDate(d.getDate() + parsed.initialFollowUpDays);
        db.prepare(`
          INSERT INTO follow_ups (id, patientId, createdByUserId, facilityId, reason, dueDate, status)
          VALUES (?, ?, ?, ?, ?, ?, 'PENDING')
        `).run(crypto.randomUUID(), parsed.patientId, req.user!.id, facilityId, `Care Plan Follow-up: ${parsed.condition}`, d.toISOString());
      }
      return planId;
    });

    const insertedId = transaction();
    logAudit(req.user!.id, 'CARE_PLAN_ENROLLED', parsed.patientId, { planId: insertedId, riskLevel: finalRisk });

    // Notify patient
    const patUser = db.prepare('SELECT userId FROM patients WHERE id = ?').get(parsed.patientId) as any;
    if (patUser && patUser.userId) {
      createNotification({
        recipientUserId: patUser.userId,
        type: 'SYSTEM_ALERT',
        title: 'Enrolled in Care Plan',
        message: `You have been enrolled in a care management plan for ${parsed.condition}.`,
        relatedEntityType: 'CARE_PLAN',
        relatedEntityId: insertedId,
        priority: 'NORMAL'
      }, false);
    }

    res.status(201).json({ planId: insertedId, computedRisk, finalRisk });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: err.issues });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const updateCarePlanStatus = (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { status, riskLevel, goals } = z.object({
      status: z.enum(['ACTIVE', 'ESCALATED', 'DISCHARGED']).optional(),
      riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      goals: z.string().optional()
    }).parse(req.body);

    const facilityId = req.user!.facilityId;
    const plan = db.prepare('SELECT * FROM care_plans WHERE id = ?').get(id) as any;
    
    if (!plan) {
      res.status(404).json({ error: 'Care plan not found' }); return;
    }

    if (plan.facilityId !== facilityId && req.user!.role !== 'ROLE_DISTRICT_ADMIN') {
      res.status(403).json({ error: 'Unauthorized to modify this care plan' }); return;
    }

    if (plan.status === 'DISCHARGED') {
      res.status(400).json({ error: 'Cannot modify a discharged care plan' }); return;
    }

    const updates: string[] = [];
    const values: any[] = [];
    
    if (status) {
      updates.push('status = ?');
      values.push(status);
      if (status === 'DISCHARGED') {
        updates.push('dischargedAt = CURRENT_TIMESTAMP');
      }
    }
    
    if (riskLevel) {
      updates.push('riskLevel = ?');
      values.push(riskLevel);
    }

    if (goals) {
      updates.push('goals = ?');
      values.push(goals);
    }

    if (updates.length > 0) {
      updates.push('updatedAt = CURRENT_TIMESTAMP');
      const q = `UPDATE care_plans SET ${updates.join(', ')} WHERE id = ?`;
      values.push(id);
      db.prepare(q).run(...values);
      logAudit(req.user!.id, 'CARE_PLAN_UPDATED', plan.patientId, { planId: id, changes: { status, riskLevel } });
    }

    if (status === 'ESCALATED') {
      // Notify Specialists
      const specialists = db.prepare(`
        SELECT userId FROM facility_staff fs
        JOIN users u ON fs.userId = u.id
        WHERE fs.facilityId = ? AND u.role IN ('ROLE_SPECIALIST', 'ROLE_DOCTOR_MO')
      `).all(plan.facilityId) as any[];

      for (const s of specialists) {
        if (s.userId !== req.user!.id) {
          createNotification({
            recipientUserId: s.userId,
            type: 'SYSTEM_ALERT',
            title: 'Care Plan Escalated',
            message: `A care plan for ${plan.condition} has been escalated to HIGH RISK.`,
            relatedEntityType: 'CARE_PLAN',
            relatedEntityId: id,
            priority: 'HIGH'
          }, false);
        }
      }
    }

    res.json({ message: 'Care plan updated successfully' });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: err.issues });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getFacilityCarePlans = (req: AuthRequest, res: Response): void => {
  try {
    const facilityId = req.user!.facilityId;
    if (!facilityId) {
      res.status(403).json({ error: 'No facility assigned' }); return;
    }

    const plans = db.prepare(`
      SELECT c.*, p.firstName, p.lastName, u.username as clinicianName 
      FROM care_plans c
      JOIN patients p ON c.patientId = p.id
      LEFT JOIN users u ON c.assignedClinicianId = u.id
      WHERE c.facilityId = ?
      ORDER BY c.createdAt DESC
    `).all(facilityId);

    res.json({ carePlans: plans });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPatientCarePlans = (req: AuthRequest, res: Response): void => {
  try {
    const { patientId } = req.params;

    if (req.user!.role === 'ROLE_CITIZEN') {
      const citizenRecord: any = db.prepare('SELECT id FROM patients WHERE userId = ?').get(req.user!.id);
      if (!citizenRecord || citizenRecord.id !== patientId) {
        res.status(403).json({ error: 'Unauthorized to view these care plans' }); return;
      }
    } else if (req.user!.role !== 'ROLE_DISTRICT_ADMIN') {
      const facilityId = req.user!.facilityId;
      if (!facilityId || !hasLegitimateCareRelationship(patientId, facilityId)) {
        res.status(403).json({ error: 'Unauthorized: No active care relationship' }); return;
      }
    }

    const plans = db.prepare(`
      SELECT c.*, f.name as facilityName, u.username as clinicianName
      FROM care_plans c
      JOIN facilities f ON c.facilityId = f.id
      LEFT JOIN users u ON c.assignedClinicianId = u.id
      WHERE c.patientId = ?
      ORDER BY c.createdAt DESC
    `).all(patientId);

    res.json({ carePlans: plans });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

import { Response } from 'express';
import { z } from 'zod';
import { db } from './db';
import { hasLegitimateCareRelationship } from './auth.utils';
import crypto from 'crypto';
import { AuthRequest } from './auth.middleware';
import { logAudit } from './audit';
import { createNotification } from './notification.service';

const emergencyStatusTransition = z.enum([
  'ACKNOWLEDGED', 'ESCALATED', 'TRANSFER_REQUESTED', 'TRANSFER_ACCEPTED', 
  'IN_TRANSIT', 'RECEIVED', 'RESOLVED', 'CANCELLED'
]);

export const createEmergency = (req: AuthRequest, res: Response): void => {
  try {
    const { patientId, triageId, notes } = z.object({
      patientId: z.string().uuid(),
      triageId: z.string().uuid().optional(),
      notes: z.string().optional()
    }).parse(req.body);

    const facilityId = req.user!.facilityId;
    if (!facilityId) {
      res.status(403).json({ error: 'No facility assigned to user' }); return;
    }

    const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(patientId);
    if (!patient) {
      res.status(404).json({ error: 'Patient not found' }); return;
    }

    // Check if there's already an active emergency for this patient
    const active = db.prepare(`
      SELECT id FROM emergency_cases 
      WHERE patientId = ? AND status NOT IN ('RESOLVED', 'CANCELLED')
    `).get(patientId);

    if (active) {
      res.status(409).json({ error: 'Patient already has an active emergency case' }); return;
    }

    const id = crypto.randomUUID();

    const transaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO emergency_cases (id, patientId, facilityId, triageId, status, detectedByUserId, notes)
        VALUES (?, ?, ?, ?, 'DETECTED', ?, ?)
      `).run(id, patientId, facilityId, triageId || null, req.user!.id, notes || null);
      return id;
    });

    const insertedId = transaction();

    logAudit(req.user!.id, 'EMERGENCY_DETECTED', patientId, { emergencyId: insertedId });

    // Notify Facility Admins and Doctors at this facility
    const staff = db.prepare(`
      SELECT userId FROM facility_staff fs
      JOIN users u ON fs.userId = u.id
      WHERE fs.facilityId = ? AND u.role IN ('ROLE_FACILITY_ADMIN', 'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST')
    `).all(facilityId) as any[];

    for (const s of staff) {
      if (s.userId !== req.user!.id) {
        createNotification({
          recipientUserId: s.userId,
          type: 'TRIAGE_ESCALATION',
          title: 'Emergency Detected',
          message: 'A new emergency has been detected at your facility. Please acknowledge.',
          relatedEntityType: 'EMERGENCY',
          relatedEntityId: insertedId,
          priority: 'URGENT'
        }, false);
      }
    }

    res.status(201).json({ emergencyId: insertedId });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: err.issues });
    } else {
      console.error(err); res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const updateEmergencyStatus = (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { status, notes, destinationFacilityId } = z.object({
      status: emergencyStatusTransition,
      notes: z.string().optional(),
      destinationFacilityId: z.string().uuid().optional()
    }).parse(req.body);

    const facilityId = req.user!.facilityId;
    if (!facilityId) {
      res.status(403).json({ error: 'No facility assigned to user' }); return;
    }

    const em = db.prepare('SELECT * FROM emergency_cases WHERE id = ?').get(id) as any;
    if (!em) {
      res.status(404).json({ error: 'Emergency case not found' }); return;
    }

    if (em.status === 'RESOLVED' || em.status === 'CANCELLED') {
      res.status(400).json({ error: 'Cannot update a resolved or cancelled emergency' }); return;
    }

    // IDOR / Security check
    // If the status is TRANSFER_ACCEPTED or RECEIVED, the user MUST belong to the destination facility!
    // But wait, the destination facility is tracked via the referral.
    let targetFacilityAuthCheck = em.facilityId;
    let ref: any = null;

    if (em.referralId) {
      ref = db.prepare('SELECT receivingFacilityId as destinationFacilityId FROM referrals WHERE id = ?').get(em.referralId) as any;
      if (['TRANSFER_ACCEPTED', 'RECEIVED', 'RESOLVED'].includes(status)) {
         targetFacilityAuthCheck = ref.destinationFacilityId;
      }
    }

    if (targetFacilityAuthCheck !== facilityId && req.user!.role !== 'ROLE_DISTRICT_ADMIN') {
      res.status(403).json({ error: 'You are not authorized to update this emergency case at its current stage.' }); return;
    }

    // State machine logic
    const s = em.status;
    const valid = 
      (status === 'ACKNOWLEDGED' && s === 'DETECTED') ||
      (status === 'ESCALATED' && ['DETECTED', 'ACKNOWLEDGED'].includes(s)) ||
      (status === 'TRANSFER_REQUESTED' && ['DETECTED', 'ACKNOWLEDGED', 'ESCALATED'].includes(s)) ||
      (status === 'TRANSFER_ACCEPTED' && s === 'TRANSFER_REQUESTED') ||
      (status === 'IN_TRANSIT' && s === 'TRANSFER_ACCEPTED') ||
      (status === 'RECEIVED' && s === 'IN_TRANSIT') ||
      (status === 'RESOLVED' && ['RECEIVED', 'ACKNOWLEDGED', 'ESCALATED', 'DETECTED'].includes(s)) ||
      (status === 'CANCELLED' && ['DETECTED', 'ACKNOWLEDGED', 'ESCALATED'].includes(s));

    if (!valid) {
      res.status(400).json({ error: `Invalid state transition from ${s} to ${status}` }); return;
    }

    let newReferralId = em.referralId;

    const transaction = db.transaction(() => {
      let extraUpdates = '';
      const values: any[] = [];

      if (status === 'ACKNOWLEDGED') {
        extraUpdates += ', acknowledgedByUserId = ?'; values.push(req.user!.id);
      } else if (status === 'RESOLVED') {
        extraUpdates += ', resolvedByUserId = ?, resolvedAt = CURRENT_TIMESTAMP'; values.push(req.user!.id);
      } else if (status === 'TRANSFER_REQUESTED') {
        if (!destinationFacilityId) throw new Error('MISSING_DESTINATION');
        // create referral
        newReferralId = crypto.randomUUID();
        db.prepare(`
          INSERT INTO referrals (id, patientId, referringFacilityId, receivingFacilityId, referringDoctorId, reason, priority)
          VALUES (?, ?, ?, ?, ?, ?, 'URGENT')
        `).run(newReferralId, em.patientId, em.facilityId, destinationFacilityId, req.user!.id, notes || 'Emergency Transfer');
        
        extraUpdates += ', referralId = ?'; values.push(newReferralId);
      }

      if (status === 'TRANSFER_ACCEPTED' && em.referralId) {
        db.prepare('UPDATE referrals SET status = ? WHERE id = ?').run('ACCEPTED', em.referralId);
      }

      const q = `UPDATE emergency_cases SET status = ?, notes = COALESCE(?, notes), updatedAt = CURRENT_TIMESTAMP ${extraUpdates} WHERE id = ?`;
      db.prepare(q).run(status, notes || null, ...values, id);
    });

    try {
      transaction();
    } catch (e: any) {
      if (e.message === 'MISSING_DESTINATION') {
        res.status(400).json({ error: 'Destination facility is required for TRANSFER_REQUESTED' }); return;
      }
      throw e;
    }

    logAudit(req.user!.id, `EMERGENCY_${status}`, em.patientId, { emergencyId: id });

    // Notifications (Post commit)
    if (status === 'TRANSFER_REQUESTED' && destinationFacilityId) {
      const destStaff = db.prepare(`
        SELECT userId FROM facility_staff fs
        JOIN users u ON fs.userId = u.id
        WHERE fs.facilityId = ? AND u.role IN ('ROLE_FACILITY_ADMIN', 'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST')
      `).all(destinationFacilityId) as any[];
      for (const st of destStaff) {
        createNotification({
          recipientUserId: st.userId, type: 'SYSTEM_ALERT',
          title: 'Emergency Transfer Requested', message: 'A facility has requested an emergency transfer to your facility.',
          relatedEntityType: 'EMERGENCY', relatedEntityId: id, priority: 'URGENT'
        }, false);
      }
    }

    res.json({ message: 'Emergency status updated', status });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: err.issues });
    } else {
      console.error(err); res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getFacilityEmergencies = (req: AuthRequest, res: Response): void => {
  try {
    const facilityId = req.user!.facilityId;
    if (!facilityId) {
      res.status(403).json({ error: 'No facility assigned' }); return;
    }

    // Get emergencies originating here OR referred to here
    const emergencies = db.prepare(`
      SELECT e.*, p.firstName, p.lastName, f_dest.name as destinationFacilityName
      FROM emergency_cases e
      JOIN patients p ON e.patientId = p.id
      LEFT JOIN referrals r ON e.referralId = r.id
      LEFT JOIN facilities f_dest ON r.destinationFacilityId = f_dest.id
      WHERE e.facilityId = ? OR r.destinationFacilityId = ?
      ORDER BY e.createdAt DESC
    `).all(facilityId, facilityId);

    res.json({ emergencies });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPatientEmergencies = (req: AuthRequest, res: Response): void => {
  try {
    const patientId = req.params.patientId;
    
    if (req.user!.role === 'ROLE_CITIZEN') {
      const citizenPatientRecord: any = db.prepare('SELECT id FROM patients WHERE userId = ?').get(req.user!.id);
      if (!citizenPatientRecord || citizenPatientRecord.id !== patientId) {
        res.status(403).json({ error: 'Unauthorized to access this patient history' }); return;
      }
    } else if (req.user!.role !== 'ROLE_DISTRICT_ADMIN') {
      const facilityId = req.user!.facilityId;
      if (!facilityId || !hasLegitimateCareRelationship(patientId, facilityId)) {
        res.status(403).json({ error: 'Unauthorized: No active care relationship' }); return;
      }
    }

    const emergencies = db.prepare(`
      SELECT e.*, f.name as facilityName 
      FROM emergency_cases e
      JOIN facilities f ON e.facilityId = f.id
      WHERE e.patientId = ?
      ORDER BY e.createdAt DESC
    `).all(patientId);

    res.json({ emergencies });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
};

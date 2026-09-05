import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from './db';
import { hasLegitimateCareRelationship } from './auth.utils';
import { createNotification } from './notification.service';
import crypto from 'crypto';
import { AuthRequest } from './auth.middleware';

const appointmentSchema = z.object({
  patientId: z.string().uuid(),
  facilityId: z.string().uuid(),
  doctorId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD"),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time slot format, use HH:MM")
});

const generateSlots = () => {
  const slots = [];
  for (let h = 9; h < 17; h++) {
    for (let m = 0; m < 60; m += 15) {
      slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }
  return slots; // 32 slots
};

const VALID_SLOTS = generateSlots();

export const bookAppointment = (req: AuthRequest, res: Response): void => {
  try {
    const parsed = appointmentSchema.parse(req.body);

    // SECURITY: Citizens can only book for themselves. Staff can book for any patient.
    if (req.user.role === 'ROLE_CITIZEN') {
      const citizenPatientRecord = db.prepare('SELECT id FROM patients WHERE userId = ?').get(req.user.id);
      if (!citizenPatientRecord) {
        res.status(403).json({ error: 'You must complete your patient profile before booking.' });
        return;
      }
      if (parsed.patientId !== citizenPatientRecord.id) {
        res.status(403).json({ error: 'You are not authorized to book for another patient.' });
        return;
      }
    }


    // 1. Facility closed check (No Sundays)
    const d = new Date(parsed.date);
    if (d.getDay() === 0) {
      res.status(400).json({ error: 'Facility is closed on Sundays' });
      return;
    }

    // 2. Invalid time slot
    if (!VALID_SLOTS.includes(parsed.timeSlot)) {
      res.status(400).json({ error: 'Invalid appointment time slot' });
      return;
    }

    // 3. Doctor available check
    const docMapping = db.prepare('SELECT 1 FROM facility_staff WHERE facilityId = ? AND userId = ?').get(parsed.facilityId, parsed.doctorId);
    if (!docMapping) {
      res.status(400).json({ error: 'Doctor is not available at this facility' });
      return;
    }

    // Check facility capacity or doctor capacity (if all 32 slots booked)
    const slotCount: any = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE doctorId = ? AND date = ? AND status != ?').get(parsed.doctorId, parsed.date, 'CANCELLED');
    if (slotCount.count >= VALID_SLOTS.length) {
      res.status(400).json({ error: 'Doctor is fully booked for this date' });
      return;
    }

    // Generate Token Number
    const transaction = db.transaction(() => {
      const maxTokenQuery: any = db.prepare('SELECT MAX(tokenNumber) as maxToken FROM appointments WHERE facilityId = ? AND date = ?').get(parsed.facilityId, parsed.date);
      const tokenNumber = (maxTokenQuery.maxToken || 0) + 1;
      const id = crypto.randomUUID();

      db.prepare(`
        INSERT INTO appointments (id, patientId, facilityId, doctorId, date, timeSlot, tokenNumber) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, parsed.patientId, parsed.facilityId, parsed.doctorId, parsed.date, parsed.timeSlot, tokenNumber);

      return { id, tokenNumber };
    });

    try {
      const result = transaction();
      
      // Notify Patient
      const ptUser = db.prepare('SELECT userId FROM patients WHERE id = ?').get(parsed.patientId) as any;
      if (ptUser && ptUser.userId) {
        createNotification({
          recipientUserId: ptUser.userId,
          type: 'APPOINTMENT_CONFIRMED',
          title: 'Appointment Confirmed',
          message: `Your appointment for ${parsed.date} at ${parsed.timeSlot} is confirmed.`,
          relatedEntityType: 'APPOINTMENT',
          relatedEntityId: result.id
        }, false);
      }
      res.status(201).json({ message: 'Appointment booked', appointmentId: result.id, tokenNumber: result.tokenNumber });
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('UNIQUE constraint failed') && (msg.includes('doctorId') || msg.includes('idx_appointments_doc_slot'))) {
        res.status(409).json({ error: 'Time slot already booked. Concurrent booking prevented.' });
      } else if (msg.includes('UNIQUE constraint failed') && (msg.includes('patientId') || msg.includes('idx_appointments_patient_date'))) {
        res.status(409).json({ error: 'Patient already has an active appointment on this date.' });
      } else {
        throw err;
      }
    }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: err.issues, message: err.message });
    } else {
      console.error(err); res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const cancelAppointment = (req: AuthRequest, res: Response): void => {
  try {
    const id = req.params.id;
    
    // Check ownership
    const apt = db.prepare('SELECT patientId FROM appointments WHERE id = ?').get(id);
    if (!apt) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }
    
    if (req.user.role === 'ROLE_CITIZEN') {
      const citizenPatientRecord = db.prepare('SELECT id FROM patients WHERE userId = ?').get(req.user.id);
      if (!citizenPatientRecord || citizenPatientRecord.id !== apt.patientId) {
        res.status(403).json({ error: 'Unauthorized to cancel this appointment' });
        return;
      }
    }

    const result = db.prepare(`UPDATE appointments SET status = 'CANCELLED', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`).run(id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }
    
    const pt = db.prepare('SELECT p.userId FROM appointments a JOIN patients p ON a.patientId = p.id WHERE a.id = ?').get(id) as any;
    if (pt && pt.userId) {
      createNotification({
        recipientUserId: pt.userId,
        type: 'APPOINTMENT_CANCELLED',
        title: 'Appointment Cancelled',
        message: 'Your appointment has been cancelled.',
        relatedEntityType: 'APPOINTMENT',
        relatedEntityId: id,
        priority: 'HIGH'
      }, false);
    }
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateQueueStatus = (req: AuthRequest, res: Response): void => {
  try {
    const id = req.params.id;
    const { queueStatus, status } = req.body;

    const appt = db.prepare('SELECT facilityId FROM appointments WHERE id = ?').get(id) as any;
    if (!appt) {
      res.status(404).json({ error: 'Appointment not found' }); return;
    }
    if (req.user!.role !== 'ROLE_DISTRICT_ADMIN' && appt.facilityId !== req.user!.facilityId) {
      res.status(403).json({ error: 'Unauthorized to update appointments at this facility' }); return;
    }
    
    const updates = [];
    const values = [];
    if (queueStatus) { updates.push('queueStatus = ?'); values.push(queueStatus); }
    if (status) { updates.push('status = ?'); values.push(status); }
    
    if (updates.length > 0) {
      values.push(id);
      db.prepare(`UPDATE appointments SET ${updates.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
    }
    res.json({ message: 'Queue updated successfully' });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDoctorAvailability = (req: Request, res: Response): void => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      res.status(400).json({ error: 'Missing doctorId or date' });
      return;
    }
    
    const bookedSlots = db.prepare(`SELECT timeSlot FROM appointments WHERE doctorId = ? AND date = ? AND status != 'CANCELLED'`).all(doctorId, date);
    const bookedTimeSlots = bookedSlots.map((b: any) => b.timeSlot);
    const availableSlots = VALID_SLOTS.filter(s => !bookedTimeSlots.includes(s));
    
    res.json({ availableSlots });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFacilityQueue = (req: AuthRequest, res: Response): void => {
  try {
    const { facilityId, date } = req.query;

    if (!facilityId || !date) {
      res.status(400).json({ error: 'Missing facilityId or date' });
      return;
    }

    // SERVER-SIDE IDOR PROTECTION
    // If the user is facility-scoped (not District Admin), they MUST match the requested facilityId
    if (req.user!.role !== 'ROLE_DISTRICT_ADMIN' && req.user!.facilityId !== facilityId) {
      res.status(403).json({ error: 'Forbidden: You are not authorized to view this facility queue' });
      return;
    }

    const queue = db.prepare(`
      SELECT a.*, p.firstName, p.lastName 
      FROM appointments a 
      JOIN patients p ON a.patientId = p.id
      WHERE a.facilityId = ? AND a.date = ? AND a.status != 'CANCELLED'
      ORDER BY a.tokenNumber ASC
    `).all(facilityId, date);
    res.json({ queue });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPatientHistory = (req: AuthRequest, res: Response): void => {
  try {
    const patientId = req.params.patientId;

    if (req.user!.role === 'ROLE_CITIZEN') {
      const citizenPatientRecord: any = db.prepare('SELECT id FROM patients WHERE userId = ?').get(req.user!.id);
      if (!citizenPatientRecord || citizenPatientRecord.id !== patientId) {
        res.status(403).json({ error: 'Unauthorized to access this patient history' });
        return;
      }
    } else if (req.user!.role !== 'ROLE_DISTRICT_ADMIN') {
      const facilityId = req.user!.facilityId;
      if (!facilityId || !hasLegitimateCareRelationship(patientId, facilityId)) {
        res.status(403).json({ error: 'Unauthorized: No active care relationship with this patient at your facility' });
        return;
      }
    }

    const history = db.prepare(`
      SELECT a.*, f.name as facilityName, u.username as doctorName
      FROM appointments a
      JOIN facilities f ON a.facilityId = f.id
      JOIN users u ON a.doctorId = u.id
      WHERE a.patientId = ?
      ORDER BY a.date DESC, a.timeSlot DESC
    `).all(patientId);
    res.json({ history });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
};

export const getQueuePosition = (req: AuthRequest, res: Response): void => {
  try {
    const appointmentId = req.params.id;
    const apt: any = db.prepare(`SELECT * FROM appointments WHERE id = ?`).get(appointmentId);
    if (!apt) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }
    
    const aheadQuery: any = db.prepare(`
      SELECT COUNT(*) as count 
      FROM appointments 
      WHERE facilityId = ? AND date = ? AND status != 'CANCELLED' AND queueStatus = 'WAITING' AND tokenNumber < ?
    `).get(apt.facilityId, apt.date, apt.tokenNumber);
    
    const ahead = aheadQuery.count;
    const estimatedWaitMinutes = ahead * 15; // 15 mins per patient
    
    res.json({ 
      queueStatus: apt.queueStatus,
      tokenNumber: apt.tokenNumber,
      peopleAhead: ahead,
      estimatedWaitTime: `${estimatedWaitMinutes} minutes`
    });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
};

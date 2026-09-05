import { Response } from 'express';
import { z } from 'zod';
import { db } from './db';
import { hasLegitimateCareRelationship } from './auth.utils';
import crypto from 'crypto';
import { AuthRequest } from './auth.middleware';
import { logAudit } from './audit';
import { createNotification } from './notification.service';

// --- SCHEMAS ---
const orderSchema = z.object({
  patientId: z.string().uuid(),
  diagnosticFacilityId: z.string().uuid(),
  testCode: z.string().min(1),
  clinicalReason: z.string().min(1),
  priority: z.enum(['ROUTINE', 'URGENT', 'EMERGENCY']).default('ROUTINE')
});

const statusSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED', 'SCHEDULED', 'SAMPLE_PENDING', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'CANCELLED']),
  cancellationReason: z.string().optional()
});

const resultSchema = z.object({
  resultValue: z.string().min(1).optional(),
  resultQualitative: z.string().min(1).optional(),
  resultInterpretation: z.string().optional()
}).refine(data => data.resultValue || data.resultQualitative, {
  message: "Either quantitative or qualitative result must be provided"
});

const reviewSchema = z.object({
  clinicalInterpretation: z.string().min(1)
});

// --- CATALOG AND FACILITIES ---

export const getCatalog = (req: AuthRequest, res: Response): void => {
  try {
    const catalog = db.prepare('SELECT * FROM diagnostic_catalog').all();
    res.json({ catalog });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCapableFacilities = (req: AuthRequest, res: Response): void => {
  try {
    const testCode = req.query.testCode as string;
    if (!testCode) {
      res.status(400).json({ error: 'testCode is required' });
      return;
    }
    const facilities = db.prepare(`
      SELECT f.id, f.name, f.type, f.address 
      FROM facilities f
      JOIN facility_diagnostics fd ON f.id = fd.facilityId
      WHERE fd.testCode = ? AND fd.isAvailable = 1
    `).all(testCode);
    res.json({ facilities });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Facility Admin Route to manage available tests
export const manageFacilityDiagnostics = (req: AuthRequest, res: Response): void => {
  try {
    const facilityId = req.user!.facilityId;
    if (!facilityId) { res.status(403).json({ error: 'No facility assigned' }); return; }

    const schema = z.object({
      testCode: z.string(),
      isAvailable: z.boolean()
    });
    const parsed = schema.parse(req.body);

    const existing = db.prepare('SELECT 1 FROM facility_diagnostics WHERE facilityId = ? AND testCode = ?').get(facilityId, parsed.testCode);
    
    if (existing) {
      db.prepare('UPDATE facility_diagnostics SET isAvailable = ? WHERE facilityId = ? AND testCode = ?')
        .run(parsed.isAvailable ? 1 : 0, facilityId, parsed.testCode);
    } else {
      db.prepare('INSERT INTO facility_diagnostics (facilityId, testCode, isAvailable) VALUES (?, ?, ?)')
        .run(facilityId, parsed.testCode, parsed.isAvailable ? 1 : 0);
    }
    res.json({ message: 'Updated diagnostic availability' });
  } catch (err: any) {
    res.status(400).json({ error: 'Invalid input data', details: err.issues, message: err.message });
  }
};

export const getFacilityDiagnostics = (req: AuthRequest, res: Response): void => {
  try {
    const facilityId = req.user!.facilityId;
    const tests = db.prepare(`
      SELECT c.*, fd.isAvailable 
      FROM diagnostic_catalog c
      LEFT JOIN facility_diagnostics fd ON c.testCode = fd.testCode AND fd.facilityId = ?
    `).all(facilityId);
    res.json({ tests });
  } catch(err) {
    res.status(500).json({ error: 'Internal error' });
  }
};

// --- WORKFLOW ROUTES ---

export const orderDiagnostic = (req: AuthRequest, res: Response): void => {
  try {
    const parsed = orderSchema.parse(req.body);
    const doctorId = req.user!.id;
    const referringFacilityId = req.user!.facilityId;
    
    if (!referringFacilityId) {
      res.status(403).json({ error: 'You are not assigned to a facility' }); return;
    }

    // Verify patient
    const patientExists = db.prepare('SELECT 1 FROM patients WHERE id = ?').get(parsed.patientId);
    if (!patientExists) {
      res.status(404).json({ error: 'Patient not found' }); return;
    }

    // Verify test availability at destination facility
    const isCapable = db.prepare('SELECT 1 FROM facility_diagnostics WHERE facilityId = ? AND testCode = ? AND isAvailable = 1')
      .get(parsed.diagnosticFacilityId, parsed.testCode);
    if (!isCapable) {
      res.status(400).json({ error: 'The selected facility does not provide this test' }); return;
    }

    const orderId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO diagnostic_orders 
      (id, patientId, orderingDoctorId, referringFacilityId, diagnosticFacilityId, testCode, clinicalReason, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(orderId, parsed.patientId, doctorId, referringFacilityId, parsed.diagnosticFacilityId, parsed.testCode, parsed.clinicalReason, parsed.priority);
    
    logAudit(doctorId, 'DIAGNOSTIC_ORDERED', orderId, { patientId: parsed.patientId });
    res.status(201).json({ message: 'Diagnostic ordered successfully', orderId });
  } catch (err: any) {
    res.status(400).json({ error: 'Invalid data', details: err.issues, message: err.message });
  }
};


export const getPatientOrders = (req: AuthRequest, res: Response): void => {
  try {
    const patientId = req.params.patientId;
    
    // Quick security check: Citizen can only fetch their own
    if (req.user!.role === 'ROLE_CITIZEN') {
       const p: any = db.prepare('SELECT id FROM patients WHERE userId = ?').get(req.user!.id);
       if (!p || p.id !== patientId) {
         res.status(403).json({ error: 'Unauthorized' }); return;
       }
    } else if (req.user!.role !== 'ROLE_DISTRICT_ADMIN') {
      const facilityId = req.user!.facilityId;
      if (!facilityId || !hasLegitimateCareRelationship(patientId, facilityId)) {
        res.status(403).json({ error: 'Unauthorized: No active care relationship' }); return;
      }
    }

    const orders = db.prepare(`
      SELECT o.*, c.testName, c.category, f.name as diagnosticFacilityName, f_ref.name as referringFacilityName 
      FROM diagnostic_orders o
      JOIN diagnostic_catalog c ON o.testCode = c.testCode
      JOIN facilities f ON o.diagnosticFacilityId = f.id
      JOIN facilities f_ref ON o.referringFacilityId = f_ref.id
      WHERE o.patientId = ?
      ORDER BY o.createdAt DESC
    `).all(patientId);

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
};

export const getOrders = (req: AuthRequest, res: Response): void => {
  try {
    const role = req.user!.role;
    let orders = [];

    if (role === 'ROLE_CITIZEN') {
      const patient = db.prepare('SELECT id FROM patients WHERE userId = ?').get(req.user!.id);
      if (!patient) {
        res.json({ orders: [] }); return;
      }
      orders = db.prepare(`
        SELECT o.*, c.testName, c.category, f.name as diagnosticFacilityName, f_ref.name as referringFacilityName 
        FROM diagnostic_orders o
        JOIN diagnostic_catalog c ON o.testCode = c.testCode
        JOIN facilities f ON o.diagnosticFacilityId = f.id
        JOIN facilities f_ref ON o.referringFacilityId = f_ref.id
        WHERE o.patientId = ?
        ORDER BY o.createdAt DESC
      `).all((patient as any).id);
    } else {
      // Clinical / Diagnostic Staff see incoming orders for their facility
      const facilityId = req.user!.facilityId;
      orders = db.prepare(`
        SELECT o.*, c.testName, c.category, p.firstName, p.lastName, f_ref.name as referringFacilityName 
        FROM diagnostic_orders o
        JOIN diagnostic_catalog c ON o.testCode = c.testCode
        JOIN facilities f_ref ON o.referringFacilityId = f_ref.id
        JOIN patients p ON o.patientId = p.id
        WHERE o.diagnosticFacilityId = ?
        ORDER BY o.createdAt DESC
      `).all(facilityId);
    }
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
};

// Helper function to validate state transitions
const isValidTransition = (current: string, next: string): boolean => {
  const transitions: Record<string, string[]> = {
    'ORDERED': ['ACCEPTED', 'REJECTED', 'CANCELLED'],
    'ACCEPTED': ['SCHEDULED', 'SAMPLE_PENDING', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'CANCELLED'],
    'SCHEDULED': ['SAMPLE_PENDING', 'SAMPLE_COLLECTED', 'CANCELLED'],
    'SAMPLE_PENDING': ['SAMPLE_COLLECTED', 'CANCELLED'],
    'SAMPLE_COLLECTED': ['IN_PROGRESS'],
    'IN_PROGRESS': ['RESULT_READY'],
    // RESULT_READY to REVIEWED is handled by Doctor Review, not standard status update
  };
  return transitions[current] && transitions[current].includes(next);
};

export const updateStatus = (req: AuthRequest, res: Response): void => {
  try {
    const orderId = req.params.id;
    const parsed = statusSchema.parse(req.body);
    const facilityId = req.user!.facilityId;

    const order: any = db.prepare('SELECT status, diagnosticFacilityId, referringFacilityId FROM diagnostic_orders WHERE id = ?').get(orderId);
    if (!order) {
      res.status(404).json({ error: 'Order not found' }); return;
    }

    // Only the diagnostic facility can move it forward (unless cancelling by referring)
    if (parsed.status === 'CANCELLED') {
      if (order.diagnosticFacilityId !== facilityId && order.referringFacilityId !== facilityId) {
        res.status(403).json({ error: 'Unauthorized to cancel this order' }); return;
      }
    } else {
      if (order.diagnosticFacilityId !== facilityId) {
        res.status(403).json({ error: 'Only the processing facility can update this status' }); return;
      }
    }

    if (!isValidTransition(order.status, parsed.status)) {
      res.status(400).json({ error: `Invalid state transition from ${order.status} to ${parsed.status}` }); return;
    }

    db.prepare('UPDATE diagnostic_orders SET status = ?, cancellationReason = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
      .run(parsed.status, parsed.cancellationReason || null, orderId);
    
    logAudit(req.user!.id, 'DIAGNOSTIC_STATUS_UPDATED', orderId, { status: parsed.status });
    res.json({ message: 'Status updated successfully' });
  } catch (err: any) {
    res.status(400).json({ error: 'Invalid data', details: err.issues, message: err.message });
  }
};

export const recordResult = (req: AuthRequest, res: Response): void => {
  try {
    const orderId = req.params.id;
    const parsed = resultSchema.parse(req.body);
    const userId = req.user!.id;
    const facilityId = req.user!.facilityId;

    const order: any = db.prepare('SELECT * FROM diagnostic_orders WHERE id = ?').get(orderId);
    if (!order) {
      res.status(404).json({ error: 'Order not found' }); return;
    }
    if (order.diagnosticFacilityId !== facilityId) {
      res.status(403).json({ error: 'Only the processing facility can record results' }); return;
    }
    if (order.status !== 'IN_PROGRESS' && order.status !== 'SAMPLE_COLLECTED') {
      res.status(400).json({ error: 'Order must be IN_PROGRESS or SAMPLE_COLLECTED to record result' }); return;
    }

    const tx = db.transaction(() => {
      db.prepare(`
        UPDATE diagnostic_orders 
        SET status = 'RESULT_READY', 
            resultValue = ?, 
            resultQualitative = ?, 
            resultInterpretation = ?,
            resultRecordedBy = ?,
            resultRecordedAt = CURRENT_TIMESTAMP,
            updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(parsed.resultValue || null, parsed.resultQualitative || null, parsed.resultInterpretation || null, userId, orderId);

      logAudit(userId, 'DIAGNOSTIC_RESULT_RECORDED', orderId, { patientId: order.patientId });
    });
    
    tx();
    res.json({ message: 'Result recorded successfully' });
  } catch (err: any) {
    res.status(400).json({ error: 'Invalid data', details: err.issues, message: err.message });
  }
};

export const reviewResult = (req: AuthRequest, res: Response): void => {
  try {
    const orderId = req.params.id;
    const parsed = reviewSchema.parse(req.body);
    const doctorId = req.user!.id;
    const facilityId = req.user!.facilityId;

    const order: any = db.prepare(`
      SELECT o.*, c.testName 
      FROM diagnostic_orders o
      JOIN diagnostic_catalog c ON o.testCode = c.testCode
      WHERE o.id = ?
    `).get(orderId);

    if (!order) {
      res.status(404).json({ error: 'Order not found' }); return;
    }
    
    // Only the referring facility can review (often specifically the doctor, but we'll allow facility scope for clinic coverage)
    if (order.referringFacilityId !== facilityId) {
      res.status(403).json({ error: 'Only the ordering facility can review this result' }); return;
    }
    if (order.status !== 'RESULT_READY') {
      res.status(400).json({ error: 'Result is not ready for review' }); return;
    }

    const tx = db.transaction(() => {
      // 1. Mark Reviewed
      db.prepare(`UPDATE diagnostic_orders SET status = 'COMPLETED', doctorReviewedAt = CURRENT_TIMESTAMP WHERE id = ?`).run(orderId);
      
      // 2. Append to EHR
      let ehrNotes = `Test: ${order.testName}\n`;
      if (order.resultValue) ehrNotes += `Value: ${order.resultValue}\n`;
      if (order.resultQualitative) ehrNotes += `Qualitative: ${order.resultQualitative}\n`;
      if (order.resultInterpretation) ehrNotes += `Lab Note: ${order.resultInterpretation}\n`;
      ehrNotes += `Doctor Review: ${parsed.clinicalInterpretation}`;

      db.prepare(`
        INSERT INTO medical_records (id, patientId, doctorId, facilityId, recordType, notes, data)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(crypto.randomUUID(), order.patientId, doctorId, facilityId, 'INVESTIGATION', ehrNotes, JSON.stringify({ orderId }));

      logAudit(doctorId, 'DIAGNOSTIC_RESULT_REVIEWED', orderId, { patientId: order.patientId });
    });

    tx();
    res.json({ message: 'Result reviewed and EHR updated successfully' });
  } catch(err: any) {
    res.status(400).json({ error: 'Invalid data', details: err.issues, message: err.message });
  }
};

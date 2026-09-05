import { Response } from 'express';
import { z } from 'zod';
import { db } from './db';
import { hasLegitimateCareRelationship } from './auth.utils';
import crypto from 'crypto';
import { AuthRequest } from './auth.middleware';
import { logAudit } from './audit';

const inventoryUpdateSchema = z.object({
  medicineId: z.string().min(1),
  quantity: z.number().int().min(0).max(1000000),
  threshold: z.number().int().min(0).max(1000000),
  unit: z.string().min(1).default('units')
});

export const getCatalog = (req: AuthRequest, res: Response): void => {
  try {
    const search = req.query.q ? String(req.query.q).toLowerCase() : '';
    let catalog;
    if (search) {
      catalog = db.prepare(`
        SELECT * FROM medicine_catalog 
        WHERE isActive = 1 AND (LOWER(genericName) LIKE '%' || ? || '%' OR LOWER(displayName) LIKE '%' || ? || '%')
      `).all(search, search);
    } else {
      catalog = db.prepare('SELECT * FROM medicine_catalog WHERE isActive = 1').all();
    }
    res.json({ catalog });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFacilityInventory = (req: AuthRequest, res: Response): void => {
  try {
    const facilityId = req.user!.facilityId;
    if (!facilityId) {
      res.status(403).json({ error: 'No facility assigned' }); return;
    }
    
    // Admins and Doctors can view their own facility's inventory
    const inventory = db.prepare(`
      SELECT i.*, c.genericName, c.displayName, c.dosageForm, c.strength, c.category 
      FROM facility_inventory i
      JOIN medicine_catalog c ON i.medicineId = c.medicineId
      WHERE i.facilityId = ?
    `).all(facilityId);
    
    res.json({ inventory });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
};

export const updateInventory = (req: AuthRequest, res: Response): void => {
  try {
    const facilityId = req.user!.facilityId;
    const userId = req.user!.id;
    if (!facilityId) {
      res.status(403).json({ error: 'No facility assigned' }); return;
    }

    const parsed = inventoryUpdateSchema.parse(req.body);

    const tx = db.transaction(() => {
      const existing = db.prepare('SELECT quantity FROM facility_inventory WHERE facilityId = ? AND medicineId = ?').get(facilityId, parsed.medicineId) as any;
      
      let status = 'AVAILABLE';
      if (parsed.quantity === 0) status = 'OUT_OF_STOCK';
      else if (parsed.quantity <= parsed.threshold) status = 'LOW_STOCK';

      if (existing) {
        db.prepare(`
          UPDATE facility_inventory 
          SET quantity = ?, threshold = ?, unit = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
          WHERE facilityId = ? AND medicineId = ?
        `).run(parsed.quantity, parsed.threshold, parsed.unit, status, facilityId, parsed.medicineId);
      } else {
        // Verify medicine exists
        const medExists = db.prepare('SELECT 1 FROM medicine_catalog WHERE medicineId = ?').get(parsed.medicineId);
        if (!medExists) throw new Error('Invalid medicine ID');

        db.prepare(`
          INSERT INTO facility_inventory (facilityId, medicineId, quantity, threshold, unit, status)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(facilityId, parsed.medicineId, parsed.quantity, parsed.threshold, parsed.unit, status);
      }

      // Record Audit
      const oldQty = existing ? existing.quantity : 0;
      db.prepare(`
        INSERT INTO inventory_audit_logs (id, facilityId, medicineId, oldQuantity, newQuantity, actorId, operationType)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(crypto.randomUUID(), facilityId, parsed.medicineId, oldQty, parsed.quantity, userId, existing ? 'UPDATE' : 'CREATE');
      
      logAudit(userId, 'MEDICINE_INVENTORY_UPDATED', parsed.medicineId, { facilityId, newQuantity: parsed.quantity });
    });

    tx();
    res.json({ message: 'Inventory updated successfully' });
  } catch (err: any) {
    if (err.message === 'Invalid medicine ID') res.status(400).json({ error: err.message });
    else res.status(400).json({ error: 'Invalid data', details: err.issues, message: err.message });
  }
};

export const getMedicineAvailability = (req: AuthRequest, res: Response): void => {
  try {
    const medicineId = req.query.medicineId as string;
    if (!medicineId) {
      res.status(400).json({ error: 'medicineId is required' }); return;
    }

    const facilities = db.prepare(`
      SELECT f.id, f.name, f.type, f.address, i.status
      FROM facility_inventory i
      JOIN facilities f ON i.facilityId = f.id
      WHERE i.medicineId = ? AND i.quantity > 0
      ORDER BY i.quantity DESC
      LIMIT 10
    `).all(medicineId);

    res.json({ facilities });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
};

// For citizens to view availability of medicines prescribed to them
export const getPatientMedicines = (req: AuthRequest, res: Response): void => {
  try {
    const patientId = req.params.patientId;

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

    // A patient's prescribed medicines can be extracted from their medical_records (type PRESCRIPTION)
    // In our system, PRESCRIPTION data is stored as a JSON string array of { medicine: 'name', dosage: '...', ... }
    const prescriptionRecords = db.prepare(`
      SELECT data, facilityId, createdAt 
      FROM medical_records 
      WHERE patientId = ? AND recordType = 'PRESCRIPTION'
      ORDER BY createdAt DESC
    `).all(patientId);

    const prescribedList: any[] = [];
    prescriptionRecords.forEach((record: any) => {
      try {
        if (record.data) {
          const meds = JSON.parse(record.data);
          meds.forEach((m: any) => {
            prescribedList.push({ ...m, prescribedAt: record.createdAt, sourceFacilityId: record.facilityId });
          });
        }
      } catch (e) {}
    });

    res.json({ prescriptions: prescribedList });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
};

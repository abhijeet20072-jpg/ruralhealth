import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from './db';
import crypto from 'crypto';

const facilitySchema = z.object({
  name: z.string().min(3),
  type: z.enum(['SUB_CENTRE', 'PHC', 'CHC', 'RURAL_HOSPITAL', 'DISTRICT_HOSPITAL']),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  operatingHours: z.string().optional(),
  emergencyAvailability: z.boolean().default(false),
  services: z.array(z.string()).default([]),
  diagnosticsAvailable: z.boolean().default(false),
  medicineStatus: z.enum(['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'UNKNOWN']).default('UNKNOWN')
});

export const registerFacility = (req: Request, res: Response): void => {
  try {
    const parsed = facilitySchema.parse(req.body);
    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO facilities 
      (id, name, type, address, latitude, longitude, operatingHours, emergencyAvailability, services, diagnosticsAvailable, medicineStatus) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, parsed.name, parsed.type, parsed.address || null, parsed.latitude || null, parsed.longitude || null, 
      parsed.operatingHours || null, parsed.emergencyAvailability ? 1 : 0, JSON.stringify(parsed.services), 
      parsed.diagnosticsAvailable ? 1 : 0, parsed.medicineStatus
    );

    res.status(201).json({ message: 'Facility registered successfully', facilityId: id });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid facility data', details: err.issues });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const updateFacility = (req: Request, res: Response): void => {
  try {
    const id = req.params.id;
    const parsed = facilitySchema.partial().parse(req.body);

    const facility = db.prepare('SELECT * FROM facilities WHERE id = ?').get(id);
    if (!facility) {
      res.status(404).json({ error: 'Facility not found' });
      return;
    }

    const updates: string[] = [];
    const values: any[] = [];
    
    for (const [key, value] of Object.entries(parsed)) {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(key === 'services' ? JSON.stringify(value) : (typeof value === 'boolean' ? (value ? 1 : 0) : value));
      }
    }

    if (updates.length > 0) {
      updates.push(`updatedAt = CURRENT_TIMESTAMP`);
      values.push(id);
      db.prepare(`UPDATE facilities SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    res.json({ message: 'Facility updated successfully' });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid facility data', details: err.issues });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  // Haversine formula
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const searchFacilities = (req: Request, res: Response): void => {
  try {
    const { query, lat, lng, radius } = req.query;
    
    let facilities: any[] = db.prepare('SELECT * FROM facilities').all();

    facilities = facilities.map(f => ({
      ...f,
      emergencyAvailability: !!f.emergencyAvailability,
      diagnosticsAvailable: !!f.diagnosticsAvailable,
      services: f.services ? JSON.parse(f.services) : []
    }));

    if (query) {
      const lowerQuery = String(query).toLowerCase();
      facilities = facilities.filter(f => 
        f.name.toLowerCase().includes(lowerQuery) || 
        f.type.toLowerCase().includes(lowerQuery) ||
        f.services.some((s: string) => s.toLowerCase().includes(lowerQuery))
      );
    }

    if (lat && lng) {
      const userLat = parseFloat(String(lat));
      const userLng = parseFloat(String(lng));
      const maxRadius = radius ? parseFloat(String(radius)) : 50; // default 50km

      facilities = facilities.map(f => {
        if (f.latitude && f.longitude) {
          return { ...f, distance: getDistance(userLat, userLng, f.latitude, f.longitude) };
        }
        return { ...f, distance: Infinity };
      });

      facilities = facilities.filter(f => f.distance <= maxRadius).sort((a, b) => a.distance - b.distance);
    }

    res.json({ facilities });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFacilityDetails = (req: Request, res: Response): void => {
  try {
    const id = req.params.id;
    const facility: any = db.prepare('SELECT * FROM facilities WHERE id = ?').get(id);
    
    if (!facility) {
      res.status(404).json({ error: 'Facility not found' });
      return;
    }

    facility.emergencyAvailability = !!facility.emergencyAvailability;
    facility.diagnosticsAvailable = !!facility.diagnosticsAvailable;
    facility.services = facility.services ? JSON.parse(facility.services) : [];

    // Get staff
    const staff = db.prepare(`
      SELECT u.id, u.username, u.role 
      FROM facility_staff fs 
      JOIN users u ON fs.userId = u.id 
      WHERE fs.facilityId = ?
    `).all(id);

    facility.staff = staff;

    res.json({ facility });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const assignStaff = (req: Request, res: Response): void => {
  try {
    const { facilityId, userId } = req.body;
    db.prepare('INSERT OR IGNORE INTO facility_staff (facilityId, userId) VALUES (?, ?)').run(facilityId, userId);
    res.json({ message: 'Staff assigned successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

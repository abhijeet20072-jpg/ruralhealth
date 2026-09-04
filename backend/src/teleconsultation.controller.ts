
import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from './db';
import crypto from 'crypto';
import { logAudit } from './audit';
import { AuthRequest } from './auth.middleware';

// Memory store for SSE signaling clients
// Map of consultationId -> array of { userId, response }
const sseClients = new Map<string, { userId: string, res: Response }[]>();

// Ticket store for SSE Auth
// Map of ticket -> { userId, tcId, expiresAt }
const sseTickets = new Map<string, { userId: string, tcId: string, expiresAt: number }>();

const createSchema = z.object({
  patientId: z.string(),
  doctorId: z.string(),
  facilityId: z.string(),
  appointmentId: z.string().optional(),
  consultationType: z.enum(['LIVE', 'STORE_AND_FORWARD']).default('LIVE'),
  reason: z.string().min(1),
  priority: z.enum(['ROUTINE', 'URGENT', 'EMERGENCY']).default('ROUTINE'),
  consentGranted: z.boolean().refine(val => val === true, { message: 'Consent is strictly required' })
});

export const requestConsultation = (req: AuthRequest, res: Response): void => {
  try {
    const parsed = createSchema.parse(req.body);
    const userId = req.user!.id;
    const id = crypto.randomUUID();

    const patient: any = db.prepare('SELECT userId FROM patients WHERE id = ?').get(parsed.patientId);
    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }
    if (req.user!.role === 'ROLE_CITIZEN' && patient.userId !== userId) {
      res.status(403).json({ error: 'Forbidden: Cannot request for another citizen' });
      return;
    }

    db.prepare(`
      INSERT INTO teleconsultations 
      (id, patientId, doctorId, facilityId, appointmentId, consultationType, reason, priority, consentGranted, status, scheduledAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'REQUESTED', CURRENT_TIMESTAMP)
    `).run(
      id, parsed.patientId, parsed.doctorId, parsed.facilityId, parsed.appointmentId || null,
      parsed.consultationType, parsed.reason, parsed.priority, parsed.consentGranted ? 1 : 0
    );

    logAudit(userId, 'CREATE_TELECONSULTATION', id, { type: parsed.consultationType });
    res.status(201).json({ message: 'Consultation requested', id });
  } catch (err: any) {
    if (err.name === 'ZodError') res.status(400).json({ error: err.issues ? err.issues[0].message : String(err) });
    else res.status(500).json({ error: 'Internal server error' });
  }
};

export const getConsultations = (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    let records = [];

    if (role === 'ROLE_CITIZEN') {
      const patientId = req.user!.patientId;
      if (!patientId) {
        res.json({ consultations: [] });
        return;
      }
      records = db.prepare(`SELECT * FROM teleconsultations WHERE patientId = ? ORDER BY createdAt DESC`).all(patientId);
    } else {
      const facilityId = req.user!.facilityId;
      records = db.prepare(`SELECT * FROM teleconsultations WHERE facilityId = ? OR doctorId = ? ORDER BY createdAt DESC`).all(facilityId, userId);
    }

    res.json({ consultations: records });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getConsultationById = (req: AuthRequest, res: Response): void => {
  try {
    const id = req.params.id;
    const tc: any = db.prepare('SELECT * FROM teleconsultations WHERE id = ?').get(id);
    if (!tc) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    // IDOR Check
    if (req.user!.role === 'ROLE_CITIZEN') {
      if (tc.patientId !== req.user!.patientId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
    } else {
      if (tc.facilityId !== req.user!.facilityId && tc.doctorId !== req.user!.id) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
    }

    res.json({ consultation: tc });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const statusSchema = z.object({
  status: z.enum(['SCHEDULED', 'READY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED']),
  clinicalNotes: z.string().optional(),
  cancellationReason: z.string().optional()
});

export const updateStatus = (req: AuthRequest, res: Response): void => {
  try {
    const id = req.params.id;
    const userId = req.user!.id;
    const parsed = statusSchema.parse(req.body);

    const tc: any = db.prepare('SELECT * FROM teleconsultations WHERE id = ?').get(id);
    if (!tc) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    // IDOR Check
    if (req.user!.role === 'ROLE_CITIZEN') {
      if (tc.patientId !== req.user!.patientId || parsed.status !== 'CANCELLED') {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
    } else {
      if (tc.facilityId !== req.user!.facilityId && tc.doctorId !== req.user!.id) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
    }

    // State machine constraints
    const validTransitions: Record<string, string[]> = {
      'REQUESTED': ['SCHEDULED', 'READY', 'CANCELLED', 'FAILED'],
      'SCHEDULED': ['READY', 'CANCELLED', 'FAILED'],
      'READY': ['IN_PROGRESS', 'CANCELLED', 'FAILED'],
      'IN_PROGRESS': ['COMPLETED', 'CANCELLED', 'FAILED'],
      'COMPLETED': [],
      'CANCELLED': [],
      'FAILED': []
    };

    if (!validTransitions[tc.status].includes(parsed.status)) {
      res.status(400).json({ error: `Cannot transition from ${tc.status} to ${parsed.status}` });
      return;
    }

    if (parsed.status === 'COMPLETED' && tc.consultationType === 'LIVE' && !parsed.clinicalNotes) {
      res.status(400).json({ error: 'Clinical notes are strictly required for completion' });
      return;
    }

    // Use transaction for state updates to prevent partial fails
    const updateTx = db.transaction(() => {
      const updates = ['status = ?', 'updatedAt = CURRENT_TIMESTAMP'];
      const values: any[] = [parsed.status];

      if (parsed.status === 'IN_PROGRESS') {
        updates.push('startedAt = CURRENT_TIMESTAMP');
      }
      if (parsed.status === 'COMPLETED') {
        updates.push('endedAt = CURRENT_TIMESTAMP', 'clinicalNotes = ?');
        values.push(parsed.clinicalNotes || '');
        
        const recordId = crypto.randomUUID();
        db.prepare(`
          INSERT INTO medical_records (id, patientId, doctorId, facilityId, recordType, notes)
          VALUES (?, ?, ?, ?, 'TELECONSULTATION', ?)
        `).run(recordId, tc.patientId, tc.doctorId, tc.facilityId, parsed.clinicalNotes || tc.reason);
        logAudit(userId, 'CREATE_MEDICAL_RECORD', recordId, { autoGenerated: true, source: 'TELECONSULTATION' });
      }
      if (parsed.cancellationReason) {
        updates.push('cancellationReason = ?');
        values.push(parsed.cancellationReason);
      }

      values.push(id);
      
      // Ensure we are updating from the previous exact status to prevent concurrent transition races
      const result = db.prepare(`UPDATE teleconsultations SET ${updates.join(', ')} WHERE id = ? AND status = ?`).run(...values, tc.status);
      
      if (result.changes === 0) {
        throw new Error('CONCURRENT_MODIFICATION');
      }
    });

    try {
      updateTx();
    } catch(err: any) {
      if(err.message === 'CONCURRENT_MODIFICATION') {
        res.status(409).json({ error: 'State was modified concurrently. Please refresh.' });
        return;
      }
      throw err;
    }
    
    logAudit(userId, 'UPDATE_TELECONSULTATION_STATUS', id, { newStatus: parsed.status });
    res.json({ message: 'Status updated successfully' });
  } catch (err: any) {
    if (err.name === 'ZodError') res.status(400).json({ error: err.issues ? err.issues[0].message : String(err) });
    else res.status(500).json({ error: 'Internal server error' });
  }
};

// --- SIGNALING TICKET ---
export const generateSignalingTicket = (req: AuthRequest, res: Response): void => {
  try {
    const id = req.params.id;
    const userId = req.user!.id;
    
    const tc: any = db.prepare('SELECT * FROM teleconsultations WHERE id = ?').get(id);
    if (!tc) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    if (req.user!.role === 'ROLE_CITIZEN') {
      if (tc.patientId !== req.user!.patientId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
    } else {
      if (tc.facilityId !== req.user!.facilityId && tc.doctorId !== req.user!.id) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
    }

    const ticket = crypto.randomBytes(32).toString('hex');
    // Ticket expires in 30 seconds
    sseTickets.set(ticket, { userId, tcId: id, expiresAt: Date.now() + 30000 });
    
    res.json({ ticket });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- SIGNALING FOR WEBRTC ---
export const joinSignaling = (req: Request, res: Response): void => {
  const id = req.params.id;
  const ticketId = req.query.ticket as string;
  
  if (!ticketId) {
    res.status(401).json({ error: 'Missing signaling ticket' });
    return;
  }
  
  const ticket = sseTickets.get(ticketId);
  if (!ticket || ticket.tcId !== id || ticket.expiresAt < Date.now()) {
    res.status(401).json({ error: 'Invalid or expired ticket' });
    return;
  }
  
  // Burn the ticket immediately
  sseTickets.delete(ticketId);
  
  const userId = ticket.userId;

  // Set up SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  let clients = sseClients.get(id) || [];
  // Max 2 participants constraint
  if (clients.length >= 2) {
     res.write(`data: ${JSON.stringify({ type: 'ERROR', message: 'Room is full' })}\n\n`);
     res.end();
     return;
  }
  
  clients.push({ userId, res });
  sseClients.set(id, clients);

  logAudit(userId, 'JOINED_SIGNALING', id);

  clients.forEach(client => {
    if (client.userId !== userId) {
      client.res.write(`data: ${JSON.stringify({ type: 'PEER_JOINED', peerId: userId })}\n\n`);
    }
  });

  req.on('close', () => {
    const clients = sseClients.get(id) || [];
    const newClients = clients.filter(c => c.res !== res);
    sseClients.set(id, newClients);
    newClients.forEach(client => {
      client.res.write(`data: ${JSON.stringify({ type: 'PEER_LEFT', peerId: userId })}\n\n`);
    });
  });
};

const signalingSchema = z.object({
  type: z.enum(['offer', 'answer', 'candidate']),
  sdp: z.any().optional(),
  candidate: z.any().optional()
});

export const postSignaling = (req: AuthRequest, res: Response): void => {
  const id = req.params.id;
  const userId = req.user!.id;
  
  // Validate payload size roughly (max 10KB)
  if (JSON.stringify(req.body).length > 10240) {
    res.status(413).json({ error: 'Payload too large' });
    return;
  }

  const parsed = signalingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid signaling payload' });
    return;
  }

  const tc: any = db.prepare('SELECT * FROM teleconsultations WHERE id = ?').get(id);
  if (!tc) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  // IDOR check
  if (req.user!.role === 'ROLE_CITIZEN') {
    if (tc.patientId !== req.user!.patientId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
  } else {
    if (tc.facilityId !== req.user!.facilityId && tc.doctorId !== req.user!.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
  }
  
  // Prevent signaling after completion/cancellation
  if (['COMPLETED', 'CANCELLED', 'FAILED'].includes(tc.status)) {
    res.status(400).json({ error: 'Consultation is no longer active' });
    return;
  }

  const payload = req.body;
  const clients = sseClients.get(id) || [];

  clients.forEach(client => {
    if (client.userId !== userId) {
      client.res.write(`data: ${JSON.stringify({ ...payload, senderId: userId })}\n\n`);
    }
  });

  res.status(200).json({ success: true });
};

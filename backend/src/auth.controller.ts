import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from './db';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_development_only_12345';

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  role: z.string().default('ROLE_CITIZEN')
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});

const enrichUser = (user: any) => {
  const result: any = { id: user.id, username: user.username, role: user.role };
  if (user.role !== 'ROLE_CITIZEN') {
    const mapping = db.prepare('SELECT facilityId FROM facility_staff WHERE userId = ?').get(user.id) as any;
    if (mapping) result.facilityId = mapping.facilityId;
  } else {
    // Check if citizen is linked to a patient profile
    // Catch if column doesn't exist yet via try-catch to avoid breaking
    try {
      const p = db.prepare('SELECT id FROM patients WHERE userId = ?').get(user.id) as any;
      if (p) result.patientId = p.id;
    } catch(e) {}
  }
  return result;
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerSchema.parse(req.body);
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(parsed.username);
    if (existing) {
      res.status(400).json({ error: 'Username already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(parsed.password, salt);
    const id = crypto.randomUUID();

    db.prepare('INSERT INTO users (id, username, passwordHash, role) VALUES (?, ?, ?, ?)').run(id, parsed.username, passwordHash, parsed.role);

    res.status(201).json({ message: 'User registered successfully', userId: id });
  } catch (err: any) {
    res.status(400).json({ error: 'Invalid data' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.parse(req.body);
    const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(parsed.username);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const enriched = enrichUser(user);
    const token = jwt.sign(enriched, JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: enriched });
  } catch (err: any) {
    res.status(400).json({ error: 'Invalid data' });
  }
};

export const me = (req: any, res: Response): void => {
  // Try to enrich it fresh
  const user: any = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user: enrichUser(user) });
};

export const logout = (req: Request, res: Response): void => {
  res.json({ message: 'Logged out successfully' });
};

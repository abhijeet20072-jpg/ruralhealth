import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from './db';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_development_only_12345';

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum([
    'ROLE_CITIZEN', 'ROLE_ASHA', 'ROLE_ANM', 'ROLE_CHO', 
    'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_LAB_TECH', 
    'ROLE_PHARMACIST', 'ROLE_FACILITY_ADMIN', 'ROLE_DISTRICT_ADMIN'
  ]).default('ROLE_CITIZEN')
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerSchema.parse(req.body);
    
    // Check duplicate
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(parsed.username);
    if (existing) {
      res.status(400).json({ error: 'Username already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(parsed.password, salt);
    const id = crypto.randomUUID();

    db.prepare('INSERT INTO users (id, username, passwordHash, role) VALUES (?, ?, ?, ?)')
      .run(id, parsed.username, passwordHash, parsed.role);

    res.status(201).json({ message: 'User registered successfully', userId: id });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
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

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const me = (req: any, res: Response): void => {
  res.json({ user: req.user });
};

export const logout = (req: Request, res: Response): void => {
  // Stateless JWT: client deletes token. We just acknowledge.
  res.json({ message: 'Logged out successfully' });
};

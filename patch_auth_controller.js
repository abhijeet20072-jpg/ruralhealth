const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'backend', 'src', 'auth.controller.ts');
let content = fs.readFileSync(file, 'utf8');

const targetRegister = `    // Prevent random users from registering as ADMIN roles
    // In a real system, roles would be assigned by an admin. For demo/prototyping, we strictly validate.
    if (!['ROLE_CITIZEN', 'ROLE_ASHA', 'ROLE_ANM', 'ROLE_CHO', 'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_FACILITY_ADMIN', 'ROLE_DISTRICT_ADMIN'].includes(parsed.role)) {
      res.status(400).json({ error: 'Invalid role.' });
      return;
    }

    db.prepare('INSERT INTO users (id, username, passwordHash, role) VALUES (?, ?, ?, ?)').run(id, parsed.username, passwordHash, parsed.role);`;

const replaceRegister = `    // PUBLIC REGISTRATION: Always assign ROLE_CITIZEN regardless of request body
    const finalRole = 'ROLE_CITIZEN';

    db.prepare('INSERT INTO users (id, username, passwordHash, role) VALUES (?, ?, ?, ?)').run(id, parsed.username, passwordHash, finalRole);`;

content = content.replace(targetRegister, replaceRegister);

const testProvision = `
export const testProvision = async (req: Request, res: Response): Promise<void> => {
  if (process.env.NODE_ENV !== 'test') {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  
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

    if (!['ROLE_CITIZEN', 'ROLE_ASHA', 'ROLE_ANM', 'ROLE_CHO', 'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_FACILITY_ADMIN', 'ROLE_DISTRICT_ADMIN'].includes(parsed.role)) {
      res.status(400).json({ error: 'Invalid role.' });
      return;
    }

    db.prepare('INSERT INTO users (id, username, passwordHash, role) VALUES (?, ?, ?, ?)').run(id, parsed.username, passwordHash, parsed.role);

    res.status(201).json({ message: 'User provisioned successfully', userId: id });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
    } else {
      res.status(400).json({ error: 'Invalid data' });
    }
  }
};
`;

content = content + testProvision;
fs.writeFileSync(file, content);

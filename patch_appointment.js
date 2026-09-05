const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'backend', 'src', 'appointment.controller.ts');
let content = fs.readFileSync(file, 'utf8');

const target = `export const getFacilityQueue = (req: AuthRequest, res: Response): void => {
  try {
    const { facilityId, date } = req.query;`;

const replacement = `export const getFacilityQueue = (req: AuthRequest, res: Response): void => {
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
`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);

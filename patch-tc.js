const fs = require('fs');
let code = fs.readFileSync('backend/src/teleconsultation.controller.ts', 'utf8');

const getTcCode = `
export const getConsultationById = (req: AuthRequest, res: Response): void => {
  try {
    const id = req.params.id;
    const tc: any = db.prepare('SELECT * FROM teleconsultations WHERE id = ?').get(id);
    if (!tc) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ consultation: tc });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
`;

if (!code.includes('getConsultationById')) {
  code += '\n' + getTcCode;
  fs.writeFileSync('backend/src/teleconsultation.controller.ts', code);
}

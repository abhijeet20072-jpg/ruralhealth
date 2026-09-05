const fs = require('fs');
const path = 'backend/src/patient.controller.ts';
let code = fs.readFileSync(path, 'utf8');

const getFind = `export const getPatientDetails = (req: AuthRequest, res: Response): void => {
  try {
    const id = req.params.id;
    const userId = req.user!.id;`;

const getReplace = `export const getPatientDetails = (req: AuthRequest, res: Response): void => {
  try {
    const id = req.params.id;
    const userId = req.user!.id;
    
    if (req.user!.role === 'ROLE_CITIZEN') {
      const myProfile = db.prepare('SELECT id FROM patients WHERE userId = ?').get(userId);
      if (!myProfile || myProfile.id !== id) {
        res.status(403).json({ error: 'Unauthorized to view this profile' });
        return;
      }
    }`;

code = code.replace(getFind, getReplace);

const putFind = `export const updatePatient = (req: AuthRequest, res: Response): void => {
  try {
    const id = req.params.id;
    const userId = req.user!.id;`;

const putReplace = `export const updatePatient = (req: AuthRequest, res: Response): void => {
  try {
    const id = req.params.id;
    const userId = req.user!.id;

    if (req.user!.role === 'ROLE_CITIZEN') {
      const myProfile = db.prepare('SELECT id FROM patients WHERE userId = ?').get(userId);
      if (!myProfile || myProfile.id !== id) {
        res.status(403).json({ error: 'Unauthorized to update this profile' });
        return;
      }
    }`;

code = code.replace(putFind, putReplace);

fs.writeFileSync(path, code);

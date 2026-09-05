const fs = require('fs');
const pathCtrl = 'backend/src/diagnostic.controller.ts';
let codeCtrl = fs.readFileSync(pathCtrl, 'utf8');

const ctrlInsert = `
export const getPatientOrders = (req: AuthRequest, res: Response): void => {
  try {
    const patientId = req.params.patientId;
    
    // Quick security check: Citizen can only fetch their own
    if (req.user!.role === 'ROLE_CITIZEN') {
       const p = db.prepare('SELECT id FROM patients WHERE userId = ?').get(req.user!.id);
       if (!p || (p as any).id !== patientId) {
         res.status(403).json({ error: 'Unauthorized' }); return;
       }
    }

    const orders = db.prepare(\`
      SELECT o.*, c.testName, c.category, f.name as diagnosticFacilityName, f_ref.name as referringFacilityName 
      FROM diagnostic_orders o
      JOIN diagnostic_catalog c ON o.testCode = c.testCode
      JOIN facilities f ON o.diagnosticFacilityId = f.id
      JOIN facilities f_ref ON o.referringFacilityId = f_ref.id
      WHERE o.patientId = ?
      ORDER BY o.createdAt DESC
    \`).all(patientId);

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
};
`;

const getOrdersFind = `export const getOrders = (req: AuthRequest, res: Response): void => {`;
codeCtrl = codeCtrl.replace(getOrdersFind, ctrlInsert + "\n" + getOrdersFind);
fs.writeFileSync(pathCtrl, codeCtrl);

const pathRoute = 'backend/src/diagnostic.routes.ts';
let codeRoute = fs.readFileSync(pathRoute, 'utf8');
codeRoute = codeRoute.replace(`orderDiagnostic,\n  getOrders,`, `orderDiagnostic,\n  getOrders,\n  getPatientOrders,`);
codeRoute = codeRoute.replace(`router.get('/orders', authenticate, getOrders);`, `router.get('/orders', authenticate, getOrders);\nrouter.get('/patient/:patientId', authenticate, getPatientOrders);`);
fs.writeFileSync(pathRoute, codeRoute);


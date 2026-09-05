const fs = require('fs');
const path = 'backend/src/patient.controller.ts';
let code = fs.readFileSync(path, 'utf8');

const findCatch = `} catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid patient data' });
    }`;

const replaceCatch = `} catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid patient data', details: err.errors });
    }`;

// Replace multiple occurrences
code = code.split(findCatch).join(replaceCatch);

fs.writeFileSync(path, code);
console.log("Patched patient zod");

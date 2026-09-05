const fs = require('fs');
const path = 'backend/src/patient.controller.ts';
let code = fs.readFileSync(path, 'utf8');

const findPhone = `phoneNumber: z.string().optional(),`;
const replacePhone = `phoneNumber: z.string().regex(/^[6-9]\\d{9}$/, "Invalid Indian mobile number").optional().or(z.literal('')),`;

const findEmerg = `emergencyContactPhone: z.string().optional(),`;
const replaceEmerg = `emergencyContactPhone: z.string().regex(/^[6-9]\\d{9}$/, "Invalid Indian mobile number").optional().or(z.literal('')),`;

code = code.replace(findPhone, replacePhone);
code = code.replace(findEmerg, replaceEmerg);

fs.writeFileSync(path, code);
console.log("Patched patient.controller.ts");

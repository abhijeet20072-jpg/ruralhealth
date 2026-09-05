const fs = require('fs');
const path = 'backend/src/sync.controller.ts';
let code = fs.readFileSync(path, 'utf8');

const opFind = `'CREATE_TRIAGE', 'CREATE_MEDICAL_RECORD', 'UPDATE_APPOINTMENT_STATUS', 'CREATE_REFERRAL', 'UPDATE_TELECONSULTATION_STATUS'`;
const opReplace = `'CREATE_TRIAGE', 'CREATE_MEDICAL_RECORD', 'UPDATE_APPOINTMENT_STATUS', 'CREATE_REFERRAL', 'UPDATE_TELECONSULTATION_STATUS', 'COMPLETE_CONSULTATION'`;
code = code.replace(opFind, opReplace);

const handlerInsert = `
          } else if (op.type === 'COMPLETE_CONSULTATION') {
            const schema = z.object({
              appointmentId: z.string().uuid(),
              patientId: z.string().uuid(),
              complaint: z.string().min(1),
              observations: z.string().optional(),
              diagnosis: z.string().optional(),
              prescription: z.array(z.object({
                medicine: z.string(), dosage: z.string(), frequency: z.string(), duration: z.string()
              })).optional(),
              investigations: z.string().optional(),
              followUp: z.string().optional()
            });
            const data = schema.parse(op.payload);
            
            // a. Verify Appointment
            const apt: any = db.prepare(\`SELECT * FROM appointments WHERE id = ? AND facilityId = ?\`).get(data.appointmentId, facilityId);
            if (!apt) throw new Error('Appointment not found');
            if (apt.status === 'COMPLETED') throw new Error('Already completed');

            // b. Update Appointment
            db.prepare(\`UPDATE appointments SET status = 'COMPLETED', queueStatus = 'DONE' WHERE id = ?\`).run(data.appointmentId);

            // c. Insert Clinical Records
            const insertRecord = db.prepare(\`INSERT INTO medical_records (id, patientId, doctorId, facilityId, recordType, notes, data) VALUES (?, ?, ?, ?, ?, ?, ?)\`);
            
            insertRecord.run(crypto.randomUUID(), data.patientId, userId, facilityId, 'CONSULTATION', \`Complaint: \${data.complaint}\\nObservations: \${data.observations || ''}\`, null);
            if (data.diagnosis) insertRecord.run(crypto.randomUUID(), data.patientId, userId, facilityId, 'DIAGNOSIS', data.diagnosis, null);
            if (data.prescription && data.prescription.length > 0) insertRecord.run(crypto.randomUUID(), data.patientId, userId, facilityId, 'PRESCRIPTION', 'Medicines prescribed', JSON.stringify(data.prescription));
            if (data.investigations) insertRecord.run(crypto.randomUUID(), data.patientId, userId, facilityId, 'INVESTIGATION', data.investigations, null);
            if (data.followUp) insertRecord.run(crypto.randomUUID(), data.patientId, userId, facilityId, 'FOLLOW_UP', data.followUp, null);

            logAudit(userId, 'CONSULTATION_COMPLETED_OFFLINE', data.appointmentId);
`;

const handlerFind = `} else if (op.type === 'UPDATE_TELECONSULTATION_STATUS') {`;
code = code.replace(handlerFind, handlerInsert + `\n          ` + handlerFind);

fs.writeFileSync(path, code);

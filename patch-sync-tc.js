const fs = require('fs');
let code = fs.readFileSync('backend/src/sync.controller.ts', 'utf8');

if (!code.includes('UPDATE_TELECONSULTATION_STATUS')) {
  code = code.replace(
    /'UPDATE_APPOINTMENT_STATUS', 'CREATE_REFERRAL'\]\)/,
    "'UPDATE_APPOINTMENT_STATUS', 'CREATE_REFERRAL', 'UPDATE_TELECONSULTATION_STATUS'])"
  );
  
  code = code.replace(
    /else if \(op\.type === 'CREATE_REFERRAL'\) \{[\s\S]*?logAudit\(userId, 'CREATE_REFERRAL_OFFLINE', refId\);\n          \}/,
    `else if (op.type === 'CREATE_REFERRAL') {
             const schema = z.object({
               patientId: z.string(),
               receivingFacilityId: z.string(),
               reason: z.string().min(1),
               priority: z.enum(['ROUTINE', 'URGENT', 'EMERGENCY']),
               supportingInfo: z.string().optional()
             });
             const data = schema.parse(op.payload);
             const refId = crypto.randomUUID();
             db.prepare(\`
               INSERT INTO referrals 
               (id, patientId, referringFacilityId, receivingFacilityId, referringDoctorId, reason, priority, status, supportingInfo)
               VALUES (?, ?, ?, ?, ?, ?, ?, 'CREATED', ?)
             \`).run(refId, data.patientId, facilityId, data.receivingFacilityId, userId, data.reason, data.priority, data.supportingInfo || null);
             logAudit(userId, 'CREATE_REFERRAL_OFFLINE', refId);
          } else if (op.type === 'UPDATE_TELECONSULTATION_STATUS') {
            const schema = z.object({
              tcId: z.string(),
              status: z.enum(['COMPLETED', 'CANCELLED']),
              clinicalNotes: z.string().optional()
            });
            const data = schema.parse(op.payload);
            const tc: any = db.prepare('SELECT * FROM teleconsultations WHERE id = ?').get(data.tcId);
            if (!tc) throw new Error('Not found');
            if (tc.facilityId !== facilityId && tc.doctorId !== userId) throw new Error('Forbidden');
            
            if (data.status === 'COMPLETED' && !data.clinicalNotes) throw new Error('Clinical notes required');
            
            db.prepare('UPDATE teleconsultations SET status = ?, clinicalNotes = ?, endedAt = CURRENT_TIMESTAMP WHERE id = ? AND status != ?').run(data.status, data.clinicalNotes || '', data.tcId, data.status);
            
            if (data.status === 'COMPLETED') {
               const recordId = crypto.randomUUID();
               db.prepare(\`
                 INSERT INTO medical_records (id, patientId, doctorId, facilityId, recordType, notes)
                 VALUES (?, ?, ?, ?, 'TELECONSULTATION', ?)
               \`).run(recordId, tc.patientId, tc.doctorId, tc.facilityId, data.clinicalNotes);
            }
          }`
  );
  
  fs.writeFileSync('backend/src/sync.controller.ts', code);
}

import { db } from './backend/src/db';
try {
  db.prepare(`INSERT INTO appointments (id, patientId, facilityId, doctorId, date, timeSlot, tokenNumber) VALUES ('1', 'p1', 'f1', 'd1', '2026-09-07', '10:00', 1)`).run();
  db.prepare(`INSERT INTO appointments (id, patientId, facilityId, doctorId, date, timeSlot, tokenNumber) VALUES ('2', 'p2', 'f1', 'd1', '2026-09-07', '10:00', 2)`).run();
} catch (err: any) {
  console.log("Error message is: ", err.message);
}

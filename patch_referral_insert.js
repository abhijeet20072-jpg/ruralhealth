const fs = require('fs');
let path = 'backend/src/emergency.controller.ts';
let code = fs.readFileSync(path, 'utf8');

const errFind = "INSERT INTO referrals (id, patientId, originatingFacilityId, destinationFacilityId, reason, priority)\\n          VALUES (?, ?, ?, ?, ?, 'URGENT')";
const errReplace = "INSERT INTO referrals (id, patientId, referringFacilityId, receivingFacilityId, referringDoctorId, reason, priority)\\n          VALUES (?, ?, ?, ?, ?, ?, 'URGENT')";
code = code.replace(errFind, errReplace);

const valFind = "run(newReferralId, em.patientId, em.facilityId, destinationFacilityId, notes || 'Emergency Transfer');";
const valReplace = "run(newReferralId, em.patientId, em.facilityId, destinationFacilityId, req.user!.id, notes || 'Emergency Transfer');";
code = code.replace(valFind, valReplace);

const readFind = "SELECT destinationFacilityId FROM referrals WHERE id = ?";
const readReplace = "SELECT receivingFacilityId as destinationFacilityId FROM referrals WHERE id = ?";
code = code.replace(readFind, readReplace);

const fetchFind = "LEFT JOIN facilities f_dest ON r.destinationFacilityId = f_dest.id\\n      WHERE e.facilityId = ? OR r.destinationFacilityId = ?";
const fetchReplace = "LEFT JOIN facilities f_dest ON r.receivingFacilityId = f_dest.id\\n      WHERE e.facilityId = ? OR r.receivingFacilityId = ?";
code = code.replace(fetchFind, fetchReplace);

fs.writeFileSync(path, code);

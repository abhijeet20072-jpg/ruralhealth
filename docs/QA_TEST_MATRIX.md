# QA Test Matrix

| Feature | Role | Expected Result | Status | Automated Test |
|---------|------|-----------------|--------|----------------|
| **Patient Registration** | CLINICAL STAFF | Successful registration of new patient | PASS | `src/patient_workflow.test.ts` |
| **Patient Registration** | CITIZEN | Cannot register random patients, only map to self | PASS | `src/patient.test.ts` |
| **View Patient Details** | CITIZEN | Can only view own profile | PASS | `src/patient.test.ts` |
| **Appointment Booking** | CITIZEN | Cannot supply arbitrary `patientId` | PASS | `src/appointment.test.ts` |
| **Appointment Booking** | CITIZEN | Can successfully book own slot | PASS | `src/appointment.test.ts` |
| **Appointment Cancel** | CITIZEN | Cannot cancel another's appointment | PASS | Manual / UI restricted |
| **Triage Execution** | CITIZEN | Blocked at frontend & backend | PASS | Manual / UI restricted |
| **Triage Execution** | CLINICAL STAFF | Succeeds for valid ranges | PASS | `src/triage.test.ts` |
| **Queue Management** | CLINICAL STAFF | Allowed within facility | PASS | `src/appointment.test.ts` |
| **Referrals** | DISTRICT ADMIN | Can view overdue global referrals | PASS | `src/referral.test.ts` |
| **Citizen Appt Booking Flow** | CITIZEN | Can select real available time slots | PASS | `src/citizen_journey.test.ts` |
| **Citizen Double Booking** | CITIZEN | Rejected if attempting to book concurrent slot | PASS | `src/citizen_journey.test.ts` |
| **Citizen My Referrals** | CITIZEN | View own referrals securely | PASS | `src/citizen_journey.test.ts` |
| **Citizen Health Profile** | CITIZEN | Can view own EHR timeline securely | PASS | `src/citizen_journey.test.ts` |
| **Citizen IDOR Prevention** | CITIZEN | Cannot view arbitrary patient appointments/referrals/records | PASS | `src/citizen_journey.test.ts` |
| **Clinical Queue Fetch** | DOCTOR_MO | Queue strictly returns appointments for the Doctor's authenticated facility | PASS | `src/clinical_journey.test.ts` |
| **Clinical Consultation IDOR** | DOCTOR_MO | Reject completion if `patientId` is tampered | PASS | `src/clinical_journey.test.ts` |
| **Clinical Cross-Facility** | DOCTOR_MO | Reject completion if Doctor attempts to act on another Facility's appointment | PASS | `src/clinical_journey.test.ts` |
| **Clinical Duplicate Block** | DOCTOR_MO | Reject consultation completion if already marked `COMPLETED` | PASS | `src/clinical_journey.test.ts` |
| **Clinical EHR Integrity** | DOCTOR_MO | Verify 5 distinct clinical records populate timeline on completion | PASS | `src/clinical_journey.test.ts` |
| **Diagnostic Routing** | DOCTOR_MO | Block orders dispatched to Facilities not configured for the requested Test Code | PASS | `src/diagnostic_journey.test.ts` |
| **Diagnostic Cross-Facility Isolation** | DIAG_STAFF | Reject state updates on orders assigned to another Facility | PASS | `src/diagnostic_journey.test.ts` |
| **Diagnostic State Machine Integrity** | DIAG_STAFF | Reject illegal transitions (e.g. ACCEPTED -> RESULT_READY) | PASS | `src/diagnostic_journey.test.ts` |
| **Diagnostic Citizen IDOR** | CITIZEN | Reject review submission by patient | PASS | `src/diagnostic_journey.test.ts` |
| **Diagnostic EHR Insertion** | DOCTOR_MO | Verify Doctor Review accurately populates timeline timeline | PASS | `src/diagnostic_journey.test.ts` |
| **Medicine Cross-Facility Isolation** | FACILITY_ADMIN | Reject inventory modifications for external facilities | PASS | `src/medicine_journey.test.ts` |
| **Medicine Negative Stock** | FACILITY_ADMIN | Reject negative integer quantities in inventory | PASS | `src/medicine_journey.test.ts` |
| **Medicine Catalog Integrity** | FACILITY_ADMIN | Reject inventory referencing non-existent medicineId | PASS | `src/medicine_journey.test.ts` |
| **Medicine RBAC** | DOCTOR_MO | Block doctors from mutating inventory levels | PASS | `src/medicine_journey.test.ts` |
| **Medicine Citizen Isolation** | CITIZEN | Reject patient queries for unauthorized patientIds | PASS | `src/medicine_journey.test.ts` |
| **Notification Isolation** | CITIZEN | Reject reading/modifying notifications mapped to other users | PASS | `src/notification_journey.test.ts` |
| **Follow-Up Cross-Facility Modification** | DOCTOR_MO | Block staff from modifying follow-ups outside assigned facility | PASS | `src/notification_journey.test.ts` |
| **Follow-Up State Machine Enforcement** | DOCTOR_MO | Block transition attempts out of terminal states (COMPLETED) | PASS | `src/notification_journey.test.ts` |
| **Emergency Case Creation IDOR** | CITIZEN | Reject emergency creation attempts by non-clinicians | PASS | `src/emergency_journey.test.ts` |
| **Emergency Facility Scoping** | DOCTOR_MO | Reject state mutation by doctors at unassociated facilities | PASS | `src/emergency_journey.test.ts` |
| **Emergency Transfer Handoff** | SYSTEM | Validate destination facility assumes access upon TRANSFER_REQUESTED | PASS | `src/emergency_journey.test.ts` |
| **Emergency State Enforcement** | DOCTOR_MO | Deny illogical state jumps (e.g., DETECTED directly to RESOLVED) | PASS | `src/emergency_journey.test.ts` |
| **Emergency Concurrency Lock** | DOCTOR_MO | Prevent duplicate active emergencies for a single patient | PASS | `src/emergency_journey.test.ts` |
| **Care Plan Facility Isolation** | DOCTOR_MO | Reject care plan mutation by doctors at unassociated facilities | PASS | `src/care_journey.test.ts` |
| **Care Plan Duplicate Protection** | DOCTOR_MO | Block multiple active enrollments for the exact same condition string | PASS | `src/care_journey.test.ts` |
| **Terminal Care Plan State** | DOCTOR_MO | Deny arbitrary overrides to a DISCHARGED care plan | PASS | `src/care_journey.test.ts` |

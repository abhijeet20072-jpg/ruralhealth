# Project State: Rural Public Healthcare Platform (SIH26133)

**Date Updated:** 2026-09-04  
**Status:** Referral Management & Tracking Module Complete

---

## 1. Current Project Structure
The initial project skeleton has been created and conforms to the `ARCHITECTURE.md` specifications.

```text
SIH-Healthcare/
├── backend/                   
│   ├── src/                   
│   │   ├── audit.ts           
│   │   ├── auth.*             
│   │   ├── facility.*         
│   │   ├── patient.*          
│   │   ├── appointment.*      
│   │   ├── triage.*           
│   │   ├── record.*           
│   │   ├── referral.controller.ts # End-to-end referral workflow logic
│   │   ├── referral.routes.ts   # Protected referral endpoints
│   │   ├── referral.test.ts     # Boundary testing for referral lifecycle
│   │   ├── db.ts              
│   │   └── index.ts           
│   └── package.json           
├── frontend/                  
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ReferralDashboard.tsx # Incoming & Outgoing Referral management
│   │   │   ├── MedicalRecords.tsx 
│   │   │   ├── Triage.tsx         
│   │   │   ├── Appointments.tsx   
│   │   │   ├── QueueManagement.tsx
│   │   │   ├── Patients.tsx       
│   │   │   ├── PatientDetail.tsx  
│   │   │   ├── PatientManage.tsx  
│   │   │   ├── Dashboard.tsx  
│   │   │   ├── Facilities.tsx 
│   │   │   ├── FacilityDetail.tsx 
│   │   │   ├── FacilityManage.tsx 
│   │   │   ├── Login.tsx      
│   │   │   └── Register.tsx   
│   │   ├── App.tsx            
│   └── package.json           
├── deployment/                
│   └── docker-compose.yml 
├── scripts/
│   └── setup-db.sh            
└── docs/                      
    ├── ARCHITECTURE.md
    ├── PROJECT_STATE.md
    └── ...
```

## 2. Technologies Currently Being Used
* **Backend:** Node.js (v24 LTS), TypeScript, Express.js, `better-sqlite3`, bcryptjs, jsonwebtoken, zod.
* **Frontend:** React, TypeScript, Vite, React Router DOM, Axios, Tailwind CSS (v4).
* **Database:** Local SQLite (`dev.db`, `test.db`). 

## 3. Features Already Implemented
* **Authentication & Authorization:** Secure Login, RBAC.
* **Healthcare Facility Management:** Registration, Distance-based Search.
* **Patient Registration & Profiles:** Secure Registry, Clinical Authorization lock, Audit Logging.
* **Appointment & Queue Management:** Booking, Anti-Double-Booking Concurrency Checks.
* **Digital Triage (CDSS):** Deterministic Rules Engine, Safe Constraints.
* **Longitudinal Digital Medical Record (EHR):** Chronological cross-facility tracking.
* **Referral Management & Tracking Module:**
  * **End-to-End Workflow:** Tracks referrals seamlessly from `CREATED` -> `ACCEPTED` -> `SCHEDULED` -> `IN_PROGRESS` -> `COMPLETED`.
  * **Duplicate Prevention:** Safely blocks creating a duplicate referral if an active one already exists for the same patient at the target facility.
  * **Overdue Tracking:** Calculates exact `dueDate` thresholds based on priority (`EMERGENCY` = 4hrs, `URGENT` = 48hrs, `ROUTINE` = 14 days). An automated escalation dashboard tracks overdue assignments.
  * **Strict State Machines:**
    * *Referring* facility staff can only `CANCEL` an outgoing referral.
    * *Receiving* facility staff can `ACCEPT`, `REJECT`, or mark `COMPLETED`.
    * A referral mathematically cannot be marked `COMPLETED` without enforcing mandatory clinical `followUpNotes`.

## 4. Features That Are Incomplete
* **Clinical Modules (Advanced):** Teleconsultation (WebRTC), Inventory Management.
* **Production Database Migration:** PostgreSQL + PostGIS schema via TypeORM/Prisma will be required before production.

## 5. Known Bugs
* **None.** 

## 6. Current Database Status
* **Status:** Local SQLite schema active.
* **Details:** `users`, `facilities`, `facility_staff`, `patients`, `audit_logs`, `appointments`, `triage_assessments`, `medical_records`, and `referrals` tables. 

## 7. Current API Status
* **Status:** Auth, Facility, Patient, Appointment, Triage, EHR, and Referral modules complete.
* **Active Referral Endpoints:** 
  * `POST /api/referrals`
  * `PUT /api/referrals/:id/status`
  * `GET /api/referrals/dashboard`
  * `GET /api/referrals/overdue`

## 8. Current Frontend Status
* **Status:** Routing, Auth Context, and Views complete.
* **Details:** Added `ReferralDashboard.tsx` for facility staff to actively track and interact with Incoming and Outgoing transfers.

## 9. Current Testing Status
* **Status:** Robust coverage for all modules.
* **Details:** Backend `referral.test.ts` executes 8 deep edge cases (Network failure simulation, unassigned facility block, missing facility failure, complete lifecycle passing, forced follow-up notes validation, rejection tracking, cancellation tracking, duplicate prevention, and overdue tracking). Total 100% pass rate.

## 10. Deployment Status
* **Status:** Local developer containerization.
* **Details:** Ready to run `docker-compose up` for local state dependencies when migrating to full production schemas.

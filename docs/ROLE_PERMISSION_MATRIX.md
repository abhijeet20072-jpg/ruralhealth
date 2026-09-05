# Role & Permission Matrix

Arogya Connect uses a strict Role-Based Access Control (RBAC) mechanism. Authorization is evaluated on every API request. The frontend `RoleRoute` wrappers and conditional UI rendering dynamically match the backend constraints.

## Authentication & Identity Rules
1. **Server-Side Validation**: All roles and identity derivations (e.g., matching a `userId` to a `patientId` or `facilityId`) are executed purely on the backend. The API rejects client-supplied override attempts.
2. **Password Security**: Strong passwords (12+ chars, uppercase, lowercase, number, special char) are enforced for all users at registration via Zod schemas. Passwords are encrypted using bcrypt.

## Roles

### 1. ROLE_CITIZEN
The default role for public users accessing their own healthcare services.
**Scope:** Strictly limited to the citizen's own linked `patientId`.

**Allowed Workflows:**
* `GET /api/facilities/search` - View public healthcare facilities.
* `GET /api/appointments/availability` - Check doctor schedules.
* `POST /api/appointments/book` - Book an appointment. Backend enforces that `req.body.patientId` MUST strictly match the citizen's linked patient record.
* `GET /api/appointments/patient/:patientId` - View appointment history (enforced IDOR check).
* `PUT /api/appointments/:id/cancel` - Cancel appointment (enforced IDOR check).
* `GET /api/records/patient/:patientId` - View own EHR timeline (enforced IDOR check).
* `GET /api/triage/patient/:patientId` - View own triage assessments (enforced IDOR check).
* `GET /api/teleconsultations` - View own teleconsultations.
* `GET /api/patients/:id` - View own patient profile.

**Explicit Denials:** 
* Cannot search the patient directory.
* Cannot access the queue management system.
* Cannot modify clinical records.
* Cannot initiate referrals.
* Cannot view district metrics.

---

### 2. Clinical Staff (ROLE_DOCTOR_MO, ROLE_SPECIALIST, ROLE_ASHA, ROLE_ANM, ROLE_CHO)
Healthcare workers assigned to specific facilities.
**Scope:** Restricted to patients undergoing treatment/workflow within their assigned facility.

**Allowed Workflows:**
* `GET /api/patients/search` - Search the patient directory to pull up records during clinical visits.
* `GET /api/appointments/queue` - View today's active queue for their facility.
* `PUT /api/appointments/:id/queue-status` - Update queue state (e.g., from WAITING to IN_PROGRESS).
* `POST /api/triage` - Submit CDSS triage assessments.
* `POST /api/records` - Append clinical notes to the EHR. Backend enforces that the doctor is mapped to the facility where the record is being logged.
* `POST /api/referrals` - Escalate patients to other facilities.
* `PUT /api/referrals/:id/status` - Accept, reject, or complete incoming referrals for their facility.
* `GET /api/teleconsultations` - Access pending teleconsultation requests mapped to their facility or identity.

**Explicit Denials:**
* Cannot edit other facilities' queue statuses.
* Cannot update referrals belonging to unrelated facilities.
* Cannot register or edit structural facility metadata.

---

### 3. ROLE_FACILITY_ADMIN
Administrators managing the operational status of a specific hospital or clinic.
**Scope:** Strictly limited to their assigned `facilityId`.

**Allowed Workflows:**
* All Clinical Staff permissions (for managing queues and operational referral intake).
* `POST /api/facilities` - Can register structural data (though mostly handled by District Admin in this prototype).
* `PUT /api/facilities/:id` - Can update operating hours, services, and diagnostic availability for their own facility.

**Explicit Denials:**
* Cannot access cross-facility analytics.

---

### 4. ROLE_DISTRICT_ADMIN
Highest level operational role meant for regional oversight.
**Scope:** District-wide (No specific `facilityId` linkage).

**Allowed Workflows:**
* `GET /api/facilities/search?type=ALL` - View and search all structural facility data.
* `GET /api/patients/search` - District-wide patient directory access for continuity tracking.
* `GET /api/referrals/overdue` - Access to the global overdue/escalated referral dashboard.
* `POST /api/facilities` - Register new public health centers.
* `POST /api/facilities/assign-staff` - Map user accounts to specific facility scopes.

**Explicit Denials:**
* Does not default to having arbitrary clinical data modification rights (e.g. cannot append fake EHR records, because EHR records require an active `facilityId` context mapping which District Admins lack).

## Front-End UI Enforcement
* **Navigation:** `Sidebar.tsx` evaluates `user.role` to conditionally map available tools (e.g. Citizens get "My Appointments", Doctors get "Today's Queue").
* **Protected Routes:** `RoleRoute.tsx` strictly wraps component trees. Any direct URL manipulation (e.g., a citizen navigating to `/queue`) will be caught by `RoleRoute`, clearing the render and displaying a professional `Access Restricted` boundary page.
* **Component-Level Toggles:** Pages like `PatientDetail.tsx` and `MedicalRecords.tsx` execute inline checks (`user.role === 'ROLE_CITIZEN'`) to physically hide mutation actions (like "Run Triage" or "Add Clinical Record") from standard users.

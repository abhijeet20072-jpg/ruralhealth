# Bug & Regression Log

## Issue 1: IDOR Vulnerability in Appointment Booking
* **Feature**: Appointment Booking
* **Role**: CITIZEN
* **Bug**: A citizen could pass any `patientId` in the `POST /api/appointments/book` body and successfully schedule an appointment for another user.
* **Fix**: Added explicit backend check ensuring `req.user.role === 'ROLE_CITIZEN'` strict-matches the payload `patientId` to the identity `patientId`.
* **Status**: FIXED
* **Regression Test**: `src/appointment.test.ts` (Double-booking now fails on Auth for arbitrary IDs, preventing IDOR).

## Issue 2: Weak Phone Number Validation
* **Feature**: Patient Registration
* **Role**: ALL
* **Bug**: Users could submit `123` or empty whitespace as an Indian phone number.
* **Fix**: Implemented strict Zod Regex (`/^[6-9]\d{9}$/`) on the backend, and duplicate RegEx evaluation on `handleSubmit` inside `PatientManage.tsx`.
* **Status**: FIXED
* **Regression Test**: `src/patient_workflow.test.ts`

## Issue 3: Zod Validation Response Masking
* **Feature**: Form Validation
* **Role**: ALL
* **Bug**: Backend `patient.controller.ts` caught Zod validation errors but was obfuscating the `details` array, preventing the frontend from diagnosing validation failures correctly.
* **Fix**: Mapped `err.errors` and `err.message` explicitly to the JSON response body payload in the catch block.
* **Status**: FIXED
* **Regression Test**: Verified via `src/patient_workflow.test.ts` returning exact validation failure messages.

## Issue 4: Frontend Access Control Leakage
* **Feature**: App Routing
* **Role**: CITIZEN
* **Bug**: URL bar manipulation allowed Citizens to render clinical components like `/patients/register` or `/queue`.
* **Fix**: Implemented `RoleRoute.tsx` wrapping all clinical components.
* **Status**: FIXED
* **Regression Test**: Manual / Layout component boundaries tested in previous phase.

## Issue 5: Unauthorized Route Access to Citizen Records (IDOR)
* **Feature**: EHR Timeline and Referrals
* **Role**: CITIZEN
* **Bug**: The frontend blocked Citizens from their own records, and the backend did not securely allow Citizens to query `/api/records/patient/:id` or `/api/referrals/patient/:id`.
* **Fix**: Patched `record.routes.ts`, `triage.routes.ts`, `appointment.routes.ts`, and `referral.routes.ts` to explicitly allow `ROLE_CITIZEN`, and added strict `patientId === userId.patientId` matching in the controllers.
* **Status**: FIXED
* **Regression Test**: `src/citizen_journey.test.ts` (Test 7 verifies unauthorized IDOR fails, Tests 8/9 verify authorized fetch succeeds).

## Issue 6: Appointment Zod Validation Obfuscation
* **Feature**: Appointment Booking
* **Role**: ALL
* **Bug**: The `/api/appointments/book` endpoint obfuscated `err.errors` from Zod, rendering generic 400 Bad Request without field-level hints.
* **Fix**: Added `message: err.message` and `details: err.errors` to the appointment catch block.
* **Status**: FIXED
* **Regression Test**: `src/citizen_journey.test.ts` (Tested implicitly when debugging validation failures during E2E test setup).

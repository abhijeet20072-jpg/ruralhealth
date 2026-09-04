# Frontend Integration Report
**Date:** 2026-09-04
**Objective:** Restore genuine end-to-end data flow between React frontend and Express backend.

## 1. Problems Found
The SIH Gap Audit correctly identified a critical flaw where UI workflows were hardcoded to `const facilityId = 'demo-facility-id'` and `const patientId = 'demo-patient-id'`. This meant that all actions (Booking, Triage, EHR Appending, Referrals) would immediately be rejected with HTTP 403 Forbidden by the backend, as the authenticated user's actual database role would never match the fake "demo" IDs. The authentication context was also fundamentally disconnected from routing state.

## 2. Changes Made
*   **Deep Purge of Mock Strings:** Every single instance of `"demo-"` and `mock` was stripped from the frontend source code (excluding explicitly labeled test mocks).
*   **Database Linkage for Citizens:** Altered the `patients` schema to include a `userId TEXT UNIQUE` foreign key so that a logged-in `ROLE_CITIZEN` can actually pull up and manage their own patient profile.
*   **Enriched JWT AuthContext:** Overhauled the backend `/api/auth/me` and `/api/auth/login` endpoints to eagerly resolve context:
    *   For Clinical Staff: Looks up and injects `facilityId` into the token payload so the frontend knows where the staff member is assigned.
    *   For Citizens: Looks up their registered profile and injects `patientId` into the token.
*   **App.tsx Guard Rails:** Modified the `<ProtectedRoute>` to block mounting until the `AuthContext` has successfully verified the JWT and hydrated the `user` context.

## 3. APIs Connected & Fixed
*   `GET /api/auth/me`: Now supplies `facilityId` and `patientId`.
*   `GET /api/appointments/patient/:id`: Now correctly tied to the Citizen's actual `patientId`.
*   `POST /api/appointments/book`: Dynamic booking form created in `Appointments.tsx` avoiding fake variables.
*   `GET /api/appointments/queue`: Now reads the Staff member's `facilityId` from Context.
*   `GET /api/referrals/dashboard`: Now utilizes the Staff member's `facilityId` to load incoming/outgoing streams.
*   `POST /api/triage`: Now grabs the actual `patientId` from React Router parameters (e.g. `/patients/:id/triage`).
*   `POST /api/medical-records`: Context-binds `patientId` (URL parameter) and `facilityId` (Auth context).

## 4. Mock Data Removed
*   Deleted `demo-facility-id` from `ReferralDashboard.tsx`, `MedicalRecords.tsx`, and `QueueManagement.tsx`.
*   Deleted `demo-patient-id` from `Triage.tsx` and `Appointments.tsx`.

## 5. Tests Performed
*   Re-executed `vitest run` on the full backend integration suite.
    *   Confirmed schema changes (`userId` injection) did not break legacy Patient/Auth boundaries.
    *   **Result:** 53 / 53 tests passing (100% green).
*   Compiled `tsc -b && vite build` to guarantee zero missing imports or broken prop types.
    *   **Result:** Build Successful.

## 6. Remaining Issues
*   The system is now fully integrated mathematically, but the UI is heavily "barebones". We lack visual geographic maps (GIS), multiline WebRTC components, and voice APIs. These are purely feature additions for the next phase.

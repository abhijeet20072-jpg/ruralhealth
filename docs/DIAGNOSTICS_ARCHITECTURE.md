# Diagnostics Coordination Architecture

## Overview
The Diagnostics module coordinates diagnostic tests across referring facilities and diagnostic processing facilities. It integrates seamlessly into the existing Patient, Facility, and EHR infrastructure.

## Database Schema
- **diagnostic_catalog**: Standardized dictionary of diagnostic tests (e.g. CBC, X-Ray).
- **facility_diagnostics**: Pivot table configuring which facilities offer which tests (`isAvailable` boolean).
- **diagnostic_orders**: Central coordination table storing the order lifecycle, linking `patientId`, `orderingDoctorId`, `referringFacilityId`, and `diagnosticFacilityId`. Contains structured result fields and timestamp audits.

## State Machine
The workflow follows a strictly validated progression enforced by `updateStatus`:
`ORDERED` → `ACCEPTED` → `SAMPLE_COLLECTED` → `IN_PROGRESS` → `RESULT_READY` → `COMPLETED`
(Can be transitioned to `CANCELLED` or `REJECTED` at appropriate stages).

## Security Model (IDOR Protection)
- **Citizens**: Limited to querying orders matching their `userId`-derived `patientId`. Cannot modify states.
- **Ordering Facility**: Can order tests, cancel them, and review `RESULT_READY` orders (which pushes them to the EHR).
- **Diagnostic Facility**: Can update states and record results. Blocked from altering orders routed to other facilities.

## EHR Integration
When a Doctor reviews a `RESULT_READY` order, `reviewResult` executes a SQLite transaction that:
1. Marks the order `COMPLETED`.
2. Inserts a formatted `INVESTIGATION` record into the patient's `medical_records` containing the test name, quantitative/qualitative results, lab notes, and the doctor's clinical review.

## User Interfaces
- **OrderDiagnosticModal**: Pop-up in the Doctor's Consultation Workspace fetching available capable facilities.
- **DiagnosticOrders**: Dashboard for processing staff to manage incoming queues and enter results.
- **MyDiagnostics**: Citizen-facing read-only view of their orders and results.
- **PatientDetail (Diagnostics Tab)**: Doctor-facing patient history containing a one-click EHR review button.

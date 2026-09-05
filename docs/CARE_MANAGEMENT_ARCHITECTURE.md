# High-Risk + Chronic Care Management Architecture

## Overview
The Care Management module implements a longitudinal tracking system for patients with chronic diseases (e.g., Hypertension, Diabetes) or high-risk profiles. It acts as an orchestrator bridging the EHR, Triage, and Follow-up systems into a continuous, stateful lifecycle. 

## Database Schema
### `care_plans` Table
- **`patientId`, `facilityId`**: Roots the plan securely in the IDOR authorization constraints.
- **`assignedClinicianId`**: The specific clinician overseeing the plan.
- **`condition`**: String defining the generic condition (preventing rigid disease-specific schemas).
- **`riskLevel`**: Enumerated state (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **`status`**: Enforces lifecycle (`ACTIVE`, `ESCALATED`, `DISCHARGED`).

## Rule-based Risk Stratification
The system leverages `calculateRisk()` dynamically computing a baseline risk metric against age, comorbidities, recent emergency escalations, and cardiovascular profiles. Clinicians retain full agency to manually override the computed score.

## Follow-up Engine Integration
Rather than building a secondary asynchronous tracking mechanism, the Care Management module creates `PENDING` states inside the existing `follow_ups` ledger upon enrollment. This ensures that the unified `StaffFollowUps.tsx` dashboard accurately surfaces overdue interventions automatically across the entire clinical staff.

## Security Constraints
- **Strict Data Ownership**: Care plans strictly respect Facility limits. A clinician operating at Facility A receives a `403 Forbidden` if attempting to mutate or discharge a care plan originating at Facility B.
- **Immutability of Terminal States**: A `DISCHARGED` care plan cannot be mutated, overridden, or escalated, ensuring historical fidelity during audits.
- **Enrollment Duplication Locks**: To prevent duplicate tracking overhead, the module enforces a `409 Conflict` if an `ACTIVE` or `ESCALATED` care plan already exists for a patient with the exact same condition.

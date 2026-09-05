# Notifications & Follow-ups Architecture

## Overview
The Notifications & Follow-ups module establishes a robust, internal, and secure asynchronous alert system tailored for clinical workflows. It facilitates continuity of care by proactively tracking pending clinical tasks (Follow-ups) and dispatching appropriate operational/clinical alerts (Notifications).

## Database Schema
### `notifications` Table
Stores immutable alerts triggered by systemic events.
- **`recipientUserId`**: The mapped user targeted by the notification.
- **`type`**: Enum-constrained string defining the event (`APPOINTMENT_CONFIRMED`, `DIAGNOSTIC_READY`, `FOLLOW_UP_DUE`, etc.).
- **`relatedEntityType` / `relatedEntityId`**: Deep link references pointing back to the inciting medical artifact (e.g., the Referral or Appointment ID).
- **`readAt`**: Timestamp tracking read-state.

### `follow_ups` Table
A mutable, state-machine driven record for tracking continuous clinical tasks.
- **`patientId`, `facilityId`**: For strict RBAC constraints.
- **`dueDate`**: A critical temporal anchor dictating when the follow-up escalates.
- **`status`**: State machine controlling execution (`PENDING` -> `DUE` -> `COMPLETED` / `OVERDUE` -> `COMPLETED`).
- **`reason`**: Clinician's qualitative instructions.

## The State Reconciliation Engine
Rather than relying on fragile server-side `setInterval` timers or unreliable Node.js cron loops inside distributed environments, follow-ups are escalated idempotently via `POST /api/notifications/reconcile`.
- When invoked, the job transitions `PENDING` follow-ups to `DUE`, and `DUE` follow-ups to `OVERDUE` based strictly on `dueDate` vs `now()`.
- It generates appropriate notifications (`FOLLOW_UP_DUE`, `FOLLOW_UP_OVERDUE`).
- Idempotency is enforced by querying the `notifications` table for existing matching `relatedEntityId` and `type` combinations before insertion, ensuring patients are never spammed.

## Security Controls
- **Patient Isolation**: A `ROLE_CITIZEN` fetching `GET /api/notifications/follow-ups/patient/:id` is rigorously validated to ensure their `req.user.id` matches the `patientId`.
- **Facility Isolation**: `ROLE_DOCTOR_MO` staff can only view and complete follow-ups assigned to their strictly mapped `req.user.facilityId`. Modifying external follow-ups yields a `404 Not Found`.
- **Server Authority**: The `status` field transitions strictly on server-logic. Client mutations must invoke `/status` with approved enums, verified against terminal states (Cannot modify a `COMPLETED` follow-up).

## Offline Decision
Notifications & Follow-ups remain **Server-Authoritative**. Follow-up mutations require immediate concurrency validation and state machine verification, rendering Offline-Mutation too risky for database integrity (e.g., an offline doctor completing a follow-up that an admin already cancelled). However, the Consultation Workspace caches the creation intent of a Follow-Up, binding it to the atomic Consult completion, which aligns gracefully with the existing Offline Sync queue.

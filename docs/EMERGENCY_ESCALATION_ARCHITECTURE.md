# Emergency & Escalation Architecture

## Overview
The Emergency & Escalation module provides a robust mechanism to flag, track, and safely transfer high-risk patients. Unlike the rule-based triage system (which acts as a Clinical Decision Support System), the Emergency module is a deterministic, server-authoritative state machine managed by human clinicians.

## Database Schema
### `emergency_cases` Table
- **`patientId`, `facilityId`**: Anchors the emergency to strict Identity & Access Control boundaries.
- **`status`**: Enforces the rigid state transition lifecycle.
- **`detectedByUserId`, `acknowledgedByUserId`, `resolvedByUserId`**: Tracks clinical custody throughout the emergency.
- **`referralId`**: A foreign key pointing to the standard `referrals` module, created automatically during a `TRANSFER_REQUESTED` state.
- **`triageId`**: A foreign key pointing back to the inciting CDSS triage assessment (if applicable).

## State Machine
The module strictly enforces transitions on the backend:
`DETECTED` → `ACKNOWLEDGED` → `ESCALATED` → `TRANSFER_REQUESTED` → `TRANSFER_ACCEPTED` → `IN_TRANSIT` → `RECEIVED` → `RESOLVED`.
- Terminal states: `RESOLVED`, `CANCELLED`.
- Cross-Facility Handoffs: A `TRANSFER_REQUESTED` state automatically provisions a `URGENT` referral record. The destination facility must update the state to `TRANSFER_ACCEPTED`.

## Integrations
- **Notifications**: Escaping the risk of asynchronous polling, the module leverages the centralized `notification.service.ts` to instantly dispatch `TRIAGE_ESCALATION` and `SYSTEM_ALERT` notifications to all relevant staff at the current or destination facilities during state transitions.
- **Triage**: When the `triage.rules.ts` evaluates to `EMERGENCY`, the UI presents a "DECLARE EMERGENCY" CTA, chaining the Assessment ID directly to the newly forged Emergency record.

## Security Constraints
- **IDOR Protection**: The system rigorously verifies `req.user.facilityId`. If a case is in `TRANSFER_ACCEPTED` or `RECEIVED` status, only staff at the *Destination Facility* are legally authorized to mutate the emergency state.
- **Duplication Limits**: Prevents the creation of multiple concurrent emergencies for a single patient via a strict 409 Conflict rejection if an unresolved case exists.

## Offline Limitations
Because an emergency represents a highly volatile, shared-mutable state affecting ambulance logistics and inter-facility transfers, mutating an emergency case is explicitly **Online-Only**. Offline sync cannot safely guarantee that a transfer accepted by Facility B wasn't simultaneously cancelled by Facility A.

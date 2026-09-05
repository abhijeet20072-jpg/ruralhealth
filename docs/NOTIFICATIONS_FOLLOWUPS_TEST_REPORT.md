# Notifications & Follow-ups Test Report
**Date:** 2026-09-04

## Execution Summary
- **Test File:** `backend/src/notification_journey.test.ts`
- **Total Notification Assertions:** 7/7 Passed
- **Global Backend Suite:** 122/122 Passed
- **Frontend Compilation:** Passed (0 TypeScript errors)

## Scenarios Verified

| Scenario | Result | Location |
|----------|--------|----------|
| 1. Citizen appointment booking triggers APPOINTMENT_CONFIRMED | PASS | `notification_journey.test.ts` |
| 2. Citizen can accurately query unread count and execute Mark-as-Read | PASS | `notification_journey.test.ts` |
| 3. Doctor creating a Follow-Up persists accurately | PASS | `notification_journey.test.ts` |
| 4. Security: Cross-Facility Doctor prevented from mutating Follow-up | PASS | `notification_journey.test.ts` |
| 5. Reconciliation Engine successfully transitions DUE states | PASS | `notification_journey.test.ts` |
| 6. Reconciliation Engine is safely Idempotent (No duplicates) | PASS | `notification_journey.test.ts` |
| 7. Follow-Up State Machine validates transitions (Rejecting COMPLETED mutation) | PASS | `notification_journey.test.ts` |

## Identified Bugs & Mitigations During Implementation
1. **[BUG] Nested Transactions Crash**: When injecting `createNotification` into `appointment.controller.ts`, placing it inside an existing `db.transaction()` crashed SQLite due to unallowed nested transactions. **Fix:** Relocated the notification insertion post-commit and bypassed transaction wrapping.
2. **[BUG] Schema Validation Crash**: Reusing `POST /api/appointments/book` failed when `doctorId` was provided as `undefined`/`null`, as the Zod schema explicitly mandated a `uuid()`. **Fix:** Repaired E2E test to supply valid Doctor IDs.
3. **[BUG] Unicode Vite Failure**: As discovered in earlier modules, injecting string literals via HEREDOC destroys Vite configurations. **Fix:** Managed strings manually via Node.js replacements for `notification.service.ts`.

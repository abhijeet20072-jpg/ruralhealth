# Medicine Availability Test Report
**Date:** 2026-09-04

## Execution Summary
- **Test File:** `backend/src/medicine_journey.test.ts`
- **Total Medicine Assertions:** 11/11 Passed
- **Global Backend Suite:** 115/115 Passed
- **Frontend Compilation:** Passed (0 TypeScript errors)

## Test Scenarios Verified

| Scenario | Result |
|----------|--------|
| Fetch Medicine Catalog via Search query | PASS |
| Facility Admin A configures stock for Paracetamol | PASS |
| Facility Admin B configures stock for Amoxicillin | PASS |
| Attempt Facility Admin A -> Facility B stock modification (IDOR blocked) | PASS |
| Doctor attempts to modify stock (RBAC blocked) | PASS |
| Attempt negative stock configuration (DB constraint blocked) | PASS |
| Attempt invalid medicine ID insertion (DB referential blocked) | PASS |
| Doctor A verifies local current facility availability | PASS |
| Doctor A verifies cross-facility global availability (when local is 0) | PASS |
| Citizen securely views extracted medications from personal EHR | PASS |
| Citizen attempting to view another patient's medicines (IDOR blocked) | PASS |

## Identified & Fixed Bugs during Implementation
1. **[BUG] Vitest Unicode Escaping:** Node template string injection using EOF heredocs caused an `[PARSE_ERROR] Invalid Unicode escape sequence` error inside `medicine.controller.ts`. Replaced `\`` injection safely via raw string manipulation.
2. **[SECURITY] State Bypassing:** Initial schema considered `status` a client-provided field. Fixed by locking `status` to server-side derivations (`AVAILABLE`, `LOW_STOCK`, `OUT_OF_STOCK`) driven strictly by the `quantity` vs `threshold` calculus inside an SQLite transaction.

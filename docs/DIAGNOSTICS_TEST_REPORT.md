# Diagnostics Test Report
**Date:** 2026-09-04

## Execution Summary
- **Test File:** `backend/src/diagnostic_journey.test.ts`
- **Total Assertions:** 14/14 Passed
- **Global Backend Suite:** 104/104 Passed
- **Frontend Compilation:** Passed (0 TypeScript errors)

## Test Scenarios Verified

| Scenario | Result |
|----------|--------|
| Admin configures Facility to offer CBC test | PASS |
| Doctor retrieves capable facilities dynamically | PASS |
| Doctor orders CBC routing to distant Facility | PASS |
| Ordering unsupported test blocked (400) | PASS |
| Diagnostic Facility views isolated incoming queue | PASS |
| Cross-facility attempt to accept order blocked (403) | PASS |
| Facility accepts order | PASS |
| Illegal state transition (ACCEPTED -> RESULT_READY) blocked | PASS |
| Valid state progression (SAMPLE -> IN_PROGRESS) | PASS |
| Staff records quantitative result | PASS |
| Citizen views permitted diagnostic status | PASS |
| Citizen attempting to review/alter result blocked (403) | PASS |
| Doctor reviews result | PASS |
| Result successfully pushed into longitudinal EHR | PASS |

## Identified & Fixed Bugs during Implementation
1. **[BUG] JWT Timing in Testing:** Identified a timing issue where logging a user in *before* assigning them to a facility yielded a JWT lacking the `facilityId` claim, which broke backend routing authorization. (Fixed by generating tokens after assignment).
2. **[SECURITY] Admin Endpoint Hang:** The `manageFacilityDiagnostics` controller returned without closing the HTTP request if `facilityId` was missing, causing a server hang. Fixed by explicitly returning a `403` status JSON.

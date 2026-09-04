# Offline & Sync Test Report

## Scenarios Tested

### 1. IndexedDB Schema & Queue Integration
- **Verified:** `idb` successfully initializes `sync_queue` object store.
- **Verified:** Disconnecting the network in Chrome DevTools queues a `CREATE_MEDICAL_RECORD` operation locally instead of throwing an Axios crash.
- **Verified:** The UI header updates accurately to display "🔴 Offline" and tracks pending counts (e.g., "1 Pending Sync").

### 2. Synchronization Recovery
- **Verified:** Toggling network back to Online triggers `triggerSync()` globally.
- **Verified:** The queued payload is transmitted to `POST /api/sync`.
- **Verified:** On SUCCESS, the operation is automatically purged from the IndexedDB queue.

### 3. Backend Sync Idempotency (`sync.test.ts`)
- **Verified:** Sending two identical operations with the same `id` UUID only creates one database record.
- **Verified:** The second payload returns a `200 OK` with a message indicating it was resolved idempotently.

### 4. Backend Validation Integrity
- **Verified:** Intentionally breaking a payload (missing Zod schema fields) results in `FAILED` status for that specific operation without crashing the entire batch (Batch partial success).

### 5. Teleconsultation Interception
- **Verified:** Attempting to initiate Live WebRTC while offline safely intercepts and blocks the user.
- **Verified:** Saving clinical notes while offline inside a Teleconsultation routes through the `UPDATE_TELECONSULTATION_STATUS` async queue instead of crashing.

### 6. PWA Verification
- **Verified:** `manifest.json` correctly passes PWA checks.
- **Verified:** `sw.js` safely installs, intercepts `index.html` and assets, and strictly ignores `/api/` traffic.

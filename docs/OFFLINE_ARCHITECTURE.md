# Offline-First & Low-Connectivity Architecture

## 1. Offline Workflow
When connectivity is lost or degraded, healthcare workers in rural facilities can continue specific operations:
- **Triage (CDSS):** Intake workers can capture patient vitals and symptoms. Instead of a synchronous server evaluation, the payload is queued in IndexedDB.
- **Clinical EHR Drafts:** Clinicians can write clinical notes and diagnoses which are appended to the local queue.
- **Queue/Appointment Management:** Status transitions (e.g., IN_CONSULTATION) can be recorded.

## 2. Storage Strategy
- **IndexedDB (`idb`):** Chosen over `localStorage` due to storage capacity limits and structured querying requirements.
- **Schema:** Contains a `sync_queue` object store. 
- **Data Minimization:** ONLY active outgoing payloads are stored. We deliberately DO NOT dump the full EHR into the browser to prevent offline PHI leakage. 
- **Secret Protection:** JWTs and SSE WebRTC signaling tickets are explicitly excluded from offline caching.

## 3. Synchronization Strategy (The Sync Manager)
- When the `window.addEventListener('online')` fires, the `ConnectivityContext` iterates over the `sync_queue`.
- **Batching:** Up to 50 operations are batched in a single `POST /api/sync` request.
- **Server Authority:** The server maps each payload to its schema, verifies RBAC, validates facility relationships, and performs the SQL transaction.
- **Idempotency:** A client-generated UUID `operationId` is checked against a `processed_operations` table. Duplicate replays are ignored and returned as SUCCESS.

## 4. Conflict Resolution
- If an offline clinician attempts to update an appointment that has significantly diverged on the server (e.g., it was cancelled by another admin), the backend returns HTTP 409 `CONFLICT`.
- The frontend marks the operation as `CONFLICT` in IndexedDB, preventing endless retries and highlighting it for user intervention.

## 5. PWA (Service Worker)
- **App Shell Caching:** A Service Worker (`sw.js`) caches the core Vite bundle (`index.html`, CSS, JS chunks) to ensure the UI paints immediately without a network connection.
- **Sensitive Data Exclusion:** `fetch` events targeting `/api/*` bypass the Service Worker entirely. No JSON payloads are cached at the SW level.

# Offline Security Model

## Threat Model & Mitigations

### 1. Tampered IndexedDB Record (Privilege Escalation)
**Threat:** A malicious user modifies IndexedDB payloads to inject a different `facilityId` or `patientId`.
**Mitigation:** The server strictly ignores client-asserted context. `POST /api/sync` relies entirely on `req.user.facilityId` extracted from the cryptographically signed JWT. Operations on patients outside the facility trigger an IDOR block (403).

### 2. Duplicate Sync Operations (Replay Attack)
**Threat:** A poor network connection causes the client to send the same clinical draft payload multiple times, flooding the EHR.
**Mitigation:** Enforced Idempotency. Every payload receives a `clientOpId`. The server executes `INSERT INTO processed_operations (id) VALUES (?)` within the same transaction. Replays hit a primary key constraint or early-exit check.

### 3. Stolen / Compromised Devices
**Threat:** An adversary opens the tablet while offline and reads cached EHR data.
**Mitigation:** We implemented a strict **Data Minimization** strategy. Only pending *outgoing* queue items are stored in IndexedDB. Previous patient histories are NOT stored locally, severely limiting the blast radius of a device compromise.

### 4. Cache Poisoning / Sensitive Data Leakage
**Threat:** The PWA Service Worker caches API responses containing PHI, leaving it in browser cache.
**Mitigation:** The `sw.js` `fetch` handler explicitly filters `if (url.pathname.startsWith('/api/')) return fetch(event.request)`. No dynamic API routes are cached.

### 5. Stale Authorization
**Threat:** A clinician's role is revoked, but they attempt to sync data collected while offline.
**Mitigation:** Offline queues are resolved *at sync time*. If the token expired or the role changed, `processSync` rejects the transaction with 401/403. The server remains the absolute authority.

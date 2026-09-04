# Teleconsultation Security & Reliability Audit
**Date:** 2026-09-04

## 1. Threat & Authentication Model
The teleconsultation system handles extremely sensitive personal health information (PHI) over WebRTC and standard REST APIs.
* **Authentication Model:** Uses stateless Bearer JWTs verified against an asymmetric/symmetric secret (`JWT_SECRET`). 
* **SSE Authentication Risk:** The initial implementation dangerously accepted the primary JWT via the `?token=` query parameter. This caused the JWT to leak into browser history, proxy server logs, and HTTP Referer headers. 
* **Mitigation Implemented:** Rolled back the query parameter change. Implemented a Single-Use Ticketing System (`POST /api/teleconsultations/:id/ticket`). The client retrieves a 32-byte crypto-random ticket that expires in 30 seconds. The SSE connection authenticates using this ticket (`?ticket=...`), which is immediately burned upon connection. 

## 2. Participant Authorization & IDOR Analysis
* **Vulnerabilities Discovered:** The original endpoints (`updateStatus`, `joinSignaling`, `postSignaling`) assumed that if a user possessed a valid JWT, they could join *any* consultation UUID they knew.
* **Mitigation Implemented:** Rigid participant boundary checks were injected. A patient can ONLY access a consultation if `tc.patientId === req.user.patientId`. A doctor can ONLY access it if `tc.facilityId === req.user.facilityId` or `tc.doctorId === req.user.id`.

## 3. WebRTC Signaling Security
* **Signaling Abuse:** Unbounded SDP payloads could have been used to relay arbitrary large files or cause DoS.
* **Mitigation Implemented:** Added an absolute payload rejection limit of 10KB (`if (JSON.stringify(req.body).length > 10240)`). Protected signaling routes behind the same rigid IDOR boundaries mentioned above.

## 4. State Machine Security & EHR Integrity
* **Race Conditions:** A malicious client could have attempted to send concurrent `COMPLETED` updates.
* **Mitigation Implemented:** The `updateStatus` method now leverages `db.transaction()` locking the `teleconsultations` table UPDATE alongside the `medical_records` INSERT. The SQL `UPDATE` explicitly asserts `WHERE id = ? AND status = ?` (the previous status). If `changes === 0`, it aborts with a 409 Conflict.
* **EHR Integrity:** The `medical_records` insertion is atomically bound to the consultation state transition. A patient cannot inject notes; only the authorized clinician can execute the completion block.

## 5. Consent Enforcement
* **Implementation Limits:** The backend enforces `consentGranted === true` during the `POST /api/teleconsultations` origination. 
* **Policy Gap:** Software cannot cryptographically prove the human patient said "yes" unless biometric or cryptographic signatures are applied out-of-band. The software enforces the digital flag; institutional policy must enforce the clinical reality.

## 6. Sensitive Data & Logging
* No SDP payloads, ICE candidates, or plain-text clinical notes are output to `console.log`.
* `audit_logs` records only action metadata (`JOINED_SIGNALING`, `UPDATE_TELECONSULTATION_STATUS`) linked to UUIDs.

## 7. In-Memory Signaling & Multi-Instance Limitations
* **Limitation:** The SSE signaling router uses a local Node.js `Map`. 
* **Impact:** This restricts the backend to a single-instance deployment (no horizontal scaling). If Node.js restarts, active signaling sessions are dropped (though the client can simply reconnect to acquire a new ticket and resume).
* **Future Hardening:** For a load-balanced production environment, the in-memory Map must be replaced with a Pub/Sub mechanism like Redis.

## 8. Remaining Production Risks
* **Denial of Service (DoS):** While signaling payloads are capped at 10KB, there is no strict IP-level rate-limiting (e.g., `express-rate-limit`) preventing a bot from spamming the `/ticket` endpoint.
* **NAT Traversal:** The WebRTC implementation utilizes a free public STUN server (`stun.l.google.com:19302`). In strict symmetric corporate networks, this will fail. A dedicated TURN server is required for production.

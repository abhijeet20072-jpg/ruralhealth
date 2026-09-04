# Teleconsultation Architecture
**Date:** 2026-09-04

## 1. Overview
The SIH Teleconsultation Module provides a production-grade, low-bandwidth, and secure WebRTC-based workflow for remote clinical consultations. It enforces strict RBAC (Role-Based Access Control) limits and state transitions natively managed by the backend DB, ensuring no falsified success states can occur.

## 2. Data Model
* **Table:** `teleconsultations`
* **Schema:** `id`, `patientId`, `doctorId`, `facilityId`, `appointmentId`, `status`, `consultationType`, `scheduledAt`, `startedAt`, `endedAt`, `reason`, `priority`, `clinicalNotes`, `consentGranted`, `cancellationReason`.
* **State Machine Constraints:** `REQUESTED` -> `SCHEDULED` -> `READY` -> `IN_PROGRESS` -> `COMPLETED`. Direct skips (e.g. `REQUESTED` to `COMPLETED`) are strictly rejected by the controller.

## 3. WebRTC & Signaling Architecture
Instead of introducing heavy WebSocket libraries (`socket.io` or `ws`), the signaling mechanism harnesses native HTTP/1.1 **Server-Sent Events (SSE)**.
* **Join Stream:** The client opens an `EventSource` to `/api/teleconsultations/:id/signaling?token=...`. The backend authorizes the token and locks the connection open, keeping the user in the virtual "room".
* **Push Offers/Candidates:** The client executes standard `POST` requests containing SDP `offer`, `answer`, and `candidate` payloads. The Node.js controller iterates over connected `sseClients` in that specific room and pushes the payload directly down the active SSE pipes.
* **Connection Lifecycle:** Connection quality is polled locally via `RTCPeerConnection.iceConnectionState`.

## 4. Privacy, Consent & Authorization
* **Consent Requirement:** `consentGranted` is statically required during the `POST /api/teleconsultations` request.
* **Authorization:** Only the mapped patient or a Clinical staff member natively mapped to the `facilityId` can read or join the consultation session.

## 5. Low-Bandwidth & Fallback Design
* **Store-And-Forward:** If the `RTCPeerConnection` drops or times out (indicated by `Failed` connection status on the UI), the doctor still retains access to the clinical notes text area. They can conduct an asynchronous review and submit the findings, completing the consultation asynchronously.
* **STUN Server:** Utilizes `stun:stun.l.google.com:19302` for efficient hole-punching behind rural NAT environments.

## 6. Audit Logging & EHR
* Actions like `CREATE_TELECONSULTATION`, `UPDATE_TELECONSULTATION_STATUS`, and `JOINED_SIGNALING` trigger immediate entries in `audit_logs`.
* When transitioning a consultation to `COMPLETED`, the backend automatically generates a `medical_records` entry (EHR) containing the appended clinical notes, locking it indelibly to the patient's longitudinal history.

## 7. Security Considerations
* **WebRTC Leakage:** Secrets are never broadcasted. Signaling uses bearer JWTs dynamically extracted via Query parameter fallback specifically for SSE streams.
* **IDOR:** Explicit controller-level `req.user.facilityId` boundaries block users from iterating over and joining `/api/teleconsultations/123/signaling` unless they belong to the origin or destination facility.

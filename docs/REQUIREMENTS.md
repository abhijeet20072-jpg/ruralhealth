# Project Requirements & Technical Specification: Rural Public Healthcare Platform

**Project Code:** SIH26133  
**Title:** Accessibility and Quality of Public Healthcare Services, Particularly in Rural and Underserved Areas  
**Document Version:** 1.0.0  
**Status:** Architecture Draft / Under Review  

---

## 1. Executive Summary & Problem Overview

### 1.1 Context & National Landscape
In India's tiered public healthcare infrastructure, healthcare delivery is structured across progressive levels:
1. **Sub-Health Centres (SHC) / Ayushman Arogya Mandirs (AAM):** First contact point, staffed by Community Health Officers (CHOs), Auxiliary Nurse Midwives (ANMs), and Accredited Social Health Activists (ASHAs).
2. **Primary Health Centres (PHC):** 6-bed facilities staffed by 1–2 Medical Officers (MBBS), serving 20,000–30,000 population.
3. **Community Health Centres (CHC):** 30-bed secondary facilities with specialists (Physician, Surgeon, Gynaecologist, Paediatrician).
4. **Sub-Divisional & District Hospitals (SDH/DH):** Secondary/tertiary care facilities with diagnostic suites, surgical theatres, and multi-specialty OPDs.
5. **Medical Colleges & Apex Tertiary Centres:** High-acuity referral centres.

Despite national frameworks such as the **Ayushman Bharat Digital Mission (ABDM)**, **National Health Mission (NHM)**, and **Indian Public Health Standards (IPHS)**, rural populations face severe friction when seeking timely and specialized care.

### 1.2 Core Problems Identified
* **Specialist Doctor Shortage & Severe Maldistribution:** Over 70% of India's healthcare specialists reside in urban centres, leaving rural CHCs and PHCs with vacancy rates exceeding 60-70% for specialists.
* **Prohibitive Travel & Financial Toxicity:** Rural patients travel 40–120 km over rough terrain just for preliminary diagnostic visits or brief consultations, resulting in substantial wage loss and high Out-of-Pocket Expenditure (OOPE).
* **Fragmented, Paper-Based Medical Records:** Patients carry physical paper slips, X-ray films, and handwritten notes that get damaged, lost, or soiled. Physicians cannot view longitudinal clinical histories.
* **"Blind" & Uncoordinated Referrals:** Referrals currently operate as unidirectional paper notes ("Refer to DH"). There is zero visibility into specialist availability, bed occupancy, or diagnostic capabilities at the destination. Up to 40% of referred patients drop out or arrive only to be turned away.
* **Chaotic OPD Crowding & Queue Paralysis:** Due to lack of scheduling, hundreds of rural citizens congregate at PHCs/DHs at 7:00 AM, waiting 4–6 hours in unsanitary, unventilated hallways.
* **Unpredictable Medicine Stockouts:** While essential medicines are theoretically free under state essential drug policies, ground-level inventory visibility is opaque. Patients discover stockouts only after waiting hours at the pharmacy counter.
* **Delayed Diagnostic Turnaround:** Diagnostic specimens collected at PHCs either face logistical delays or reports remain uncollected for weeks, delaying clinical decisions.
* **Connectivity Fragility:** Rural health sub-centres frequently encounter zero-bandwidth or high-latency 2G/3G connections and power cuts, making cloud-only web applications unusable.
* **Language & Digital Literacy Divide:** A substantial proportion of rural citizens and elderly patients are non-literate or speak only regional dialects.

---

## 2. Target Users & Stakeholders

| User Group | Profile & Environment | Core Needs |
| :--- | :--- | :--- |
| **Rural Citizens / Patients** | Villagers, farmers, women, elderly, often semi-literate; basic Android phones or feature phones; episodic connectivity. | Voice-guided assistance, local language UI, zero-travel teleconsultation, transparent appointment tokens, digital prescription on phone. |
| **Frontline Workers (ASHA / ANM)** | Community health workers visiting homes; low-to-mid range Android smartphones; frequently operates completely offline in remote hamlets. | Fast offline screening checklists, high-risk maternal/child flags, automated visit tasklists, one-touch assisted teleconsult scheduling. |
| **Community Health Officers (CHO)** | Mid-level health providers based at Ayushman Arogya Mandirs (Sub-centres); tablets or laptops with intermittent broadband/cellular. | Clinical decision support, seamless store-and-forward/live teleconsult escalation to MBBS/Specialists, digital dispensing log. |
| **Medical Officers (PHC/CHC Doctors)** | General duty MBBS doctors managing heavy OPDs (100–250 patients/day); limited time per patient (2–3 minutes). | Rapid digital prescription/EHR entry, fast triage queue, electronic diagnostic ordering, inter-facility referral dispatch. |
| **Specialist Doctors (DH / Medical Colleges)** | Cardiologists, Gynaecologists, Paediatricians, Radiologists at tertiary hubs; desktop workstations with high-speed internet. | Structured teleconsult queue, high-resolution document/DICOM viewer, two-way counter-referral notes, schedule controls. |
| **Lab Technicians & Pharmacists** | Diagnostic & medicine dispensary staff at PHC/CHC/DH; barcode readers, desktop browsers, or tablets. | Fast sample accessioning, batch test report upload, automated stock deduction, critical stockout reorder triggers. |
| **Health Administrators (MOIC / CMO / State NHM)** | District Chief Medical Officers, Facility Superintendents, NHM Directors; analytics dashboards. | Real-time epidemiological heatmaps, referral closure rate tracking, facility utilization, medicine supply chain bottlenecks. |

---

## 3. Detailed Functional Requirements

### 3.1 Module 1: Assisted & Direct Teleconsultation
* **FR-1.1:** System shall support **Assisted Teleconsultation**, where an ASHA/CHO initiates and mediates a consultation between the patient and a remote Doctor.
* **FR-1.2:** System shall support **Direct Teleconsultation** for citizens equipped with personal smartphones.
* **FR-1.3:** System shall operate in dual mode:
  * **Store-and-Forward (Asynchronous):** CHO uploads patient vitals, clinical photographs, audio notes, and history. Doctor reviews and issues a signed e-prescription asynchronously.
  * **Real-Time Interactive (Synchronous):** Audio/video calling powered by WebRTC with adaptive bitrate streaming down to 16 kbps (audio-only fallback) for poor network connections.
* **FR-1.4:** Digital e-Prescriptions must generate a verifiable QR code, doctor digital signature, and automated SMS summary sent to the patient.

### 3.2 Module 2: Smart Appointment & Dynamic Queue Management
* **FR-2.1:** Citizen and ASHA app shall allow booking digital OPD slots for PHCs, CHCs, and District Hospitals.
* **FR-2.2:** System shall assign **Dynamic Digital Queue Tokens** reflecting estimated waiting time and current queue progress.
* **FR-2.3:** System shall provide **Triage-Weighted Queueing**: Emergency and high-risk patients (flagged by CDSS) automatically jump ahead of routine elective consultations.
* **FR-2.4:** Offline/SMS token generation for patients without smartphones or internet access.

### 3.3 Module 3: Longitudinal Electronic Health Records (EHR) & ABDM Integration
* **FR-3.1:** Patient profile creation with **ABHA (Ayushman Bharat Health Account)** ID creation and verification (via Aadhaar OTP / Mobile OTP).
* **FR-3.2:** System shall generate and ingest standardized **HL7 FHIR R4** clinical records (Patient, Encounter, Condition, DiagnosticReport, MedicationRequest, Observation).
* **FR-3.3:** Patient records shall maintain a unified timeline accessible across any public health tier with role-based authorization.
* **FR-3.4:** System shall support local-first encrypted offline caching of patient profiles on health worker devices.

### 3.4 Module 4: Digital Triage & Clinical Decision Support System (CDSS)
* **FR-4.1:** System shall provide rule-based, protocolized screening workflows aligned with national guidelines:
  * Maternal Health: High-Risk Pregnancy (HRP) indicators (severe anaemia, pre-eclampsia, gestational diabetes).
  * Child Health: Severe Acute Malnutrition (SAM), pneumonia signs, immunization delays.
  * Non-Communicable Diseases (NCD): Hypertension, Diabetes Mellitus, Oral/Cervical cancer suspicion.
  * Infectious Diseases: Tuberculosis (TB), Malaria, Dengue symptom screening.
* **FR-4.2:** System shall assign color-coded triage severity scores (Red: Emergency/Immediate Referral; Yellow: High Priority/Specialist Attention; Green: Routine Primary Care).
* **FR-4.3:** CDSS rules must execute completely offline on client devices using pre-compiled deterministic rule trees without requiring server roundtrips.

### 3.5 Module 5: Closed-Loop Referral Management
* **FR-5.1:** Doctor/CHO can issue an electronic referral containing complete clinical rationale, attached diagnostics, and required specialty.
* **FR-5.2:** System shall check real-time bed, ICU, and specialist availability at target facilities before confirming referral destination.
* **FR-5.3:** System shall track referral lifecycle states: `Initiated` -> `Transit` -> `Arrived/Admitted` -> `Treated` -> `Counter-Referred` -> `Closed`.
* **FR-5.4:** **Counter-Referral Loop:** Receiving specialist must submit a counter-referral note back to the referring CHO/PHC specifying follow-up regimen and rehabilitation instructions.
* **FR-5.5:** Drop-out alerts: If a high-risk referred patient fails to arrive at the destination within 48 hours, an automated alert triggers for the local ASHA worker to conduct a physical home visit.

### 3.6 Module 6: Diagnostic Test Coordination & Tele-Diagnostics
* **FR-6.1:** Medical Officers/CHOs can electronically prescribe lab and imaging tests.
* **FR-6.2:** Phlebotomists/ANMs can log sample collection at Sub-Centres/PHCs, generate unique specimen barcode/QR tags, and log dispatch to central CHC/DH labs.
* **FR-6.3:** Lab technicians can upload structured numeric results and PDF/image reports.
* **FR-6.4:** Automated flagging of abnormal lab values with immediate push notifications to the treating physician.

### 3.7 Module 7: Essential Drug Inventory Visibility
* **FR-7.1:** Real-time stock ledger at facility dispensaries tracking stock in hand, batch numbers, and expiry dates.
* **FR-7.2:** Inter-facility stock visibility: If a PHC runs out of an essential drug (e.g., Insulin, Metformin, Amoxicillin), the system indicates stock levels at the nearest CHC and DH.
* **FR-7.3:** Predictive low-stock alerts based on consumption velocity, preventing sudden stockouts.

### 3.8 Module 8: Chronic Disease & High-Risk Patient Surveillance
* **FR-8.1:** Registry of NCD and high-risk patients with scheduled follow-up calendars.
* **FR-8.2:** Automated vernacular voice/SMS reminders to patients for medication refills and follow-up tests.
* **FR-8.3:** ASHA daily task list generation showing geo-clustered houses requiring home visits.

### 3.9 Module 9: Public Health Administrative Dashboards
* **FR-9.1:** Geographic Information System (GIS) heatmaps visualizing disease clusters, maternal risk densities, and referral corridors.
* **FR-9.2:** Operational metrics tracking doctor teleconsultation volumes, OPD wait times, and referral turnaround times.
* **FR-9.3:** Facility readiness index highlighting equipment downtime, medicine stockouts, and specialist vacancy gaps.

---

## 4. Non-Functional Requirements (NFRs)

### 4.1 Rural & Low-Connectivity Requirements (Offline-First)
* **NFR-1.1:** Frontline mobile application (ASHA/ANM/CHO) must support **100% offline data capture and clinical triage**.
* **NFR-1.2:** System must maintain local persistent storage (SQLite/WatermelonDB) on client devices.
* **NFR-1.3:** Opportunistic auto-sync: Client automatically syncs changes when network connectivity (even intermittent 2G) is detected.
* **NFR-1.4:** Network payloads during synchronization must be delta-compressed (Brotli/gzip) and strictly budgeted under **50 KB per batch**.
* **NFR-1.5:** Audio/video teleconsultation must automatically degrade to audio-only (16 kbps) when packet loss exceeds 20%, and fail over to store-and-forward audio message recording if connection drops entirely.

### 4.2 Multilingual & Accessibility Requirements
* **NFR-2.1:** Complete UI localization in **English, Hindi, and regional Indic languages** (e.g., Bengali, Marathi, Telugu, Tamil, Gujarati, Odia).
* **NFR-2.2:** Integrated **Text-to-Speech (TTS)** and **Voice-to-Text (STT)** to allow illiterate and semi-literate users to navigate and input symptoms.
* **NFR-2.3:** Universal iconography, high-contrast typography, and intuitive color schemes (green/amber/red) complying with **WCAG 2.1 Level AA**.

### 4.3 Performance & Scalability
* **NFR-3.1:** Client UI response time on budget devices (Android Go, 2GB RAM) must be `< 100ms` for offline interactions.
* **NFR-3.2:** Backend API P99 response time must be `< 300ms` under normal load.
* **NFR-3.3:** System architecture must support horizontal autoscaling handling `10,000+` concurrent teleconsultations and `100,000+` daily sync transactions.

### 4.4 Security, Privacy & Regulatory Compliance
* **NFR-4.1:** Full compliance with India's **Digital Personal Data Protection (DPDP) Act 2023** and **ABDM Health Data Management Policy**.
* **NFR-4.2:** End-to-end encryption (E2EE) for WebRTC teleconsultation sessions.
* **NFR-4.3:** Data at rest encrypted using **AES-256-GCM**; data in transit encrypted using **TLS 1.3**.
* **NFR-4.4:** Attribute-Based & Role-Based Access Control (ABAC/RBAC): Health workers can only access clinical data for patients within their designated catchment area or active referral path.
* **NFR-4.5:** Immutable audit logs tracking every view, export, and edit of patient health records.

---

## 5. Measurable Outcomes & Impact Metrics

| Metric Category | Baseline (Current Reality) | Target with Solution | Method of Measurement |
| :--- | :--- | :--- | :--- |
| **Referral Completion Rate** | < 45% (majority lost to follow-up) | **> 85%** closed-loop completion | System referral tracking from initiation to counter-referral note. |
| **Unnecessary Travel Reductions** | Patients travel 40–100 km for minor queries | **60% reduction** in avoidable travel | Teleconsultation resolution rate at SHC/PHC level without physical escalation. |
| **Average OPD Waiting Time** | 3 to 5 hours at CHC/DH | **< 45 minutes** | Token issue timestamp to doctor consultation completion timestamp. |
| **High-Risk Maternal Identification** | Often identified late in 3rd trimester | **100% screened** in 1st trimester | CDSS triage screening audit logs on ASHA/ANM devices. |
| **Essential Medicine Stockout Duration** | 2 to 4 weeks before replenishment | **< 48 hours** warning buffer alert | Automated inventory tracking and inter-facility stock transfer metrics. |
| **Diagnostic Report Turnaround Time** | 5 to 10 days for remote patients | **< 24 hours** for routine, **< 2 hrs** for stat | Lab order timestamp to digital report upload & doctor notification. |

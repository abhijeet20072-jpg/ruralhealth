# User Roles, Stakeholder Matrix & Access Control: Rural Public Healthcare Platform

**Project Code:** SIH26133  
**Document Version:** 1.0.0  
**Status:** User Persona & RBAC Specification  

---

## 1. Stakeholder Ecosystem & Healthcare Tiers

The public healthcare delivery model in India functions in an interdependent hierarchy. The platform coordinates interactions between grassroots community workers, primary point-of-care clinicians, secondary hospital specialists, diagnostic technicians, and administrative decision-makers.

```
Community Level        ---> Sub-Centre / AAM        ---> Primary Health Centre (PHC) ---> Community Health Centre (CHC) ---> District Hospital (DH)
(ASHA / Citizen)            (ANM / CHO)                  (Medical Officer MBBS)           (Specialists: Gyn/Ped/Surg)         (Multi-specialty / Tertiary)
```

---

## 2. Comprehensive Stakeholder Matrix

| Role Identifier | Healthcare Tier | Primary Device & Form Factor | Core Responsibilities | Offline Capability Required |
| :--- | :--- | :--- | :--- | :--- |
| **ROLE_CITIZEN** | Community / Household | Basic Smartphone (Android PWA/App) or IVR/SMS | Self-registration, booking OPD appointments, viewing e-prescriptions, receiving token alerts, direct teleconsult. | Partial (View cached records & tokens) |
| **ROLE_ASHA** | Village / Community Outreach | Budget Android Smartphone (Android 8+, 2GB RAM) | Household surveys, ANC/PNC tracking, NCD screening checklists, assisted appointment & teleconsult booking, follow-up home visits. | **Full (100% offline data entry & triage)** |
| **ROLE_ANM** | Sub-Health Centre (Village level) | Android Tablet / Smartphone | Immunization sessions, maternal checkups, point-of-care rapid testing (Hb, urine, blood sugar), initial clinical triage. | **Full (100% offline clinics)** |
| **ROLE_CHO** | Ayushman Arogya Mandir (Sub-Centre) | Android Tablet / Windows Laptop | Primary teleconsultation initiator, mid-level clinical management, essential drug dispensing, initiating specialist referrals. | **High (Offline triage + Opportunistic sync)** |
| **ROLE_DOCTOR_MO** | Primary Health Centre (PHC) / CHC | Desktop Workstation / Laptop | General OPD consultations, reviewing triage alerts, ordering lab tests, approving referrals, prescribing medications. | Medium (Intranet LAN support during outages) |
| **ROLE_SPECIALIST** | District Hospital / Medical College | High-Resolution Desktop Workstation | Specialist teleconsultations, reviewing complex referrals, reviewing tele-radiology/ECGs, issuing counter-referrals. | Low (Online required for live teleconsult) |
| **ROLE_LAB_TECH** | PHC / CHC / District Hospital | Desktop Browser / Tablet with Barcode Scanner | Sample accessioning, executing diagnostic tests, uploading quantitative values and PDF/DICOM reports. | Medium (Batch result upload when reconnected) |
| **ROLE_PHARMACIST** | Facility Dispensary (PHC/CHC/DH) | Desktop Browser / Android Barcode Tablet | Dispensing prescribed drugs, updating stock ledgers, logging incoming consignments, monitoring batch expiries. | Medium (Dispense buffer tracking offline) |
| **ROLE_FACILITY_ADMIN** | Facility Level (MOIC / Superintendent) | Desktop Workstation | Roster management, doctor queue allocation, local inventory transfers, bed occupancy monitoring. | Low (Web-based management) |
| **ROLE_DISTRICT_ADMIN** | District / State (CMO / NHM Director) | Desktop Workstation / Large Display Wallboards | Monitoring epidemiological trends, tracking referral drop-outs, auditing maternal deaths/emergencies, resource allocation. | Low (Cloud BI & analytics) |

---

## 3. Detailed Role Profiles & Responsibilities

### 3.1 Citizen / Patient (`ROLE_CITIZEN`)
* **Context:** Rural citizens often face economic hardship, limited tech literacy, and language barriers.
* **Key Tasks:**
  * Link or generate their **ABHA ID** using mobile number or Aadhaar OTP.
  * Book OPD tokens at nearby PHCs/CHCs to avoid waiting in physical queues.
  * Join teleconsultation sessions directly from home (if smartphone and connectivity are available).
  * Access digital prescriptions, lab reports, and doctor instructions translated into their mother tongue.
  * Receive automated vernacular voice/SMS reminders for upcoming follow-ups and medicine refills.

### 3.2 ASHA Worker (`ROLE_ASHA`)
* **Context:** Village women serving as health activists; operate door-to-door in areas with zero cellular reception.
* **Key Tasks:**
  * Conduct door-to-door population enumeration and maternal/NCD screening.
  * Fill offline digital screening forms (e.g., assessing pregnant women for danger signs: swelling, bleeding, high BP).
  * Book assisted OPD appointments and assisted teleconsultations at the Ayushman Arogya Mandir for villagers without smartphones.
  * Receive automated daily follow-up task lists for high-risk patients who were discharged or missed hospital visits.

### 3.3 Community Health Officer (`ROLE_CHO`)
* **Context:** B.Sc. Nursing or Ayurvedic practitioners trained in primary healthcare, posted at rural Sub-Centres.
* **Key Tasks:**
  * Perform primary physical examinations, record vitals (BP, SpO2, Pulse, Blood Glucose), and log them in the digital EHR.
  * Trigger the **CDSS Engine** to generate risk stratification.
  * Connect the patient to an MBBS Medical Officer or District Specialist via **Assisted Teleconsultation**.
  * Dispense approved essential medicines from the Sub-Centre drug kit based on the doctor's electronic prescription.
  * Escalate emergency cases with structured electronic referral bundles to the nearest CHC or District Hospital.

### 3.4 Medical Officer (`ROLE_DOCTOR_MO`)
* **Context:** MBBS doctors handling high-volume outpatient clinics at PHCs or CHCs.
* **Key Tasks:**
  * Rapidly review patient triage scores, history, and vitals entered by CHOs/ANMs.
  * Conduct quick consultations (in-person or teleconsult) and generate standardized e-prescriptions.
  * Order lab investigations and review returned digital test results.
  * Escalate complicated cases requiring secondary/tertiary care to hospital specialists via the referral module.

### 3.5 Specialist Doctor (`ROLE_SPECIALIST`)
* **Context:** Post-graduate specialists (MD/MS/DNB) in Obstetrics/Gynaecology, Paediatrics, Internal Medicine, Orthopaedics, and Surgery located at District Hospitals.
* **Key Tasks:**
  * Accept and conduct scheduled specialist teleconsultations booked by primary centres.
  * Review high-resolution clinical images, tele-ECG strips, and radiology uploads.
  * Accept and prioritize incoming referral admissions before the patient arrives, ensuring critical resources (ICU beds, blood) are prepared.
  * Issue a comprehensive **Counter-Referral Note** upon patient discharge, outlining maintenance therapy and follow-up directives for the local CHO/ASHA.

### 3.6 Lab Technician (`ROLE_LAB_TECH`)
* **Context:** Operating diagnostic counters at PHC, CHC, or District Hospital labs.
* **Key Tasks:**
  * Scan barcode/QR codes on specimen containers collected at field clinics.
  * Enter structured diagnostic findings (e.g., Hemoglobin, Blood Sugar, Widal test, Lipid profile).
  * Upload radiology images (X-rays, ultrasounds) or automated analyzer output files.
  * Immediately flag abnormal, panic-level values to alert the referring clinician in real time.

### 3.7 Pharmacist (`ROLE_PHARMACIST`)
* **Context:** Managing the medicine dispensing room and warehouse stock.
* **Key Tasks:**
  * Scan patient e-prescription QR code to verify validity and prevent duplicated dispensing.
  * Mark prescribed items as dispensed, automatically decrementing the facility's digital inventory ledger.
  * Record incoming drug batches, track expiry dates, and manage damaged stock write-offs.
  * Trigger inter-facility medicine transfer requests when stock levels breach minimum safety thresholds.

### 3.8 Healthcare Facility Administrator (`ROLE_FACILITY_ADMIN`)
* **Context:** Medical Officer In-Charge (MOIC) or Hospital Superintendent overseeing day-to-day operations.
* **Key Tasks:**
  * Manage doctor duty rosters, OPD session timings, and teleconsultation schedules.
  * Monitor real-time queue lengths and deploy additional consultation desks if wait times exceed benchmarks.
  * Oversee facility medicine stock levels and approve bulk requisition orders.

### 3.9 District / State Health Administrator (`ROLE_DISTRICT_ADMIN`)
* **Context:** Chief Medical Officer (CMO), District Health Officer (DHO), or State National Health Mission (NHM) Director.
* **Key Tasks:**
  * Inspect district-wide epidemiological heatmaps to detect emerging infectious outbreaks (e.g., malaria, cholera).
  * Evaluate referral corridors and track patient drop-out rates across primary-to-tertiary pipelines.
  * Monitor doctor attendance, teleconsultation resolution rates, and diagnostic equipment downtime.

---

## 4. Role-Based Access Control (RBAC) Matrix

| Module / Operation | Citizen | ASHA | ANM | CHO | Doctor (MO) | Specialist | Lab Tech | Pharmacist | Facility Admin | District Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Self Record (View/Export)** | **CRUD** | - | - | - | - | - | - | - | - | - |
| **Assigned Patient Clinical EHR** | - | Read/Create (Drafts) | Read/Write (Vitals) | Read/Write (Full) | Read/Write (Full) | Read/Write (Full) | Read Only (Orders) | Read Only (Rx) | Read (Meta) | Read (Anonymized) |
| **Offline Screening / Triage** | - | Create | Create | Create/Review | Review/Override | Review | - | - | Read | Read (Aggregated) |
| **Book OPD Token / Appointment** | Create | Create | Create | Create | Create | - | - | - | Manage | Read |
| **Conduct Teleconsultation** | Join | Assist | Assist | Assist/Host | Host | Host | - | - | - | - |
| **Write e-Prescription** | - | - | - | Basic (Restricted) | Full | Full | - | - | - | - |
| **Initiate Inter-Facility Referral** | - | - | Suggest | Create | Create | Create | - | - | - | - |
| **Acknowledge / Admit Referral** | - | - | - | - | Read | Accept/Triage | - | - | Read | Read |
| **Counter-Referral Completion** | - | - | - | Read (Action) | Read (Action) | Write | - | - | - | - |
| **Order Diagnostic Tests** | - | - | Point-of-Care | Create | Create | Create | - | - | - | - |
| **Upload Lab Reports / Images** | - | - | Point-of-Care | - | - | - | Create/Write | - | - | - |
| **Dispense Medicine / Log Rx** | - | - | Kits | Kits | - | - | - | Write | Read | Read |
| **Inventory Stock Management** | - | - | - | Sub-Centre Stock | - | - | - | Full (Facility) | Full (Facility) | Read (District) |
| **Duty Roster & Queue Control** | - | - | - | - | - | - | - | - | Full | Read |
| **Epidemiological GIS Dashboard** | - | - | - | - | - | - | - | - | Facility Stats | Full District |

---

## 5. User Personas & Clinical Journey Maps

### Persona 1: Sunita Devi (Rural Citizen / Patient)
* **Demographics:** 28-year-old pregnant mother (second trimester), resides in a remote village 45 km from the nearest Community Health Centre.
* **Technology:** Semi-literate; possesses no personal smartphone; family has a basic feature phone.
* **Journey:**
  1. ASHA worker Rekha visits Sunita’s home, checks vitals, and logs her in the offline app.
  2. The CDSS flags Sunita for **High-Risk Pregnancy (HRP)** due to severe pallor (Hb 6.8 g/dL) and high blood pressure (145/95 mmHg).
  3. Rekha books an assisted teleconsultation slot at the nearby Ayushman Arogya Mandir (AAM) with CHO Kavita.
  4. At the AAM, CHO Kavita initiates a video teleconsult with Dr. Priya (Gynaecologist at District Hospital).
  5. Dr. Priya prescribes Iron Sucrose IV infusion and anti-hypertensive therapy, and generates an electronic referral to the District Hospital for emergency ultrasound.
  6. Sunita receives an SMS token; when she arrives at the District Hospital, her record and ultrasound order are already active—zero waiting in the general OPD queue.

### Persona 2: Rekha Bai (Frontline ASHA Worker)
* **Demographics:** 36-year-old community health worker; operates on a low-end Android phone with unreliable 2G connectivity.
* **Journey:**
  1. Opens the app in the morning; the local SQLite database loads instantly without internet.
  2. Reviews her daily home-visit worklist: 4 antenatal checkups, 2 diabetic follow-ups, and 1 referral drop-out verification.
  3. Conducts the checkups, filling in voice-assisted screening checklists in Hindi.
  4. Reaches the village panchayat building where cell reception is briefly available; the app’s background sync manager transmits the day's records to the central server in a 28 KB compressed delta payload.

### Persona 3: Dr. Ramesh Verma (Specialist Doctor - District Hospital)
* **Demographics:** 48-year-old MD (Internal Medicine) at the District Hospital, overburdened with physical OPD patients.
* **Journey:**
  1. Logs into the Specialist Web Dashboard at 2:00 PM (allocated teleconsultation hour).
  2. Reviews a prioritized queue of 8 assisted teleconsultation requests from rural CHOs.
  3. Clicks on a high-priority yellow-flagged case: reviews the patient’s vital history, ECG photograph, and blood glucose chart uploaded by the CHO.
  4. Connects to the CHO and patient via WebRTC; adjusts insulin dosage and types a digital prescription.
  5. Completes the consultation in 6 minutes; the prescription immediately syncs to the CHO's tablet for medicine dispensing.

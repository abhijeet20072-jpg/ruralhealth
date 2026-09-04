# Rural Public Healthcare Platform (SIH26133)

An offline-resilient, tiered healthcare platform designed for rural India, addressing the extreme variations in digital infrastructure (from zero-connectivity tribal hamlets to high-speed fiber at District Hospitals). 

This platform empowers frontline healthcare workers (ASHAs, ANMs, CHOs) with offline-first mobile applications, local Clinical Decision Support Systems (CDSS), and seamless teleconsultation capabilities with specialists at Primary Health Centres (PHCs) and District Hospitals (DHs).

## Features
* **Offline-First Resilience**: Work offline at sub-centres and sync automatically when internet is available.
* **Triage & CDSS**: AI-assisted rule engines for maternal and pediatric screening.
* **Teleconsultation**: Seamless WebRTC-based video consultations bridging rural patients and urban specialists.
* **Robust RBAC**: Secure role-based access control for Citizens, ASHAs, Doctors, Lab Techs, and Admins.
* **Multilingual UI**: Accessible interface supporting regional languages.

## 🏗 System Architecture

The platform utilizes a **Local-First, Distributed, Tiered Architecture**:

```mermaid
graph TB
    subgraph Client_Edge_Layer["Client & Edge Layer (Sub-Centres & Field)"]
        A1["Frontline Worker App (ASHA/ANM/CHO)<br/>• Offline SQLite / WatermelonDB<br/>• Local Rule Engine (CDSS)<br/>• Sync Manager"]
        A2["Citizen Mobile App & Web Portal<br/>• PWA / Android<br/>• Voice & Multilingual UI<br/>• Token & EHR Wallet"]
        A3["PHC / CHC Edge Gateway (Optional Local Cache)<br/>• Local LAN Server for Zero-Internet OPD"]
    end

    subgraph High_Bandwidth_Clients["High-Bandwidth Clients (DH & Medical Colleges)"]
        B1["Specialist Doctor Web Dashboard<br/>• Teleconsultation & DICOM Viewer<br/>• Counter-Referral Portal"]
        B2["Diagnostic Lab & Pharmacy Workstations<br/>• Barcode Scanning & Stock Ledger"]
        B3["District Health Admin Dashboard<br/>• GIS Epidemiological Heatmaps"]
    end

    subgraph API_Edge_Gateway["Secure Gateway & Communication Layer"]
        GW["API Gateway & Reverse Proxy<br/>• Rate Limiting & SSL Termination<br/>• ABAC/RBAC Auth Verification (JWT)"]
    end

    subgraph Core_Services["Cloud Core Microservices"]
        C1["Identity & ABHA Service<br/>• Auth, ABHA Linkage"]
        C2["Teleconsultation & WebRTC<br/>• Video Signaling & Chat"]
        C3["Clinical Core (EHR & CDSS)<br/>• Triage rules, Health Records"]
        C4["Referral & Queue Engine<br/>• Bed Tracking & Live Queues"]
    end

    subgraph Data_Storage["Distributed Data & Analytics"]
        D1[("Transactional DB (PostgreSQL + PostGIS)")]
        D2[("Fast Cache (Redis)")]
    end

    %% Connections
    A1 <-->|Async Sync / WebSockets| GW
    A2 <-->|HTTPS| GW
    A3 <-->|Sync| GW
    
    B1 <-->|HTTPS / WebSockets| GW
    B2 <-->|HTTPS| GW
    B3 <-->|HTTPS| GW
    
    GW <--> C1 & C2 & C3 & C4
    
    C1 & C2 & C3 & C4 <--> D1
    C2 & C4 <--> D2
```

## Tech Stack
* **Frontend**: React, TypeScript, Vite, Tailwind CSS (v4)
* **Backend**: Node.js (v24), Express, TypeScript, `tsx`
* **Database**: PostgreSQL (Docker), PostGIS, Redis (currently utilizing SQLite for active local dev phase)
* **Testing**: Vitest, Supertest

## Getting Started

```bash
# 1. Install dependencies at root, frontend, and backend
npm install
cd frontend && npm install
cd ../backend && npm install

# 2. Set up environment variables
# Copy .env configuration as needed in the backend/ folder

# 3. Start development servers concurrently
npm run dev
```

Detailed architectural blueprints, requirement matrices, and project state documents can be found in the `/docs` directory.

# Medicine Availability & Coordination Architecture

## Overview
The Medicine Availability module fulfills the SIH requirement for dynamic inventory tracking and cross-facility medicine availability. It ensures continuity of treatment by allowing doctors and citizens to locate prescribed medicines even when the primary facility is out of stock.

## Database Schema
- **medicine_catalog**: Master dictionary containing structured data (`medicineId`, `genericName`, `displayName`, `dosageForm`, `strength`, `category`).
- **facility_inventory**: A pivot table managing the stock levels for each facility. Tracks `quantity`, `threshold`, `unit`, and a derived `status` (AVAILABLE, LOW_STOCK, OUT_OF_STOCK).
- **inventory_audit_logs**: Immutable history tracking every inventory change (`oldQuantity`, `newQuantity`, `operationType`, `actorId`).

## Inventory Integrity & Concurrency
- Uses SQLite transactions for all stock updates.
- Hard limits (`CHECK (quantity >= 0)`) reject negative stock at the database level.
- Status is derived entirely server-side based on the `quantity` vs `threshold` rules. Client payloads attempting to bypass these derivations are ignored.

## Workflow Integration
- **Facility Admin**: Uses `/medicines/inventory` to update their specific facility's stock. Cross-facility updates are strictly blocked by native JWT-derived `facilityId` validation.
- **Doctor Consultation**: The `ConsultationWorkspace` includes a `CheckMedicineAvailabilityModal`.
  - Step 1: Doctor inputs a partial name.
  - Step 2: System searches `medicine_catalog` and returns matches.
  - Step 3: Doctor selects a medicine.
  - Step 4: System queries `/medicines/availability?medicineId=...` and retrieves facilities with `quantity > 0`, highlighting them for cross-facility coordination.
- **Citizen Journey**: The `/medicines/patient/:patientId` endpoint parses raw JSON `PRESCRIPTION` data stored in the `medical_records` timeline and extracts all historical medications, allowing the citizen to view their structured dosage rules and instructions in `MyMedicines.tsx`.

## Security Model
- **IDOR Protection**: Facility Admins physically cannot manipulate another facility's inventory because the mutation controller `updateInventory` enforces `req.user.facilityId`.
- **RBAC**: Doctors cannot modify inventory (403 Forbidden). Citizens cannot search arbitrary facility stock unless viewing their personal prescription scope.
- **Offline Sync Status**: Because inventory is a shared mutable state subject to severe race conditions, offline stock modification is structurally prohibited in this phase. Inventory can only be manipulated online. (Doctors can still prescribe offline).

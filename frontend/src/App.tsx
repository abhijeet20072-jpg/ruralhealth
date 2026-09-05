import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConnectivityProvider } from './context/ConnectivityContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Facilities } from './pages/Facilities';
import { FacilityDetail } from './pages/FacilityDetail';
import { FacilityManage } from './pages/FacilityManage';
import { Patients } from './pages/Patients';
import { PatientDetail } from './pages/PatientDetail';
import { PatientManage } from './pages/PatientManage';
import { Appointments } from './pages/Appointments';
import { QueueManagement } from './pages/QueueManagement';
import { Triage } from './pages/Triage';
import { MedicalRecords } from './pages/MedicalRecords';
import { ReferralDashboard } from './pages/ReferralDashboard';
import { ConsultationWorkspace } from './pages/ConsultationWorkspace';
import { MyReferrals } from './pages/MyReferrals';
import { MyDiagnostics } from './pages/MyDiagnostics';
import { DiagnosticOrders } from './pages/DiagnosticOrders';
import { FacilityMedicines } from './pages/FacilityMedicines';
import { MyMedicines } from './pages/MyMedicines';
import { MyNotifications } from './pages/MyNotifications';
import { StaffFollowUps } from './pages/StaffFollowUps';
import { EmergencyDashboard } from './pages/EmergencyDashboard';
import { CareManagementDashboard } from './pages/CareManagementDashboard';
import TeleconsultationsList from './pages/TeleconsultationsList';
import TeleconsultationRoom from './pages/TeleconsultationRoom';
import { RoleRoute } from './components/RoleRoute';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (!token) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

const CLINICAL_STAFF = ['ROLE_ASHA', 'ROLE_ANM', 'ROLE_CHO', 'ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_FACILITY_ADMIN'];
const ALL_STAFF = [...CLINICAL_STAFF, 'ROLE_DISTRICT_ADMIN'];
const ADMINS = ['ROLE_FACILITY_ADMIN', 'ROLE_DISTRICT_ADMIN'];

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Everyone can access their dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/my-notifications" element={<ProtectedRoute><MyNotifications /></ProtectedRoute>} />
      <Route path="/follow-ups" element={<ProtectedRoute><RoleRoute allowedRoles={ALL_STAFF}><StaffFollowUps /></RoleRoute></ProtectedRoute>} />
      <Route path="/emergencies" element={<ProtectedRoute><RoleRoute allowedRoles={ALL_STAFF}><EmergencyDashboard /></RoleRoute></ProtectedRoute>} />
      <Route path="/care-plans" element={<ProtectedRoute><RoleRoute allowedRoles={ALL_STAFF}><CareManagementDashboard /></RoleRoute></ProtectedRoute>} />
      
      {/* Facilities: Citizens can find, Staff can view, Admins can manage */}
      <Route path="/facilities" element={<ProtectedRoute><Facilities /></ProtectedRoute>} />
      <Route path="/facilities/new" element={<ProtectedRoute><RoleRoute allowedRoles={ADMINS}><FacilityManage /></RoleRoute></ProtectedRoute>} />
      <Route path="/facilities/:id" element={<ProtectedRoute><FacilityDetail /></ProtectedRoute>} />
      
      {/* Patients: Citizens can only see their own (backend enforced). Staff can manage/view all. */}
      <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
      <Route path="/patients/new" element={<ProtectedRoute><PatientManage /></ProtectedRoute>} />
      <Route path="/patients/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
      <Route path="/patients/:id/edit" element={<ProtectedRoute><PatientManage /></ProtectedRoute>} />
      
      {/* Appointments: Citizen scheduling */}
      <Route path="/appointments" element={<ProtectedRoute><RoleRoute allowedRoles={['ROLE_CITIZEN']}><Appointments /></RoleRoute></ProtectedRoute>} />
      
      {/* Queue: Clinical Staff Only */}
      <Route path="/queue" element={<ProtectedRoute><RoleRoute allowedRoles={CLINICAL_STAFF}><QueueManagement /></RoleRoute></ProtectedRoute>} />
      
      {/* Clinical modules: Triage, Records, Referrals */}
      <Route path="/patients/:id/triage" element={<ProtectedRoute><RoleRoute allowedRoles={ALL_STAFF}><Triage /></RoleRoute></ProtectedRoute>} />
      <Route path="/patients/:id/records" element={<ProtectedRoute><MedicalRecords /></ProtectedRoute>} />
          <Route path="/consultation/:appointmentId" element={<ProtectedRoute><RoleRoute allowedRoles={ALL_STAFF}><ConsultationWorkspace /></RoleRoute></ProtectedRoute>} />
      <Route path="/referrals" element={<ProtectedRoute><RoleRoute allowedRoles={ALL_STAFF}><ReferralDashboard /></RoleRoute></ProtectedRoute>} />
          <Route path="/my-referrals" element={<ProtectedRoute><RoleRoute allowedRoles={['ROLE_CITIZEN']}><MyReferrals /></RoleRoute></ProtectedRoute>} />
      <Route path="/my-diagnostics" element={<ProtectedRoute><RoleRoute allowedRoles={['ROLE_CITIZEN']}><MyDiagnostics /></RoleRoute></ProtectedRoute>} />
      <Route path="/my-medicines" element={<ProtectedRoute><RoleRoute allowedRoles={['ROLE_CITIZEN']}><MyMedicines /></RoleRoute></ProtectedRoute>} />
      
      {/* Teleconsultation: Staff & Citizens */}
      <Route path="/teleconsultations" element={<ProtectedRoute><TeleconsultationsList /></ProtectedRoute>} />
      <Route path="/teleconsultations/:id" element={<ProtectedRoute><TeleconsultationRoom /></ProtectedRoute>} />
      
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/diagnostics/orders" element={<ProtectedRoute><RoleRoute allowedRoles={['ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_FACILITY_ADMIN']}><DiagnosticOrders /></RoleRoute></ProtectedRoute>} />
          <Route path="/medicines/inventory" element={<ProtectedRoute><RoleRoute allowedRoles={['ROLE_DOCTOR_MO', 'ROLE_SPECIALIST', 'ROLE_FACILITY_ADMIN', 'ROLE_DISTRICT_ADMIN', 'ROLE_CHO']}><FacilityMedicines /></RoleRoute></ProtectedRoute>} />
        </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ConnectivityProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ConnectivityProvider>
    </AuthProvider>
  );
}

export default App;

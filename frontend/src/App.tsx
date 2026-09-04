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
import TeleconsultationsList from './pages/TeleconsultationsList';
import TeleconsultationRoom from './pages/TeleconsultationRoom';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!token) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/facilities" element={<ProtectedRoute><Facilities /></ProtectedRoute>} />
      <Route path="/facilities/new" element={<ProtectedRoute><FacilityManage /></ProtectedRoute>} />
      <Route path="/facilities/:id" element={<ProtectedRoute><FacilityDetail /></ProtectedRoute>} />
      
      <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
      <Route path="/patients/new" element={<ProtectedRoute><PatientManage /></ProtectedRoute>} />
      <Route path="/patients/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
      <Route path="/patients/:id/edit" element={<ProtectedRoute><PatientManage /></ProtectedRoute>} />
      
      <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
      <Route path="/queue" element={<ProtectedRoute><QueueManagement /></ProtectedRoute>} />
      <Route path="/patients/:id/triage" element={<ProtectedRoute><Triage /></ProtectedRoute>} />
      <Route path="/patients/:id/records" element={<ProtectedRoute><MedicalRecords /></ProtectedRoute>} />
      <Route path="/referrals" element={<ProtectedRoute><ReferralDashboard /></ProtectedRoute>} />
      
      <Route path="/teleconsultations" element={<ProtectedRoute><TeleconsultationsList /></ProtectedRoute>} />
      <Route path="/teleconsultations/:id" element={<ProtectedRoute><TeleconsultationRoom /></ProtectedRoute>} />
      
      <Route path="/" element={<Navigate to="/dashboard" />} />
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

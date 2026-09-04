import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return <>{children}</>;
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
      <Route path="/triage" element={<ProtectedRoute><Triage /></ProtectedRoute>} />
      <Route path="/patients/:id/records" element={<ProtectedRoute><MedicalRecords /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

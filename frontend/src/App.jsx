import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Pages - Auth
// import LoginPage from './pages/auth/LoginPage';
// import RegisterPage from './pages/auth/RegisterPage';

// Pages - Patient
// import PatientDashboard from './pages/patient/PatientDashboard';

// Pages - Doctor
// import DoctorDashboard from './pages/doctor/DoctorDashboard';

// Pages - Admin
// import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
        {/* <Route path="/register" element={<RegisterPage />} /> */}

        {/* Patient Routes */}
        {/* <Route path="/patient/*" element={<PatientDashboard />} /> */}

        {/* Doctor Routes */}
        {/* <Route path="/doctor/*" element={<DoctorDashboard />} /> */}

        {/* Admin Routes */}
        {/* <Route path="/admin/*" element={<AdminDashboard />} /> */}

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

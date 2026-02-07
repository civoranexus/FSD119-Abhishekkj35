import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import "./App.css";

// Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import NotificationBanner from "./components/NotificationBanner";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages - Auth
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Pages - Patient
import PatientDashboard from "./pages/patient/PatientDashboard";
import BookAppointment from "./pages/patient/BookAppointment";
import MyAppointments from "./pages/patient/MyAppointments";
import MyHealthRecords from "./pages/patient/MyHealthRecords";

// Pages - Doctor
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import Availability from "./pages/doctor/Availability";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";

// Pages - Shared
import ConsultationRoom from "./pages/ConsultationRoom";
import CreateEHR from "./pages/CreateEHR";
import Prescription from "./pages/Prescription";

// Pages - Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import Reports from "./pages/admin/Reports";

function ProtectedLayout({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { ...notification, id }]);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Notifications */}
        <NotificationBanner
          notifications={notifications}
          onDismiss={(id) =>
            setNotifications((prev) => prev.filter((n) => n.id !== id))
          }
        />

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  // Show auth pages without layout
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  // Show authenticated pages with layout
  return (
    <ProtectedLayout>
      <Routes>
        {/* Patient Routes */}
        <Route
          path="/patient"
          element={
            <ProtectedRoute requiredRole="patient">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/book-appointment"
          element={
            <ProtectedRoute requiredRole="patient">
              <BookAppointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/my-appointments"
          element={
            <ProtectedRoute requiredRole="patient">
              <MyAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/my-records"
          element={
            <ProtectedRoute requiredRole="patient">
              <MyHealthRecords />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/prescriptions"
          element={
            <ProtectedRoute requiredRole="patient">
              <MyAppointments />
            </ProtectedRoute>
          }
        />

        {/* Doctor Routes */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute requiredRole="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute requiredRole="doctor">
              <DoctorAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/availability"
          element={
            <ProtectedRoute requiredRole="doctor">
              <Availability />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/create-ehr"
          element={
            <ProtectedRoute requiredRole="doctor">
              <CreateEHR />
            </ProtectedRoute>
          }
        />

        {/* Shared Routes */}
        <Route
          path="/consultation/:appointmentId"
          element={
            <ProtectedRoute>
              <ConsultationRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescription"
          element={
            <ProtectedRoute requiredRole="doctor">
              <Prescription />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute requiredRole="admin">
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/patient" />} />
      </Routes>
    </ProtectedLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

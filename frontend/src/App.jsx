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
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-b-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth Routes - No Layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes - With Layout */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute requiredRole="patient">
            <ProtectedLayout>
              <PatientDashboard />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/book-appointment"
        element={
          <ProtectedRoute requiredRole="patient">
            <ProtectedLayout>
              <BookAppointment />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/my-appointments"
        element={
          <ProtectedRoute requiredRole="patient">
            <ProtectedLayout>
              <MyAppointments />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/my-records"
        element={
          <ProtectedRoute requiredRole="patient">
            <ProtectedLayout>
              <MyHealthRecords />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/prescriptions"
        element={
          <ProtectedRoute requiredRole="patient">
            <ProtectedLayout>
              <MyAppointments />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      {/* Doctor Routes */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute requiredRole="doctor">
            <ProtectedLayout>
              <DoctorDashboard />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute requiredRole="doctor">
            <ProtectedLayout>
              <DoctorAppointments />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/availability"
        element={
          <ProtectedRoute requiredRole="doctor">
            <ProtectedLayout>
              <Availability />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/create-ehr"
        element={
          <ProtectedRoute requiredRole="doctor">
            <ProtectedLayout>
              <CreateEHR />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      {/* Shared Routes */}
      <Route
        path="/consultation/:appointmentId"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <ConsultationRoom />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/prescription"
        element={
          <ProtectedRoute requiredRole="doctor">
            <ProtectedLayout>
              <Prescription />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <ProtectedLayout>
              <AdminDashboard />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute requiredRole="admin">
            <ProtectedLayout>
              <Reports />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all - redirect to login */}
      <Route path="*" element={isAuthenticated ? <Navigate to="/patient" /> : <Navigate to="/login" />} />
    </Routes>
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

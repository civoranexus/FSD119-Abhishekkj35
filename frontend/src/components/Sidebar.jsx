import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!isAuthenticated) return null;

  const navItems = {
    patient: [
      { label: 'Dashboard', path: '/patient', icon: '📊' },
      { label: 'Book Appointment', path: '/patient/book-appointment', icon: '📅' },
      { label: 'My Appointments', path: '/patient/my-appointments', icon: '📋' },
      { label: 'My Records', path: '/patient/my-records', icon: '📄' },
      { label: 'My Prescriptions', path: '/patient/prescriptions', icon: '💊' },
    ],
    doctor: [
      { label: 'Dashboard', path: '/doctor', icon: '📊' },
      { label: 'Appointments', path: '/doctor/appointments', icon: '📅' },
      { label: 'Availability', path: '/doctor/availability', icon: '⏰' },
      { label: 'Create EHR', path: '/doctor/create-ehr', icon: '📝' },
      { label: 'Issue Prescription', path: '/prescription', icon: '💊' },
    ],
    admin: [
      { label: 'Dashboard', path: '/admin', icon: '📊' },
      { label: 'Reports', path: '/admin/reports', icon: '📈' },
      { label: 'Users', path: '/admin/users', icon: '👥' },
      { label: 'System Health', path: '/admin/health', icon: '❤️' },
    ],
  };

  const items = navItems[user?.role] || [];
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <aside
      className={`bg-gradient-to-b from-blue-800 to-blue-900 text-white transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      } min-h-screen sticky top-0 z-40 shadow-lg`}
    >
      {/* Toggle Button */}
      <div className="p-4 flex justify-between items-center border-b border-blue-700">
        {sidebarOpen && <span className="font-bold text-white">Menu</span>}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white hover:bg-blue-700 p-2 rounded transition"
        >
          {sidebarOpen ? '◄' : '►'}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="mt-4 space-y-1 px-2">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 ${
              isActive(item.path)
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-blue-100 hover:bg-blue-700 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {sidebarOpen && <span className="font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

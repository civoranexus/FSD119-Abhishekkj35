import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getMyAppointments();
      const upcoming = (response.data?.appointments || []).filter((apt) => apt.status !== 'completed' && apt.status !== 'cancelled');
      setAppointments(upcoming.slice(0, 5));
    } catch (err) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold">Welcome back, {user?.name}! 👋</h1>
        <p className="text-blue-100 mt-2 text-lg">Your health is our priority • Get expert care anytime, anywhere</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          to="/patient/book-appointment"
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 p-6 rounded-xl hover:shadow-lg hover:scale-105 transition transform cursor-pointer"
        >
          <div className="text-5xl mb-3">📅</div>
          <h3 className="font-bold text-gray-800 text-lg">Book Appointment</h3>
          <p className="text-sm text-gray-600 mt-1">Schedule with a doctor</p>
        </Link>

        <Link
          to="/patient/my-appointments"
          className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 p-6 rounded-xl hover:shadow-lg hover:scale-105 transition transform cursor-pointer"
        >
          <div className="text-5xl mb-3">📋</div>
          <h3 className="font-bold text-gray-800 text-lg">My Appointments</h3>
          <p className="text-sm text-gray-600 mt-1">View scheduled visits</p>
        </Link>

        <Link
          to="/patient/my-records"
          className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 p-6 rounded-xl hover:shadow-lg hover:scale-105 transition transform cursor-pointer"
        >
          <div className="text-5xl mb-3">📄</div>
          <h3 className="font-bold text-gray-800 text-lg">My Records</h3>
          <p className="text-sm text-gray-600 mt-1">Health records</p>
        </Link>

        <Link
          to="/patient/prescriptions"
          className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 p-6 rounded-xl hover:shadow-lg hover:scale-105 transition transform cursor-pointer"
        >
          <div className="text-5xl mb-3">💊</div>
          <h3 className="font-bold text-gray-800 text-lg">Prescriptions</h3>
          <p className="text-sm text-gray-600 mt-1">Active medicines</p>
        </Link>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white p-8 rounded-xl shadow-md border-l-4 border-blue-600">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="text-3xl mr-3">📅</span>Upcoming Appointments
        </h2>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-red-600 p-4 bg-red-50 rounded-lg">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 text-lg mb-4">No upcoming appointments</p>
            <Link to="/patient/book-appointment" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
              📅 Book your first appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div key={apt._id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-blue-50 transition hover:shadow">
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-lg">Dr. {apt.doctorId?.name || 'Doctor'}</p>
                  <p className="text-sm text-gray-600 font-medium">{apt.doctorId?.specialization}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <span className="text-gray-600">📅 {new Date(apt.appointmentDate).toLocaleDateString()}</span>
                    <span className="text-gray-600">⏰ {apt.timeSlot}</span>
                    <span className="text-gray-600 capitalize">📱 {apt.consultationType}</span>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                  apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {apt.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;

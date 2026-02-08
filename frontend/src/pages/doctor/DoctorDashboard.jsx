import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getMyAppointments();
      const today = new Date().toISOString().split('T')[0];
      const todaysAppointments = (response.data?.appointments || []).filter(
        (apt) => new Date(apt.appointmentDate).toISOString().split('T')[0] === today && apt.status === 'confirmed'
      );
      setAppointments(todaysAppointments);
    } catch (err) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold flex items-center">
          <span className="mr-3">👨‍⚕️</span>Welcome, Dr. {user?.name}!
        </h1>
        <p className="text-green-100 mt-2 text-lg">Provide excellent care • Manage your schedule efficiently</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/doctor/appointments"
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 p-6 rounded-xl hover:shadow-lg hover:scale-105 transition transform cursor-pointer"
        >
          <div className="text-5xl mb-3">📅</div>
          <h3 className="font-bold text-gray-800 text-lg">Appointments</h3>
          <p className="text-sm text-gray-600 mt-1">Review all bookings</p>
        </Link>

        <Link
          to="/doctor/availability"
          className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 p-6 rounded-xl hover:shadow-lg hover:scale-105 transition transform cursor-pointer"
        >
          <div className="text-5xl mb-3">⏰</div>
          <h3 className="font-bold text-gray-800 text-lg">Availability</h3>
          <p className="text-sm text-gray-600 mt-1">Set your schedule</p>
        </Link>

        <Link
          to="/doctor/create-ehr"
          className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 p-6 rounded-xl hover:shadow-lg hover:scale-105 transition transform cursor-pointer"
        >
          <div className="text-5xl mb-3">📝</div>
          <h3 className="font-bold text-gray-800 text-lg">Create EHR</h3>
          <p className="text-sm text-gray-600 mt-1">Medical records</p>
        </Link>
      </div>

      {/* Today's Appointments */}
      <div className="bg-white p-8 rounded-xl shadow-md border-l-4 border-green-600">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="text-3xl mr-3">📅</span>Today's Appointments
        </h2>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-red-600 p-4 bg-red-50 rounded-lg border-l-4 border-red-600">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 text-lg">✅ No appointments scheduled for today</p>
            <p className="text-gray-500 text-sm mt-2">Check back later or update your availability</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt._id} className="flex justify-between items-center p-5 border-2 border-gray-200 rounded-lg hover:shadow-lg hover:border-green-200 transition hover:bg-green-50">
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-lg">Patient: {apt.patientId?.name || 'Patient'}</p>
                  <div className="flex items-center space-x-6 mt-2 text-sm">
                    <span className="text-gray-600">⏰ {apt.timeSlot}</span>
                    <span className="text-gray-600 capitalize">📱 {apt.consultationType}</span>
                    {apt.reasonForVisit && (
                      <span className="text-gray-600">📋 {apt.reasonForVisit}</span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/consultation/${apt._id}`)}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:shadow-lg hover:from-green-600 hover:to-green-700 transition whitespace-nowrap ml-4"
                >
                  ▶️ Start Consultation
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;

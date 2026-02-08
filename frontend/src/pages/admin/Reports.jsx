import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const Reports = () => {
  const [doctorUtilization, setDoctorUtilization] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('doctors');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const doctorRes = await adminService.getDoctorUtilization();
      const appointmentRes = await adminService.getAppointmentAnalytics();
      setDoctorUtilization(doctorRes.data);
      setAppointments(appointmentRes.data);
    } catch (err) {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">System Reports</h1>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveTab('doctors')}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            activeTab === 'doctors'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Doctor Utilization
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            activeTab === 'appointments'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Appointments
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : activeTab === 'doctors' ? (
        /* Doctor Utilization Table */
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Doctor Performance</h2>
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700">Doctor Name</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Specialization</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Total Appointments</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Completed</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Pending</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Utilization Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {doctorUtilization.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-3 text-center text-gray-600">
                    No data available
                  </td>
                </tr>
              ) : (
                doctorUtilization.map((doctor) => (
                  <tr key={doctor._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{doctor.name}</td>
                    <td className="px-4 py-3 text-gray-600">{doctor.specialization}</td>
                    <td className="px-4 py-3 text-gray-600">{doctor.totalAppointments}</td>
                    <td className="px-4 py-3 text-green-600 font-semibold">{doctor.completedAppointments}</td>
                    <td className="px-4 py-3 text-yellow-600 font-semibold">{doctor.pendingAppointments}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(doctor.utilizationRate || 0) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round((doctor.utilizationRate || 0) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Appointments Table */
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Appointment Analytics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">{appointments.total || 0}</div>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">{appointments.confirmed || 0}</div>
              <p className="text-sm text-gray-600">Confirmed</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded">
              <div className="text-2xl font-bold text-yellow-600">{appointments.pending || 0}</div>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded">
              <div className="text-2xl font-bold text-red-600">{appointments.cancelled || 0}</div>
              <p className="text-sm text-gray-600">Cancelled</p>
            </div>
          </div>

          {/* Consultation Type Breakdown */}
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold text-gray-800 mb-3">By Consultation Type</h3>
            <div className="space-y-2">
              {appointments.byType && Object.entries(appointments.byType).map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="text-gray-600 capitalize">{type}</span>
                  <span className="font-semibold text-gray-800">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;

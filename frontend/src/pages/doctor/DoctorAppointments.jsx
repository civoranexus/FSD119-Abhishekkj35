import React, { useEffect, useState } from 'react';
import { appointmentService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, filter]);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getMyAppointments();
      setAppointments(response.data?.appointments || []);
    } catch (err) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    if (filter === 'all') {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(appointments.filter((apt) => apt.status === filter));
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      fetchAppointments();
    } catch (err) {
      setError('Failed to update appointment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Appointments</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex space-x-2 mb-6">
        {['all', 'pending', 'confirmed', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
              filter === status
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredAppointments.length === 0 ? (
        <p className="text-gray-600">No appointments found.</p>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => (
            <div key={apt._id} className="border rounded-lg p-4 hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {apt.patientId?.name || 'Patient'}
                  </h3>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Date & Time</p>
                      <p className="font-medium">
                        {new Date(apt.appointmentDate).toLocaleDateString()} {apt.timeSlot}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Type</p>
                      <p className="font-medium capitalize">{apt.consultationType}</p>
                    </div>
                    {apt.reasonForVisit && (
                      <div className="col-span-2">
                        <p className="text-gray-600">Reason</p>
                        <p className="text-sm">{apt.reasonForVisit}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>

                  {/* Action Buttons */}
                  {apt.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusUpdate(apt._id, 'confirmed')}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(apt._id, 'cancelled')}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {apt.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(apt._id, 'completed')}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;

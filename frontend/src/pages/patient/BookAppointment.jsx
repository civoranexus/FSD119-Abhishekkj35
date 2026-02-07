import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentDate: '',
    timeSlot: '',
    consultationType: 'audio',
    reasonForVisit: '',
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAvailableDoctors();
      setDoctors(response.data);
    } catch (err) {
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await appointmentService.bookAppointment(formData);
      navigate('/patient/my-appointments');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-8 rounded-xl shadow-lg mb-8">
          <h1 className="text-4xl font-bold flex items-center">
            <span className="mr-3">📅</span>Book an Appointment
          </h1>
          <p className="text-blue-100 mt-2">Connect with our experienced healthcare professionals</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-600 text-red-700 rounded-lg shadow">
            ❌ {error}
          </div>
        )}

        {loading && doctors.length === 0 ? (
          <LoadingSpinner />
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-8">
            {/* Doctor Selection */}
            <div>
              <label className="flex text-lg font-bold text-gray-800 mb-3 items-center">
                <span className="mr-2">👨‍⚕️</span>Select Doctor
              </label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base font-medium transition hover:border-blue-300"
              >
                <option value="">-- Choose a doctor --</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.name} • {doctor.specialization} • {doctor.yearsOfExperience} years exp.
                  </option>
                ))}
              </select>
            </div>

            {/* Appointment Date */}
            <div>
              <label className="flex text-lg font-bold text-gray-800 mb-3 items-center">
                <span className="mr-2">📆</span>Select Date
              </label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base font-medium transition hover:border-blue-300"
              />
              <p className="text-sm text-gray-600 mt-2">📍 Only future dates available</p>
            </div>

            {/* Time Slot */}
            <div>
              <label className="flex text-lg font-bold text-gray-800 mb-3 items-center">
                <span className="mr-2">⏰</span>Select Time Slot
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['09:00 - 09:30', '09:30 - 10:00', '10:00 - 10:30', '14:00 - 14:30', '14:30 - 15:00', '15:00 - 15:30'].map((time) => (
                  <label key={time} className={`p-3 border-2 rounded-lg cursor-pointer text-center font-medium transition ${
                    formData.timeSlot === time 
                      ? 'border-blue-600 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}>
                    <input
                      type="radio"
                      name="timeSlot"
                      value={time}
                      checked={formData.timeSlot === time}
                      onChange={handleChange}
                      className="hidden"
                      required
                    />
                    {time}
                  </label>
                ))}
              </div>
            </div>

            {/* Consultation Type */}
            <div>
              <label className="flex text-lg font-bold text-gray-800 mb-4 items-center">
                <span className="mr-2">📞</span>Consultation Type
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { type: 'audio', label: 'Audio Call', icon: '☎️' },
                  { type: 'video', label: 'Video Call', icon: '📹' },
                  { type: 'chat', label: 'Chat', icon: '💬' }
                ].map(({ type, label, icon }) => (
                  <label key={type} className={`p-4 border-2 rounded-lg cursor-pointer text-center font-medium transition ${
                    formData.consultationType === type 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}>
                    <input
                      type="radio"
                      name="consultationType"
                      value={type}
                      checked={formData.consultationType === type}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <div className="text-3xl mb-2">{icon}</div>
                    <div className="text-sm">{label}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Reason for Visit */}
            <div>
              <label className="flex text-lg font-bold text-gray-800 mb-3 items-center">
                <span className="mr-2">📝</span>Reason for Visit
              </label>
              <textarea
                name="reasonForVisit"
                value={formData.reasonForVisit}
                onChange={handleChange}
                placeholder="Describe your symptoms or reason for consultation..."
                required
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium transition hover:border-blue-300"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-lg hover:shadow-lg hover:from-blue-600 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {loading ? '⏳ Booking...' : '✅ Confirm Booking'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/patient')}
                className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition text-lg"
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;

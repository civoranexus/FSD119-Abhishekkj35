import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/api';

const Availability = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30', '16:00'];

  useEffect(() => {
    loadUserAvailability();
  }, []);

  const loadUserAvailability = () => {
    const currentSlots = user?.availabilitySlots || [];
    setSlots(currentSlots);
  };

  const toggleSlot = (day, time) => {
    const slotKey = `${day}-${time}`;
    setSlots((prev) => {
      if (prev.includes(slotKey)) {
        return prev.filter((s) => s !== slotKey);
      } else {
        return [...prev, slotKey];
      }
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await appointmentService.setAvailability(slots);
      setSuccess('Availability saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Set Your Availability</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Availability Grid */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3 text-left font-semibold">Time</th>
              {daysOfWeek.map((day) => (
                <th key={day} className="border p-3 text-center font-semibold">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time) => (
              <tr key={time} className="hover:bg-gray-50">
                <td className="border p-3 font-medium text-gray-700">{time}</td>
                {daysOfWeek.map((day) => {
                  const slotKey = `${day}-${time}`;
                  const isSelected = slots.includes(slotKey);
                  return (
                    <td key={slotKey} className="border p-3 text-center">
                      <button
                        onClick={() => toggleSlot(day, time)}
                        className={`w-full px-3 py-2 rounded transition ${
                          isSelected
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {isSelected ? '✓' : '-'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition"
      >
        {loading ? 'Saving...' : 'Save Availability'}
      </button>

      {/* Selected Slots Summary */}
      {slots.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded">
          <p className="font-semibold text-gray-800 mb-2">Selected Slots ({slots.length})</p>
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => (
              <span key={slot} className="px-3 py-1 bg-blue-200 text-blue-800 rounded text-sm">
                {slot}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Availability;

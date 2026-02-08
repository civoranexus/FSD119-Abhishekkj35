import React, { useEffect, useState } from 'react';
import { ehrService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const MyHealthRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await ehrService.getMyEHRs();
      console.log('Health records response:', response.data);
      const recordsData = response.data.ehrs || response.data || [];
      setRecords(Array.isArray(recordsData) ? recordsData : []);
    } catch (err) {
      console.error('Health records error:', err);
      setError(err.response?.data?.message || 'Failed to load health records');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Health Records</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : records.length === 0 ? (
        <p className="text-gray-600">No health records available yet.</p>
      ) : (
        <div className="space-y-4">
          {records.map((record) => {
            const doctorName = typeof record.doctorId === 'string' ? 'Doctor' : record.doctorId?.name || 'Unknown Doctor';
            return (
            <div key={record._id} className="border rounded-lg p-4 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Consultation with Dr. {doctorName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {record.consultationDate ? new Date(record.consultationDate).toLocaleDateString() : 'Date not available'}
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  Medical Record
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Symptoms */}
                {record.symptoms && (
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="font-semibold text-gray-700 mb-2">Symptoms</p>
                    <p className="text-gray-600 text-sm">{record.symptoms}</p>
                  </div>
                )}

                {/* Diagnosis */}
                {record.diagnosis && (
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="font-semibold text-gray-700 mb-2">Diagnosis</p>
                    <p className="text-gray-600 text-sm">{record.diagnosis}</p>
                  </div>
                )}

                {/* Treatment Plan */}
                {record.treatmentPlan && (
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="font-semibold text-gray-700 mb-2">Treatment Plan</p>
                    <p className="text-gray-600 text-sm">{record.treatmentPlan}</p>
                  </div>
                )}

                {/* Follow-up Date */}
                {record.followUpDate && (
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="font-semibold text-gray-700 mb-2">Follow-up Date</p>
                    <p className="text-gray-600 text-sm">
                      {new Date(record.followUpDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Prescriptions */}
              {record.prescriptions && record.prescriptions.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded">
                  <p className="font-semibold text-gray-700 mb-2">Linked Prescriptions</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {record.prescriptions.map((rx, idx) => (
                      <li key={idx}>{rx}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Notes */}
              {record.notes && (
                <div className="mt-4 p-4 bg-yellow-50 rounded">
                  <p className="font-semibold text-gray-700 mb-2">Doctor's Notes</p>
                  <p className="text-sm text-gray-600">{record.notes}</p>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyHealthRecords;

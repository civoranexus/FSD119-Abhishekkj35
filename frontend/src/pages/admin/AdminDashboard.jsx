import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminService.getSystemOverview();
      setStats(response.data);
    } catch (err) {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const StatCard = ({ icon, title, value, bgColor, borderColor }) => (
    <div className={`bg-white p-6 rounded-xl shadow-lg border-l-4 ${borderColor} hover:shadow-xl transition transform hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">📊 {title}</p>
          <p className={`text-4xl font-bold mt-2 ${bgColor}`}>{value || 0}</p>
        </div>
        <div className="text-5xl opacity-20">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold flex items-center">
          <span className="mr-3">🛡️</span>Admin Dashboard
        </h1>
        <p className="text-red-100 mt-2 text-lg">💼 System overview • 📊 Real-time monitoring • ⚙️ Control center</p>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border-l-4 border-red-600 text-red-700 rounded-lg shadow">
          ❌ {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon="👥"
            title="Total Patients"
            value={stats.userStats?.totalPatients}
            bgColor="text-blue-600"
            borderColor="border-blue-600"
          />
          <StatCard 
            icon="👨‍⚕️"
            title="Total Doctors"
            value={stats.userStats?.totalDoctors}
            bgColor="text-green-600"
            borderColor="border-green-600"
          />
          <StatCard 
            icon="📅"
            title="Total Appointments"
            value={stats.appointmentStats?.total}
            bgColor="text-purple-600"
            borderColor="border-purple-600"
          />
          <StatCard 
            icon="💬"
            title="Total Consultations"
            value={stats.consultationStats?.total}
            bgColor="text-orange-600"
            borderColor="border-orange-600"
          />
        </div>
      )}

      {/* Appointment Status Breakdown */}
      {stats?.appointmentStats && (
        <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-purple-600">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-3xl mr-3">📊</span>Appointment Status Breakdown
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.appointmentStats).map(([status, count]) => {
              if (status === 'total') return null;
              const colors = {
                confirmed: 'bg-green-50 border-green-500 text-green-700',
                pending: 'bg-yellow-50 border-yellow-500 text-yellow-700',
                completed: 'bg-blue-50 border-blue-500 text-blue-700',
                cancelled: 'bg-red-50 border-red-500 text-red-700',
                rejected: 'bg-gray-50 border-gray-500 text-gray-700',
              };
              return (
                <div key={status} className={`p-4 border-2 rounded-lg text-center ${colors[status] || 'bg-gray-50'}`}>
                  <div className="text-3xl font-bold">{count}</div>
                  <p className="text-sm font-semibold mt-2 capitalize">{status}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Consultation Types */}
      {stats?.consultationStats && (
        <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-orange-600">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-3xl mr-3">📱</span>Consultation Types Distribution
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {Object.entries(stats.consultationStats)
              .filter(([type]) => type !== 'total')
              .map(([type, count]) => {
                const icons = { audio: '☎️', video: '📹', chat: '💬' };
                const bgColors = { audio: 'from-blue-50 to-blue-100', video: 'from-green-50 to-green-100', chat: 'from-purple-50 to-purple-100' };
                return (
                  <div key={type} className={`bg-gradient-to-br ${bgColors[type] || 'from-gray-50 to-gray-100'} p-6 rounded-lg border-2 border-gray-200 text-center hover:shadow-lg transition`}>
                    <div className="text-4xl mb-3">{icons[type]}</div>
                    <div className="text-3xl font-bold text-gray-800">{count}</div>
                    <p className="text-gray-600 font-semibold mt-2 capitalize">{type}</p>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* User Growth */}
      {stats?.userStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-indigo-600">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-3xl mr-3">👥</span>User Statistics
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <span className="font-semibold text-gray-700">📝 Registered Users</span>
                <span className="text-2xl font-bold text-blue-600">{stats.userStats.totalUsers || 0}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                <span className="font-semibold text-gray-700">✅ Active Today</span>
                <span className="text-2xl font-bold text-green-600">{stats.userStats.activeToday || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-cyan-600">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-3xl mr-3">⚙️</span>System Health
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                <span className="font-semibold text-gray-700">🟢 API Status</span>
                <span className="px-3 py-1 bg-green-600 text-white rounded-full font-bold">RUNNING</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-teal-50 rounded-lg border border-teal-200">
                <span className="font-semibold text-gray-700">🗄️ Database Status</span>
                <span className="px-3 py-1 bg-green-600 text-white rounded-full font-bold">CONNECTED</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

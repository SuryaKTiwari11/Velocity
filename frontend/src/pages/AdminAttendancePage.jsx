import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../front2backconnect/api';
import useAuthStore from '../store/authStore';
import { Clock, Users, Calendar, Filter } from 'lucide-react';

const AdminAttendancePage = () => {
  const { user, isAuthenticated, isAdmin } = useAuthStore();
  
  const [allAttendance, setAllAttendance] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    userId: '',
    page: 1,
    limit: 20
  });

  // Load data function
  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      
      // Load all attendance records
      const attendanceResponse = await attendanceApi.getAllAttendance(filters);
      if (attendanceResponse.data) {
        setAllAttendance(attendanceResponse.data.data || attendanceResponse.data);
      }

      // Load currently active users
      const activeResponse = await attendanceApi.getActiveUsers();
      if (activeResponse.data) {
        setActiveUsers(activeResponse.data.data || activeResponse.data);
      }

    } catch (error) {
      console.error('Failed to load attendance data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load data on component mount and filter changes
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadData();
    }
  }, [loadData, isAuthenticated, isAdmin]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  // Format date and time
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString();
  };

  // Admin access check
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">Admin access required to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Attendance Dashboard</h1>
                <p className="text-gray-600">Monitor and manage attendance records</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Currently Active</p>
                <p className="text-3xl font-bold text-green-600">{activeUsers.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Records</p>
                <p className="text-3xl font-bold text-blue-600">{allAttendance.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Attendance Records Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">All Attendance Records</h2>
                  
                  {/* Filters */}
                  <div className="flex items-center space-x-4">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <input
                      type="date"
                      value={filters.date}
                      onChange={(e) => handleFilterChange('date', e.target.value)}
                      className="border border-gray-300 rounded px-3 py-1 text-sm"
                    />
                    <button
                      onClick={() => handleFilterChange('date', new Date().toISOString().split('T')[0])}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Today
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : allAttendance.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <Clock className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No attendance records found</p>
                  </div>
                ) : (
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Clock In</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Clock Out</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Hours</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allAttendance.map((record) => (
                        <tr key={record.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            <div>
                              <div className="font-medium text-gray-900">
                                {record.name || 'Unknown User'}
                              </div>
                              <div className="text-gray-500 text-xs">{record.email || ''}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {formatDate(record.date)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {formatTime(record.clockInTime)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {record.clockOutTime ? formatTime(record.clockOutTime) : 
                             (record.status === 'Active' ? 'Working...' : '-')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {record.totalHours && typeof record.totalHours === 'number' 
                              ? `${record.totalHours.toFixed(2)} hrs` 
                              : '0.00 hrs'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              record.status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Currently Active Users */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <h2 className="text-xl font-semibold text-gray-900">Currently Active Users</h2>
                </div>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : activeUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32">
                    <Users className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm">No active users</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeUsers.map((user) => (
                      <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{user.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">Since {formatTime(user.clockInTime)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-green-600">
                            {user.currentHours && typeof user.currentHours === 'number' 
                              ? `${user.currentHours.toFixed(1)} hrs` 
                              : '0.0 hrs'}
                          </div>
                          <div className="w-2 h-2 bg-green-500 rounded-full mx-auto"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendancePage;
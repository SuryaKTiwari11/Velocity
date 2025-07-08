import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../front2backconnect/api';
import useAuthStore from '../store/authStore';
import { Clock, Users, TrendingUp, Activity, Calendar, Filter, Eye } from 'lucide-react';
import io from 'socket.io-client';

const AdminAttendancePage = () => {
  // Get user from Zustand store
  const { user, isAuthenticated, isAdmin } = useAuthStore();
  
  const [allAttendance, setAllAttendance] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    userId: '',
    page: 1,
    limit: 20
  });
  const [PAGINATION, setPagination] = useState({});
  const [SOCKET_INSTANCE, setSocket] = useState(null);
  const [realtimeUpdates, setRealtimeUpdates] = useState([]);

  // Load data function - defined early to avoid hoisting issues
  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      
      // Load all attendance records
      const attendanceResponse = await attendanceApi.getAllAttendance?.(filters) || 
                                  await fetch(`/api/attendance/all?${new URLSearchParams(filters)}`).then(r => r.json());
      
      if (attendanceResponse.data) {
        setAllAttendance(attendanceResponse.data.data || attendanceResponse.data);
        setPagination(attendanceResponse.data.pagination || {});
      }

      // Load currently active users
      const activeResponse = await attendanceApi.getActiveUsers?.() ||
                              await fetch('/api/attendance/active').then(r => r.json());
      
      if (activeResponse.data) {
        setActiveUsers(activeResponse.data.data || activeResponse.data);
      }

    } catch (error) {
      console.error('Failed to load attendance data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initialize WebSocket for real-time admin monitoring
  useEffect(() => {
    if (isAuthenticated && user?.id && isAdmin) {
      const newSocket = io('http://localhost:3000', {
        transports: ['websocket'],
        upgrade: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      newSocket.on('connect', () => {
        console.log('🔌 Admin WebSocket connected');
        newSocket.emit('join', {
          userId: user.id,
          isAdmin: true
        });
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Admin WebSocket disconnected');
      });

      // Listen for user attendance updates
      newSocket.on('user_attendance_update', (data) => {
        console.log('🔔 Admin: User attendance update:', data);
        setRealtimeUpdates(prev => [data, ...prev.slice(0, 9)]); // Keep last 10 updates
        loadData(); // Refresh data
      });

      // Listen for user online/offline status
      newSocket.on('user_online', (data) => {
        console.log('🟢 User came online:', data);
        setRealtimeUpdates(prev => [{
          action: 'online',
          userId: data.userId,
          timestamp: data.timestamp
        }, ...prev.slice(0, 9)]);
      });

      newSocket.on('user_offline', (data) => {
        console.log('🔴 User went offline:', data);
        setRealtimeUpdates(prev => [{
          action: 'offline',
          userId: data.userId,
          timestamp: data.timestamp
        }, ...prev.slice(0, 9)]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user, isAdmin, loadData]); // Add loadData as dependency

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateCurrentHours = (clockInTime) => {
    if (!clockInTime) return 0;
    const diffMs = new Date() - new Date(clockInTime);
    return (diffMs / (1000 * 60 * 60)).toFixed(1);
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getUpdateIcon = (action) => {
    switch (action) {
      case 'clock-in': return '🟢';
      case 'clock-out': return '🔴';
      case 'online': return '💻';
      case 'offline': return '🏠';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center">
            <Activity className="w-8 h-8 animate-spin mr-3" />
            <span className="text-xl">Loading attendance data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Users className="w-8 h-8 mr-3 text-blue-600" />
                Admin Attendance Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                📊 Real-time monitoring of automatic attendance tracking
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Current Time</div>
              <div className="text-xl font-bold text-gray-800">
                {currentTime.toLocaleTimeString()}
              </div>
              <button 
                onClick={() => {
                  console.log('🔄 Manual refresh triggered');
                  loadData();
                }}
                className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                🔄 Manual Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Currently Active</p>
                <p className="text-3xl font-bold text-green-600">{activeUsers.length}</p>
              </div>
              <Activity className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Today's Records</p>
                <p className="text-3xl font-bold text-blue-600">{allAttendance.length}</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Real-time Updates</p>
                <p className="text-3xl font-bold text-purple-600">{realtimeUpdates.length}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Attendance Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">All Attendance Records</h2>
                
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

              <div className="overflow-x-auto">
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
                              {record.User?.name || 'Unknown'}
                            </div>
                            <div className="text-gray-500 text-xs">{record.User?.email}</div>
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
                           (record.isActive ? 'Working...' : '-')}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {record.totalHours ? 
                            `${record.totalHours} hrs` : 
                            (record.isActive ? `${calculateCurrentHours(record.clockInTime)} hrs` : '-')
                          }
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.isActive)}`}>
                            {record.isActive ? 'Active' : 'Completed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {allAttendance.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No attendance records found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Currently Active Users */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-500" />
                Currently Active Users
              </h3>

              {activeUsers.length > 0 ? (
                <div className="space-y-3">
                  {activeUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800">
                          {user.User?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-600">
                          Since {formatTime(user.clockInTime)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {user.currentHours || calculateCurrentHours(user.clockInTime)} hrs
                        </div>
                        <div className="w-3 h-3 bg-green-500 rounded-full mx-auto"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Eye className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No active users</p>
                </div>
              )}
            </div>

            {/* Real-time Updates */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                🔔 Real-time Updates
              </h3>

              {realtimeUpdates.length > 0 ? (
                <div className="space-y-2">
                  {realtimeUpdates.map((update, index) => (
                    <div key={index} className="flex items-center p-2 bg-gray-50 rounded text-sm">
                      <span className="mr-2">{getUpdateIcon(update.action)}</span>
                      <div className="flex-1">
                        <span className="font-medium">User {update.userId}</span>
                        <span className="text-gray-600"> {update.action}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(update.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                  <p>No recent updates</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendancePage;

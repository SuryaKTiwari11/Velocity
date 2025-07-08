import React, { useState, useEffect, useCallback } from 'react';
import { attendanceApi } from '../src/front2backconnect/api';
import useAuthStore from '../src/store/authStore';
import { Clock, User, Calendar, TrendingUp, Activity } from 'lucide-react';
import io from 'socket.io-client';

const AutoAttendanceTracker = () => {
  // Get user from Zustand store instead of localStorage
  const { user, isAuthenticated } = useAuthStore();
  
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [_socketInstance, setSocketInstance] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  // Load attendance data - MOVED UP to avoid dependency issues
  const loadTodayAttendance = useCallback(async () => {
    try {
      const response = await attendanceApi.today();
      setTodayAttendance(response.data.data);
    } catch (error) {
      console.error('Failed to load today attendance:', error);
    }
  }, []);

  const loadAttendanceHistory = useCallback(async () => {
    try {
      const response = await attendanceApi.history({ page: 1, limit: 5 });
      setAttendanceHistory(response.data.data || []);
    } catch (error) {
      console.error('Failed to load attendance history:', error);
    }
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const connectSocket = () => {
        const newSocket = io('http://localhost:3000', {
          transports: ['websocket'],
          upgrade: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 5000
        });

        newSocket.on('connect', () => {
          console.log('🔌 Socket connected successfully');
          setIsOnline(true);
          newSocket.emit('join', {
            userId: user.id,
            isAdmin: user.isAdmin
          });
        });

        newSocket.on('disconnect', () => {
          console.log('🔌 Socket disconnected');
          setIsOnline(false);
        });

        newSocket.on('connect_error', (error) => {
          console.log('❌ Socket connection error:', error.message);
          setIsOnline(false);
        });

        newSocket.on('attendance_update', (data) => {
          console.log('🔔 Real-time attendance update:', data);
          if (data.action === 'clock-in' || data.action === 'clock-out') {
            loadTodayAttendance(); // Refresh attendance data
          }
        });

        setSocketInstance(newSocket);

        return () => {
          newSocket.disconnect();
        };
      };

      // Try to connect after a small delay to ensure backend is ready
      const timeoutId = setTimeout(connectSocket, 1000);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [isAuthenticated, user, loadTodayAttendance]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && user) {
        setLoading(true);
        await Promise.all([loadTodayAttendance(), loadAttendanceHistory()]);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, user, loadTodayAttendance, loadAttendanceHistory]);

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateCurrentWorkingHours = () => {
    if (!todayAttendance?.clockInTime || !todayAttendance?.isActive) return 0;
    
    const clockIn = new Date(todayAttendance.clockInTime);
    const now = new Date();
    const diffMs = now - clockIn;
    return (diffMs / (1000 * 60 * 60)).toFixed(2);
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <Clock className="mx-auto h-8 w-8 mb-2" />
          Please log in to view attendance tracking.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center">
          <Activity className="w-5 h-5 animate-spin mr-2" />
          Loading attendance data...
        </div>
      </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Connection Status */}
        <div className={`flex items-center justify-between p-3 rounded-lg ${isOnline ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">
              {isOnline ? '🟢 Real-time attendance tracking active' : '🔴 Connection lost - attendance may not sync'}
            </span>
          </div>
          {!isOnline && (
            <button 
              onClick={() => {
                loadTodayAttendance();
                loadAttendanceHistory();
              }}
              className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
            >
              Refresh
            </button>
          )}
        </div>

      {/* Today's Attendance Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Today's Attendance
          </h2>
          <div className="text-sm text-gray-500">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>

        {todayAttendance ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-600 text-sm font-medium">Clock In</div>
              <div className="text-lg font-bold text-blue-800">
                {formatTime(todayAttendance.clockInTime)}
              </div>
              <div className="text-xs text-blue-600">
                ✨ Automatically tracked on login
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-purple-600 text-sm font-medium">Clock Out</div>
              <div className="text-lg font-bold text-purple-800">
                {todayAttendance.clockOutTime ? formatTime(todayAttendance.clockOutTime) : 'Still working...'}
              </div>
              <div className="text-xs text-purple-600">
                ✨ Will auto-track on logout
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-600 text-sm font-medium">Hours Worked</div>
              <div className="text-lg font-bold text-green-800">
                {todayAttendance.isActive 
                  ? `${calculateCurrentWorkingHours()} hrs (live)`
                  : `${todayAttendance.totalHours || 0} hrs`
                }
              </div>
              <div className="text-xs text-green-600">
                {todayAttendance.isActive ? '⏰ Counting...' : '✅ Completed'}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg">No attendance today</p>
            <p className="text-sm">🚀 Login to automatically start tracking!</p>
          </div>
        )}
      </div>

      {/* Recent Attendance History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Recent Attendance
        </h3>

        {attendanceHistory.length > 0 ? (
          <div className="space-y-3">
            {attendanceHistory.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">
                    {formatDate(record.date)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatTime(record.clockInTime)} - {formatTime(record.clockOutTime)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">
                    {record.totalHours ? `${record.totalHours} hrs` : '-'}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {record.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No attendance history yet</p>
          </div>
        )}
      </div>        {/* How it works */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-bold text-blue-800 mb-2">🤖 How Automatic Attendance Works</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• ✅ <strong>Auto Clock-In:</strong> When you login to the system</li>
            <li>• ✅ <strong>Auto Clock-Out:</strong> When you logout from the system</li>
            <li>• ✅ <strong>Real-time Updates:</strong> Via WebSocket connections</li>
            <li>• ✅ <strong>Session Tracking:</strong> Handles timeouts automatically</li>
            <li>• ✅ <strong>No Manual Actions:</strong> Just login/logout normally!</li>
          </ul>
        </div>
      </div>
    );
};

export default AutoAttendanceTracker;

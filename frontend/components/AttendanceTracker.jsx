import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../src/front2backconnect/api.js';

const AttendanceTracker = () => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceApi.getToday();
      if (response.data.success) {
        setTodayAttendance(response.data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      setLoading(true);
      const response = await attendanceApi.clockIn();
      if (response.data.success) {
        await fetchTodayAttendance();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setLoading(true);
      const response = await attendanceApi.clockOut();
      if (response.data.success) {
        await fetchTodayAttendance();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Attendance Tracker</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {todayAttendance ? (
          <div className="bg-green-50 p-4 rounded">
            <h3 className="font-semibold">Today's Status</h3>
            <p>Clock In: {new Date(todayAttendance.clockInTime).toLocaleTimeString()}</p>
            {todayAttendance.clockOutTime && (
              <p>Clock Out: {new Date(todayAttendance.clockOutTime).toLocaleTimeString()}</p>
            )}
            {todayAttendance.totalHours && (
              <p>Total Hours: {todayAttendance.totalHours}</p>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded">
            <p>No attendance record for today</p>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={handleClockIn}
            disabled={todayAttendance && !todayAttendance.clockOutTime}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            Clock In
          </button>
          
          <button
            onClick={handleClockOut}
            disabled={!todayAttendance || todayAttendance.clockOutTime}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
          >
            Clock Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;
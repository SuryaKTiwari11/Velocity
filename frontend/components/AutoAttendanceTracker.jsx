import React, { useState, useEffect } from 'react';
import useAuthStore from '../src/store/authStore';
import { Clock, User, Activity } from 'lucide-react';

const AutoAttendanceTracker = () => {
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

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
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simple How It Works */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-bold text-blue-800 mb-3 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          How Attendance Works
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
          <div>• ✅ <strong>Login:</strong> Automatically clock in</div>
          <div>• ✅ <strong>Logout:</strong> Automatically clock out</div>
          <div>• ✅ <strong>Real-time:</strong> Track hours live</div>
          <div>• ✅ <strong>No manual work:</strong> Just login/logout!</div>
        </div>
      </div>
    </div>
  );
};

export default AutoAttendanceTracker;
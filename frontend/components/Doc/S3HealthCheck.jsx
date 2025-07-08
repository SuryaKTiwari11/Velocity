import React, { useState, useEffect } from 'react';
import { documentApi } from '../../src/front2backconnect/api';

const S3HealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkS3Health = async () => {
    setLoading(true);
    try {
      const response = await documentApi.health();
      setHealthStatus(response.data);
    } catch (error) {
      setHealthStatus({
        success: false,
        message: 'S3 connection failed',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkS3Health();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg border mb-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center">
          ☁️ S3 Storage Status
        </h3>
        <button 
          onClick={checkS3Health}
          disabled={loading}
          className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200"
        >
          {loading ? '⏳' : '🔄'} Check
        </button>
      </div>
      
      <div className="mt-2">
        {loading ? (
          <div className="text-gray-500 text-sm">Checking S3 connection...</div>
        ) : (
          <div className={`flex items-center text-sm ${
            healthStatus?.success ? 'text-green-600' : 'text-red-600'
          }`}>
            <span className="mr-2">
              {healthStatus?.success ? '✅' : '❌'}
            </span>
            {healthStatus?.message}
            {healthStatus?.timestamp && (
              <span className="text-gray-400 ml-2 text-xs">
                {new Date(healthStatus.timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default S3HealthCheck;

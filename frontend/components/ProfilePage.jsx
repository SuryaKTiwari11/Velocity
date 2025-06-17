import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../src/store/authStore.js';

const ProfilePage = () => {
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();  
  
  useEffect(() => {    const verifyAuth = async () => {
      const isAuthed = await checkAuth();
      
      if (!isAuthed) {
        navigate('/login');
      }
      setLoading(false);
    };
    
    verifyAuth();
  }, [checkAuth, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
    if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  const employeeInfo = user.employeeInfo || {
    id: user.id,
    position: 'Not specified',
    department: 'Not specified',
    salary: 0
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <p className="text-xl mb-6">
        Welcome, <span className="font-semibold">{user?.name}</span>
      </p>
      
      <div className="bg-white border rounded-lg p-6 shadow-sm max-w-lg">
        <h2 className="text-2xl font-semibold mb-4">Your Information</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-sm">Name</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Position</p>
            <p className="font-medium">{employeeInfo.position || 'Not set'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Department</p>
            <p className="font-medium">{employeeInfo.department || 'Not set'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500 text-sm">Salary</p>
            <p className="font-medium">${typeof employeeInfo.salary === 'number' ? employeeInfo.salary.toLocaleString() : 'Not set'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
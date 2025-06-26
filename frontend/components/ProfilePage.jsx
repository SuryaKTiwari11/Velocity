import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../src/store/authStore.js';

const ProfilePage = () => {
  const { user, isAuthenticated, checkAuth, isPremium, checkPremium } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuthed = await checkAuth();
      if (!isAuthed) {
        navigate('/login');
      } else {
        await checkPremium();
      }
      setLoading(false);
    };
    verifyAuth();
  }, [checkAuth, checkPremium, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen navbar-spacing">
        <div className="animate-spin  -full h-12 w-12 border-t-2 border-b-2 border-blue-500">loading...</div>
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
    <div className="p-6 max-w-4xl mx-auto navbar-spacing">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <p className="text-xl mb-6">
        Welcome, <span className="font-semibold">{user?.name}</span>
      </p>

     
      <div className="bg-white border p-6 -sm max-w-lg mb-6">
        <h2 className="text-xl font-semibold mb-4"> Account Status</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-lg font-medium ${isPremium ? 'text-green-600' : 'text-blue-600'}`}>
              {isPremium ? ' Premium Member' : ' Basic Account'}
            </p>
            <p className="text-sm text-orange-600 mt-1">
              {isPremium
                ? 'You can upload and manage documents'
                : 'Upgrade to upload and manage documents'
              }
            </p>
          </div>
          {!isPremium && (
            <button
              onClick={() => {
                const options = {
                  key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
                  amount: 9900, 
                  currency: "INR",
                  name: "EMS Premium Upgrade",
                  description: "Upgrade to premium account",
                  image: "/vite.svg",
                  handler: function (response) {
                    alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
                  },
                  prefill: {
                    name: user?.name,
                    email: user?.email,
                  },
                  theme: {
                    color: "#f97316"
                  },
                  method: {
                    upi: true,
                    card: false,
                    netbanking: false,
                    wallet: false
                  }
                };
                const rzp = new window.Razorpay(options);
                rzp.open();
              }}
              className="bg-orange-500 text-white px-4 py-2 "
            >
              Upgrade Now
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border p-6 shadow-sm max-w-lg">
        <h2 className="text-2xl font-semibold mb-4">Your Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-black text-sm">Name</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-black text-sm">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-black text-sm">Position</p>
            <p className="font-medium">{employeeInfo.position || 'Not set'}</p>
          </div>
          <div>
            <p className="text-black text-sm">Department</p>
            <p className="font-medium">{employeeInfo.department || 'Not set'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-black text-sm">Salary</p>
            <p className="font-medium">${typeof employeeInfo.salary === 'number' ? employeeInfo.salary.toLocaleString() : 'Not set'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

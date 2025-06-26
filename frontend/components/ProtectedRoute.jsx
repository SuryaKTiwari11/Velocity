import { useEffect, useState } from 'react';
import useAuthStore from '../src/store/authStore';

const ProtectedRoute = ({ children, requirePremium = false }) => {
  const { isAuthenticated, isPremium, user, checkPremium } = useAuthStore();
  const [checkingPremium, setCheckingPremium] = useState(requirePremium);

  useEffect(() => {
    if (requirePremium && isAuthenticated && user) {
      checkPremium().finally(() => setCheckingPremium(false));
    } else {
      setCheckingPremium(false);
    }
  }, [requirePremium, isAuthenticated, user, checkPremium]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-white text-black">
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p>Please log in to access this page</p>
      </div>
    );
  }

  if (requirePremium && checkingPremium) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-white text-black">
        <div className="mb-2">Loading...</div>
        <p>Checking access...</p>
      </div>
    );
  }

  if (requirePremium && !isPremium) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-white text-black">
      
        <h2 className="text-2xl font-semibold mb-2">Premium Feature</h2>
        <p className="mb-4 text-center max-w-xs"> Visit your profile to upgrade your account.</p>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-black text-white  "
            onClick={() => window.location.href = '/profile'}
          >
            Go to Profile
          </button>
         
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

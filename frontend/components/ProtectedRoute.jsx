import { useEffect, useState } from 'react';
import useAuthStore from '../src/store/authStore';

const ProtectedRoute = ({ children, requirePremium = false, requireAdmin = false, requireOnboarding = true }) => {
  const { isAuthenticated, isPremium, user, isAdmin, checkPremium } = useAuthStore();
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

  // Check admin access
  if (requireAdmin && (!user || !user.isAdmin)) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-white text-black">
        <h2 className="text-2xl font-semibold mb-2">Admin Access Required</h2>
        <p className="mb-4 text-center max-w-xs">This feature is only available to administrators.</p>
        <button
          className="px-4 py-2 bg-black text-white"
          onClick={() => window.location.href = '/'}
        >
          Go to Home
        </button>
      </div>
    );
  }

  // Check onboarding completion (skip for admins and specific routes)
  if (requireOnboarding && !isAdmin && user && user.onboardingStatus !== 'approved') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-white text-black">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎓</div>
          <h2 className="text-2xl font-semibold mb-2">Complete Your Onboarding</h2>
          <p className="mb-4 text-gray-600">
            You need to complete your onboarding process before accessing this feature.
          </p>
          <div className="space-y-2 mb-4">
            <div className="text-sm">
              Status: <span className="font-medium capitalize">{user.onboardingStatus?.replace('_', ' ')}</span>
            </div>
            {user.onboardingStatus === 'rejected' && (
              <div className="text-red-600 text-sm">
                Your documents were rejected. Please review and resubmit.
              </div>
            )}
          </div>
          <button
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.href = '/onboarding'}
          >
            Continue Onboarding
          </button>
        </div>
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

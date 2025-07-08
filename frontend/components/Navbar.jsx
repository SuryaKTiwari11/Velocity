import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../src/store/authStore";

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout, isPremium } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return (
    <nav className="bg-blue-500 p-2  navbar">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/">
            <h1 className="text-white font-bold">EMP Management</h1>
          </Link>
          {/* Company Registration only visible if not logged in */}
          {!isAuthenticated && (
            <Link to="/signup">
              <button className="bg-white text-blue-700 px-2 py-1 text-sm rounded">Company Registration</button>
            </Link>
          )}
          {/* Invite Signup removed: Admins should use HR Dashboard to invite users */}
        </div>
        {isAuthenticated && (
          <div className="flex gap-2 items-center">
            {user?.name && <span className="text-white text-sm">{user.name}</span>}
            {isAdmin && (
              <Link to="/hradmin">
                <button className="bg-green-600 text-white px-2 py-1 text-sm">HR Dashboard</button>
              </Link>
            )}
            {isAdmin && (
              <Link to="/analytics">
                <button className="bg-indigo-600 text-white px-2 py-1 text-sm">📊 Analytics</button>
              </Link>
            )}
            {isPremium && (
              <Link to="/documents">
                <button className="bg-purple-600 text-white px-2 py-1 text-sm">Documents</button>
              </Link>
            )}
            {/* Chat link for all authenticated users */}
            <Link to="/chat">
              <button className="bg-green-500 text-white px-2 py-1 text-sm">💬 Chat</button>
            </Link>
            {/* Attendance link for all authenticated users */}
            <Link to="/attendance">
              <button className="bg-orange-500 text-white px-2 py-1 text-sm">⏰ Attendance</button>
            </Link>
            {/* Admin Attendance Dashboard */}
            {isAdmin && (
              <Link to="/admin/attendance">
                <button className="bg-red-600 text-white px-2 py-1 text-sm">
                  👥 All Attendance
                </button>
              </Link>
            )}
            
            {/* Admin Verification Dashboard */}
            {isAdmin && (
              <Link to="/admin/verifications">
                <button className="bg-yellow-600 text-white px-2 py-1 text-sm">
                  🔍 Verify Users
                </button>
              </Link>
            )}
            
            {/* Onboarding link for non-approved users */}
            {!isAdmin && (
              <Link to="/onboarding">
                <button className="bg-blue-600 text-white px-2 py-1 text-sm">
                  🎓 Onboarding
                </button>
              </Link>
            )}
            
            <Link to='/profile'>
              <button className="text-white bg-amber-300 px-2 py-1 text-sm">
                Profile
              </button>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="bg-red-600 text-white px-2 py-1 text-sm">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

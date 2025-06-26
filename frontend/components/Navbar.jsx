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
    <nav className="bg-blue-500 p-2 fixed top-0 left-0 right-0 z-50 navbar">
      <div className="flex justify-between items-center">
        <Link to="/">
          <h1 className="text-white font-bold">EMP Management</h1>
        </Link>
          {isAuthenticated && (
          <div className="flex gap-2 items-center">
            {user?.name && <span className="text-white text-sm">{user.name}</span>}
            
            {isAdmin && (
              <Link to="/hradmin">
                <button className="bg-green-600 text-white px-2 py-1 text-sm">
                  HR Dashboard
                </button>
              </Link>
            )}
            
            {isPremium && (
              <Link to="/documents">
                <button className="bg-purple-600 text-white px-2 py-1 text-sm">
                   Documents
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

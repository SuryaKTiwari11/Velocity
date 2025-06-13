import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../src/store/authStore";

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  return (
    <nav className="bg-blue-500 p-2">
      <div className="flex justify-between items-center">
        <Link to="/">
          <h1 className="text-white font-bold">EMP Management</h1>
        </Link>
        <div className="flex gap-2 items-center">
          {isAuthenticated ? (
            <>
              {user?.name && <span className="text-white text-sm">{user.name}</span>}
              
              {isAdmin && (
                <Link to="/add">
                  <button className="bg-black text-white px-2 py-1 text-sm">
                    Add Employee
                  </button>
                </Link>
              )}
                <Link to={isAdmin ? "/hradmin" : "/profile"}>
                <button className="bg-green-600 text-white px-2 py-1 text-sm">
                  {isAdmin ? "HR Dashboard" : "My Profile"}
                </button>
              </Link>
              
              <button 
                onClick={handleLogout}
                className="bg-red-600 text-white px-2 py-1 text-sm">
                Logout
              </button>
            </>          ) : (
            <>
              {/* No login/signup buttons in navbar */}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../src/front2backconnect/api.js";

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  
  useEffect(() => {
    if (location.state?.resetToken && location.state?.email) {
      setResetToken(location.state.resetToken);
      setEmail(location.state.email);
    } else {
      setMessage("Reset token not found. Redirecting to forgot password page...");
      setTimeout(() => {
        navigate("/forgot-password");
      }, 1000);
    }
  }, [navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    if(!newPassword || !confirmPassword) {
      setMessage("Please fill in both password fields");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage("Passwords don't match");
      return;
    }

    if (!resetToken) {
      setMessage("Reset token not found. Please try again");
      return;
    }
    
    setIsLoading(true);
    setMessage("");
    
    try {
      const response = await authApi.resetPassword(resetToken, newPassword, email);
      
      if (response.data.success) {
        setIsSuccess(true);    
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        throw new Error("Password reset failed");
      }
    } catch (error) {
      setIsSuccess(false);
      if (error?.response?.data?.err === "Cant use same password") {
        setMessage("New password cannot be the same as your old password. Please choose a different password.");
      } else if (error?.error?.response?.data?.message?.includes("token")) {
        setMessage("Invalid or expired reset link. Redirecting...");
        setTimeout(() => navigate("/forgot-password"), 1500);
      } else {
        setMessage("Password reset failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white">
        <h1 className="text-2xl font-bold mb-6 text-center">Set New Password</h1>
        
        {message && (
          <div 
            className={`p-3 mb-4 rounded ${
              isSuccess ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="newPassword" className="block mb-1 font-medium">
              New Password
            </label>
          
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border"
              placeholder="Enter new password"
              required
            />
      
          </div>
          
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block mb-1 font-medium">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border"
              placeholder="Confirm new password"
              required
            />
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-gray-200 text-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;

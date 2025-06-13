import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../src/front2backconnect/api.js";

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Get reset token from localStorage
    const token = localStorage.getItem("resetToken");
    if (!token) {
      // Redirect to forgot password if token is not found
      navigate("/forgot-password");
    } else {
      setResetToken(token);
    }
  }, [navigate]);

  const validatePassword = (password) => {
    // Add your password validation logic here
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    return null;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setMessage(passwordError);
      return;
    }
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setMessage("Passwords don't match");
      return;
    }
    
    // Double-check we have token
    if (!resetToken) {
      setMessage("Reset token not found. Please restart the password reset process.");
      return;
    }
    
    setIsLoading(true);
    setMessage("");
    
    try {
      console.log("Attempting password reset with token:", resetToken);
      const response = await authApi.resetPassword(resetToken, newPassword);
      
      if (response.data.success) {
        setIsSuccess(true);
        setMessage("Password reset successfully! Redirecting to login...");
        
        // Clear localStorage
        localStorage.removeItem("resetEmail");
        localStorage.removeItem("resetToken");
        
        // Navigate to login after successful reset
        setTimeout(() => navigate("/login"), 2000);
      } else {
        throw new Error(response.data.error || "Password reset failed");
      }
    } catch (error) {
      setIsSuccess(false);
      console.error("Password reset error:", error);
      setMessage(error.response?.data?.error || error.message || "Password reset failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
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
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter new password"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Must be at least 8 characters long
            </p>
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
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Confirm new password"
              required
            />
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition w-1/2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition w-1/2 disabled:opacity-50"
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

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
  const [isSuccess, setIsSuccess] = useState(false);  useEffect(() => {
   
    const token = localStorage.getItem("resetToken");
    if (!token) {
   
      setMessage("Reset token not found. Redirecting to forgot password page...");
      setTimeout(() => {
        navigate("/forgot-password");
      }, 1000);
    } else {
      setResetToken(token);
    }
  }, [navigate]);
  // Function to check password strength
  const checkPasswordStrength = (password) => {
    // Minimum length check
    if (password.length < 8) {
      return { isStrong: false, message: "Password must be at least 8 characters long" };
    }
    
    // Check for at least one uppercase letter, one lowercase letter, and one number
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return { 
        isStrong: false, 
        message: "Password must include at least one uppercase letter, one lowercase letter, and one number" 
      };
    }
    
    return { isStrong: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if(!newPassword || !confirmPassword) {
      setMessage("Please fill in both password fields");
      return;
    }
    
    // Check password strength
    const strengthCheck = checkPasswordStrength(newPassword);
    if (!strengthCheck.isStrong) {
      setMessage(strengthCheck.message);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage("Passwords don't match");
      return;
    }

    if (!resetToken) {
      setMessage("Reset token not found. Please restart the password reset process.");
      return;
    }
    
    setIsLoading(true);
    setMessage("");try {
      const response = await authApi.resetPassword(resetToken, newPassword);
      
      if (response.data.success) {
        setIsSuccess(true);
        setMessage("Password reset successfully! Redirecting to login...");
        
        // Clear localStorage
        localStorage.removeItem("resetEmail");
        localStorage.removeItem("resetToken");
        
        // Add timeout to show success message before redirecting
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        throw new Error(response.data.error || "Password reset failed");
      }
    } catch (error) {
      setIsSuccess(false);
      const errorMsg = error.response?.data?.error || error.message || "Password reset failed. Please try again.";
      
      // Handle specific error for same password
      if (errorMsg.includes("same as your current password")) {
        setMessage("You cannot use your current password as your new password. Please choose a different password.");
      } else {
        setMessage(`Error: ${errorMsg}`);
        
        // If token is invalid, redirect to forgot password
        if (errorMsg.includes("token") && (errorMsg.includes("invalid") || errorMsg.includes("expired"))) {
          setTimeout(() => {
            localStorage.removeItem("resetToken");
            navigate("/forgot-password");
          }, 1000);
        }
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
        
        <form onSubmit={handleSubmit}>          <div className="mb-4">
            <label htmlFor="newPassword" className="block mb-1 font-medium">
              New Password
            </label>
            <div className="text-xs text-gray-500 mb-1">
              Password must be at least 8 characters and include uppercase, lowercase, and numbers
            </div>
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
              className="w-full p-2 border  "
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

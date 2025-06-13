import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../src/front2backconnect/api.js";

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage("Please enter your email address");
      return;
    }
    
    setIsLoading(true);
    setMessage("");
    
    try {
      console.log("Sending password reset request for:", email);
      const response = await authApi.forgotPassword(email);
      
      if (response.data.success) {
        setIsSuccess(true);
        setMessage(response.data.message || "Reset code sent successfully to your email");
        
        // Store email in localStorage for the next step
        localStorage.setItem("resetEmail", email);
        
        // If we have a preview URL (for development with Ethereal email)
        if (response.data.previewUrl) {
          // Set the preview URL to display in the UI
          window.open(response.data.previewUrl, "_blank");
        }
          // Navigate after a delay to give user time to read the message
        setTimeout(() => navigate("/verify-otp", { 
          state: { 
            email, 
            mode: "reset",
            previewUrl: response.data.previewUrl 
          } 
        }), 2000);
      } else {
        throw new Error(response.data.message || "Failed to send reset code");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setIsSuccess(false);
      setMessage(error.response?.data?.message || error.message || "An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Your Password</h1>
        
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
            <label htmlFor="email" className="block mb-1 font-medium">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email address"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              We'll send a password reset code to this email
            </p>
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
              {isLoading ? "Sending..." : "Send Reset Code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;

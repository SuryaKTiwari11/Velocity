import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../src/front2backconnect/api.js";

const VerifyOTPForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [mode, setMode] = useState("email"); // "reset" for password reset or "email" for email verification
  const [previewUrl, setPreviewUrl] = useState("");  useEffect(() => {
    // First check location state (passed from other components using navigate)
    console.log("Checking location state:", location.state);
    
    if (location.state?.email) {
      console.log("Using email from location state:", location.state.email);
      setEmail(location.state.email);
      
      if (location.state.mode) {
        console.log("Using mode from location state:", location.state.mode);
        setMode(location.state.mode);
      }
      
      if (location.state.previewUrl) {
        console.log("Setting preview URL from location state");
        setPreviewUrl(location.state.previewUrl);
      }
    } else {
      // Check query params second
      const queryParams = new URLSearchParams(location.search);
      const queryEmail = queryParams.get("email");
      const queryMode = queryParams.get("mode");
      const queryPreview = queryParams.get("preview");
      
      if (queryEmail) {
        console.log("Using email from query params:", queryEmail);
        setEmail(queryEmail);
      } else {
        // Fallback to localStorage
        const resetEmail = localStorage.getItem("resetEmail");
        const verifyEmail = localStorage.getItem("verifyEmail");
        
        if (verifyEmail) {
          console.log("Using email from localStorage (verify):", verifyEmail);
          setEmail(verifyEmail);
          setMode("email");
        } else if (resetEmail) {
          console.log("Using email from localStorage (reset):", resetEmail);
          setEmail(resetEmail);
          setMode("reset");
        } else {
          console.log("No email found, redirecting to forgot password");
          // Redirect if no email found
          navigate("/forgot-password");
        }
      }
        
      // Set mode if provided in query
      if (queryMode) {
        setMode(queryMode);
      }
      
      // Set preview URL if available
      if (queryPreview) {
        setPreviewUrl(queryPreview);
      }
    }
  }, [navigate, location]);  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length < 4) {
      setMessage("Please enter a valid verification code");
      return;
    }
    
    setIsLoading(true);
    setMessage("");
    
    try {
      let response;
      
      if (mode === "email") {
        // Email verification flow
        console.log("Verifying email OTP for:", email);
        response = await authApi.verifyOTP(email, otp);
        
        if (response.data.success) {
          setIsSuccess(true);
          setMessage("Email verified successfully! You can now log in.");
          
          // Remove email from localStorage
          localStorage.removeItem("verifyEmail");
          
          // Redirect to login after a short delay
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      } else {
        // Password reset flow
        console.log("Verifying reset OTP for email:", email);
        response = await authApi.verifyResetOTP(email, otp);
        
        if (response.data.success) {
          setIsSuccess(true);
          setMessage("Code verified successfully! You can now reset your password.");
          
          // Make sure the resetToken is properly extracted from response
          const resetToken = response.data.resetToken;
          if (!resetToken) {
            throw new Error("Reset token not received from server");
          }
          
          // Store the reset token in localStorage for the next step
          localStorage.setItem("resetToken", resetToken);
          console.log("Reset token stored:", resetToken);
          
          // Redirect to reset password page after a short delay
          setTimeout(() => {
            navigate("/reset-password");
          }, 1500);
        }
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setMessage(
        error.response?.data?.message || "Invalid or expired verification code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-md">        <h1 className="text-2xl font-bold mb-4">
          {mode === "email" ? "Verify Your Email" : "Verify Password Reset Code"}
        </h1>
        
        <p className="mb-4 text-gray-600">
          {mode === "email" 
            ? "Please enter the verification code sent to your email to complete your registration." 
            : "Please enter the password reset code sent to your email."}
        </p>
        
        {message && (
          <div
            className={`mb-4 p-3 ${
              isSuccess ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            } rounded`}
          >
            {message}
          </div>
        )}
        
        {previewUrl && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
            <p className="mb-2"><strong>Debug Mode:</strong> Email preview available</p>
            <a 
              href={previewUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View Email with Verification Code
            </a>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded"
              value={email}
              readOnly
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Verification Code
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter the code sent to your email"
              maxLength={6}
              required
            />
          </div>
          
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition w-1/2 disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>
          </div>
            <div className="mt-4 flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-blue-500 hover:underline"
            >
              Back to Login
            </button>
            
            <button
              type="button"
              onClick={async () => {
                try {
                  setIsLoading(true);
                  setMessage("Sending new verification code...");
                  const response = await authApi.resendOTP(email);
                  
                  if (response.data.success) {
                    setIsSuccess(true);
                    setMessage("New verification code sent successfully!");
                    
                    // If we have a preview URL (for development with Ethereal email)
                    if (response.data.previewUrl) {
                      setPreviewUrl(response.data.previewUrl);
                      window.open(response.data.previewUrl, "_blank");
                    }
                  } else {
                    throw new Error(response.data.message || "Failed to send verification code");
                  }
                } catch (error) {
                  console.error("Error sending verification code:", error);
                  setIsSuccess(false);
                  setMessage("Failed to send verification code. Please try again.");
                } finally {
                  setIsLoading(false);
                }
              }}
              className="text-blue-500 hover:underline"
              disabled={isLoading}
            >
              Resend Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Explicitly export the component
export default VerifyOTPForm;

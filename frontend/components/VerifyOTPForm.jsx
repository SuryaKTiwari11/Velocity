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
  const [mode, setMode] = useState("email");
  const [previewUrl, setPreviewUrl] = useState("");
  
  useEffect(() => {
    // Get email from location state, query params, or localStorage
    if (location.state?.email) {
      setEmail(location.state.email);
      if (location.state.mode) setMode(location.state.mode);
      
      // Check if we have a preview URL in the state
      if (location.state.previewUrl) {
        setPreviewUrl(location.state.previewUrl);
      }
    } else {
      const queryParams = new URLSearchParams(location.search);
      const queryEmail = queryParams.get("email");
      const queryMode = queryParams.get("mode");
      const queryPreviewUrl = queryParams.get("previewUrl");
      
      if (queryEmail) {
        setEmail(queryEmail);
        if (queryMode) setMode(queryMode);
        if (queryPreviewUrl) setPreviewUrl(queryPreviewUrl);
      } else {
        const resetEmail = localStorage.getItem("resetEmail");
        const verifyEmail = localStorage.getItem("verifyEmail");
        const storedPreviewUrl = localStorage.getItem("emailPreviewUrl");
        
        if (storedPreviewUrl) {
          setPreviewUrl(storedPreviewUrl);
        }
        
        if (verifyEmail) {
          setEmail(verifyEmail);
          setMode("email");
        } else if (resetEmail) {
          setEmail(resetEmail);
          setMode("reset");
        } else {
          navigate("/forgot-password");
        }
      }
    }
  }, [navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      setMessage("Please enter a valid verification code");
      return;
    }
    
    setIsLoading(true);
    setMessage("");
    
    try {
      let response;
      
      if (mode === "email") {
        response = await authApi.verifyOTP(email, otp);
        
        if (response.data.success) {
          setIsSuccess(true);
          setMessage("Email verified successfully!");
          localStorage.removeItem("verifyEmail");
          localStorage.removeItem("emailPreviewUrl");
          
          // Add timeout to show success message before redirecting
          setTimeout(() => {
            navigate("/login");
          }, 1000);
        }
      } else {        response = await authApi.verifyResetOTP(email, otp);
        
        if (response.data.success) {
          setIsSuccess(true);
          setMessage("Code verified successfully!");
            // Store the reset token and redirect
          if (response.data.resetToken) {
            localStorage.setItem("resetToken", response.data.resetToken);
            localStorage.setItem("resetEmail", email);
            localStorage.removeItem("emailPreviewUrl");
            
            setTimeout(() => {
              navigate("/reset-password");
            }, 1000);
          } else {
            setMessage("Error: No reset token received. Please try again.");
            setIsSuccess(false);
          }
        }
      }    } catch (err) {
      setIsSuccess(false);
      setMessage(err.response?.data?.message || "Invalid or expired verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    try {
      setIsLoading(true);
      setMessage("Sending new verification code...");
      const response = await authApi.resendOTP(email);
      
      if (response.data.success) {
        setIsSuccess(true);
        setMessage("New verification code sent successfully!");
        
        // Store the preview URL if available
        if (response.data.previewUrl) {
          setPreviewUrl(response.data.previewUrl);
          localStorage.setItem("emailPreviewUrl", response.data.previewUrl);
          
          // Open the preview URL in a new tab
          window.open(response.data.previewUrl, "_blank");
        }
      } else {
        throw new Error(response.data.message || "Failed to send verification code");
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage("Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const openEmailPreview = () => {
    if (previewUrl) {
      window.open(previewUrl, "_blank");
    } else {
      // If no preview URL is available, resend the code
      resendCode();
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white  w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Verification
        </h1>

        {message && (
          <div className={`p-2 mb-4 rounded ${isSuccess ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              className="w-full p-2 "
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
              className="w-full p-2 "
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
              className="px-4 py-2 bg-blue-500 text-white "
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-blue-500"
            >
              Back to Login
            </button>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={openEmailPreview}
                className="text-green-600 font-medium"
              >
                View Email
              </button>
              
              <button
                type="button"
                onClick={resendCode}
                className="text-blue-500"
                disabled={isLoading}
              >
                Resend Code
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTPForm;

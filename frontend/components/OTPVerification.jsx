import React, { useEffect, useState } from "react";
import { authApi } from "../src/front2backconnect/api.js";

const OTPVerification = ({ 
  email,
  setEmail, 
  mode = "email",
  onSuccess, 
  onCancel,
  previewUrl: initialPreviewUrl = ""
}) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [previewUrl, setPreviewUrl] = useState(initialPreviewUrl);
  
  useEffect(() => {
    if (initialPreviewUrl) {
      setPreviewUrl(initialPreviewUrl);
    }
  }, [initialPreviewUrl]);
    const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setErrorMsg("Please enter a valid 6-digit verification code");
      return;
    }
    
    if (!email) {
      setErrorMsg("Please enter your email address");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      let response;
      
      if (mode === "email") {
        response = await authApi.verifyOTP(email, otp);
        
        if (response.data.success) {
          onSuccess(response.data);
        }
      } else { 
        response = await authApi.verifyResetOTP(email, otp);
        
        if (response.data.success) {
          if (response.data.resetToken) {
            onSuccess({...response.data, email});
          } else {
            throw new Error("No reset token received");
          }
        }
      }} catch {
      setErrorMsg("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleResendCode = async () => {
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const response = await authApi.resendOTP(email);
      
      if (response.data.success) {
        setErrorMsg("New verification code sent to your email.");
        
        if (response.data.previewUrl) {
          setPreviewUrl(response.data.previewUrl);
          window.open(response.data.previewUrl, "_blank");
        }
      }} catch {
      setErrorMsg("Failed to resend verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    
      {errorMsg && (
        <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
          {errorMsg}
        </div>
      )}
      
      
      <p className="mb-4 text-bllack">
        Enter the verification code sent to {email}
      </p>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="border p-2 w-full mb-4"
          placeholder="Verification code"
          maxLength={6}
          required
        />
        
        <div className="flex gap-2 mb-4">
          <button 
            type="submit" 
            className="bg-blue-500 text-white p-2 w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </button>
          
          <button
            type="button"
            onClick={handleResendCode}
            className="bg-white text-black border p-2 w-full"
            disabled={isLoading}
          >
            Resend Code
          </button>
        </div>

        <div className="text-center flex flex-col items-center">
          <button 
            type="button" 
            onClick={onCancel} 
            className="text-red-500 "
          >
            {mode === "reset" ? "Back to Forgot Password" : "Back to Login"}
          </button>
            {/* Always show the debug info in development */}
      <div className="mb-4 p-0 text-center rounded">
        
        {previewUrl ? (
          <a 
            href={previewUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline"
          >
            View Email Preview
          </a>
        ) : (
          <button
            type="button"
            onClick={handleResendCode}
            className="text-black underline "
          >
             preview link
          </button>
        )}
      </div>
        </div>
      </form>
    </>
  );
};

export default OTPVerification;

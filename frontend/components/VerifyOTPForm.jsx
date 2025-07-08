import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyOTPForm = () => {
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState("email");
  
useEffect(() => {
    const qParams = new URLSearchParams(loc.search);
    const qMode = qParams.get("mode");
    const qEmail = qParams.get("email");
    
    if (qMode === "reset") {
      setMode("reset");
    }
    
    if (qEmail) {
      setEmail(qEmail);
    }
  }, [loc.search]);
  const handleSuccess = (data) => {
    if (mode === "reset") {
      nav("/reset-password", { state: { email: data.email, resetToken: data.resetToken }});
    } else {
      // Redirect new users to onboarding after email verification
      nav("/onboarding");
    }
  };

  const handleCancel = () => {
    if (mode === "reset") {
      nav("/forgot-password");
    } else {
      nav("/login");
    }
  };  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  
  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">
          {mode === "reset" ? "Reset Password" : "Verify Your Email"}
        </h1>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
            Email Address
          </label>          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            className="w-full p-2 border "
            placeholder="Enter your email address"
            required
          />
        </div>
        
        {/* Simple OTP Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Enter OTP</label>
          <input
            type="text"
            className="w-full p-2 border  "
            placeholder="Enter 6-digit OTP"
            maxLength="6"
          />
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={handleSuccess}
            className="flex-1 bg-blue-600 text-white py-2 px-4   hover:bg-blue-700"
          >
            Verify OTP
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-600 text-white py-2 px-4   hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPForm;

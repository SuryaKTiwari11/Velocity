import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import OTPVerification from "./OTPVerification";

const VerifyOTPForm = () => {
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState("email");
  const [previewUrl, setPreviewUrl] = useState("");
  
useEffect(() => {
    const qParams = new URLSearchParams(loc.search);
    const qMode = qParams.get("mode");
    const qEmail = qParams.get("email");
    const qPreviewUrl = qParams.get("previewUrl");
    
    if (qMode === "reset") {
      setMode("reset");
    }
    
    if (qEmail) {
      setEmail(qEmail);
    }
    
    if (qPreviewUrl) {
      setPreviewUrl(qPreviewUrl);
    }
  }, [loc.search]);
  const handleSuccess = (data) => {
    if (mode === "reset") {
      nav("/reset-password", { state: { email: data.email, resetToken: data.resetToken }});
    } else {
      nav("/login");
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
        <OTPVerification
          email={email}
          setEmail={setEmail}
          mode={mode}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          previewUrl={previewUrl}
        />
      </div>
    </div>
  );
};

export default VerifyOTPForm;

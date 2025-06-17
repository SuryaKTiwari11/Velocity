import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../src/front2backconnect/api.js";

const VerifyOTPForm = () => {
  const nav = useNavigate();
  const loc = useLocation();
  
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [mode, setMode] = useState("email");
  const [prevUrl, setPrevUrl] = useState("");
  
  useEffect(() => {
    if (loc.state?.email) {
      setEmail(loc.state.email);
      if (loc.state.mode) setMode(loc.state.mode);
      
      if (loc.state.previewUrl) {
        setPrevUrl(loc.state.previewUrl);
      }
    } else {
      const qParams = new URLSearchParams(loc.search);
      const qEmail = qParams.get("email");
      const qMode = qParams.get("mode");
      const qPrevUrl = qParams.get("previewUrl");
      
      if (qEmail) {
        setEmail(qEmail);
        if (qMode) setMode(qMode);
        if (qPrevUrl) setPrevUrl(qPrevUrl);
      } else {
        const rstEmail = localStorage.getItem("resetEmail");
        const verifyEm = localStorage.getItem("verifyEmail");
        const urlPreview = localStorage.getItem("emailPreviewUrl");
        
        if (urlPreview) {
          setPrevUrl(urlPreview);
        }
        
        if (verifyEm) {
          setEmail(verifyEm);
          setMode("email");
        } else if (rstEmail) {
          setEmail(rstEmail);
          setMode("reset");
        } else {
          nav("/forgot-password");
        }
      }
    }
  }, [nav, loc]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      setMsg("Plz enter valid code");
      return;
    }
    
    setLoading(true);
    setMsg("");
    
    try {
      let resp;
      
      if (mode === "email") {
        resp = await authApi.verifyOTP(email, otp);
        
        if (resp.data.success) {
          setSuccess(true);
          setMsg("Email verifed!");
          localStorage.removeItem("verifyEmail");
          localStorage.removeItem("emailPreviewUrl");
          
          setTimeout(() => {
            nav("/login");
          }, 1000);
        }
      } else {
        resp = await authApi.verifyResetOTP(email, otp);
        
        if (resp.data.success) {
          setSuccess(true);
          setMsg("Code verifed!");
          if (resp.data.resetToken) {
            localStorage.setItem("resetToken", resp.data.resetToken);
            localStorage.setItem("resetEmail", email);
            localStorage.removeItem("emailPreviewUrl");
            
            setTimeout(() => {
              nav("/reset-password");
            }, 1000);
          } else {
            setMsg("Error: No token. Try again.");
            setSuccess(false);
          }
        }
      }
    } catch {  
          setSuccess(false);
      setMsg("Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    try {
      setLoading(true);
      setMsg("Sending code...");
      const resp = await authApi.resendOTP(email);
      
      if (resp.data.success) {
        setSuccess(true);
        setMsg("New code sent!");
        
        if (resp.data.previewUrl) {
          setPrevUrl(resp.data.previewUrl);
          localStorage.setItem("emailPreviewUrl", resp.data.previewUrl);
          window.open(resp.data.previewUrl, "_blank");
        }      } else {
        throw new Error("Failed to send code");
      }    } catch {
      setSuccess(false);
      setMsg("Failed to send code. Try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const openEmail = () => {
    if (prevUrl) {
      window.open(prevUrl, "_blank");
    } else {
      resendCode();
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white  w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Verification
        </h1>

        {msg && (
          <div className={`p-2 mb-4 rounded ${success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {msg}
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
              placeholder="Enter code sent to ur email"
              maxLength={6}
              required
            />
          </div>
          
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white "
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <button
              type="button"
              onClick={() => nav("/login")}
              className="text-blue-500"
            >
              Back to Login
            </button>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={openEmail}
                className="text-green-600 font-medium"
              >
                View Email
              </button>
              
              <button
                type="button"
                onClick={resendCode}
                className="text-blue-500"
                disabled={loading}
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

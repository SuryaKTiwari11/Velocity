import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../src/front2backconnect/api.js";

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage("Please enter your email address");
      return;
    }
    
    setIsLoading(true);
    setMessage("");
    
    try {
      const response = await authApi.forgotPassword(email);
      
      if (response.data.success) {        setIsSuccess(true);
        setMessage("Reset code sent successfully to your email");
        localStorage.setItem("resetEmail", email);
          if (response.data.previewUrl) {
          setPreviewUrl(response.data.previewUrl);
          localStorage.setItem("emailPreviewUrl", response.data.previewUrl);
        }
        
        setTimeout(() => {
          navigate("/verify-otp", { 
            state: { 
              email: email, 
              mode: "reset",
              previewUrl: response.data.previewUrl 
            } 
          });
        }, 1000);
      } else {
        throw new Error("Failed to send reset code");
      }    } catch {
      setIsSuccess(false);
      setMessage("An error occurred while sending the reset code");
    } finally {
      setIsLoading(false);
    }
  };
  
  const openEmailPreview = () => {
    if (previewUrl) {
      window.open(previewUrl, "_blank");
    } else {
      setMessage("No email preview available yet. Submit the form first.");
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Your Password</h1>
        
        {message && (
          <div className={`bg-${isSuccess ? 'green' : 'red'}-100 text-${isSuccess ? 'green' : 'red'}-700 p-2 mb-4 rounded`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1 font-medium">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your email address"
              required
            />
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-gray-200 text-black rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >           
              {isLoading ? "Sending..." : "Send Reset Code"}
            </button>
            
            {isSuccess && previewUrl && (
              <button
                type="button"
                onClick={openEmailPreview}
                className="px-4 py-2 bg-green-500 text-white rounded ml-auto"
              >
                View Email
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;

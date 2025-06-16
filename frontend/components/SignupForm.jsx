import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../src/store/authStore";
import { authApi } from "../src/front2backconnect/api.js";
import SSO from "./SSO";

const SignupForm = () => {
  const navigate = useNavigate();
  const { signup } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
    const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
    const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }
    
    // Create user data object without confirmPassword
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password
    };
    
    try {
      const result = await signup(userData);
      
      if (result.success) {
        // Store the email for verification
        localStorage.setItem("verifyEmail", userData.email);
        
        // Show success message
        setError("Account created successfully! Preparing verification...");
        
        // Send verification OTP
        try {
          const otpResponse = await authApi.resendOTP(userData.email);
          
          if (otpResponse.data.success) {
            let previewUrl = null;
            
            // If in development and we have a preview URL for the email
            if (otpResponse.data.previewUrl) {
              previewUrl = otpResponse.data.previewUrl;
              
              // Store preview URL for later use
              localStorage.setItem("emailPreviewUrl", previewUrl);
            }
            
            // Add timeout to show success message before redirecting
            setTimeout(() => {
              navigate("/verify-otp", { 
                state: { 
                  email: userData.email, 
                  mode: "email",
                  previewUrl: previewUrl
                } 
              });
            }, 1000);
          } else {
            setError("Account created, but couldn't send verification email. Try again later.");
          }
        } catch (otpError) {
          setError("Account created, but couldn't send verification email. Try again later.");
        }
      } else {
        setError(result.error || "Signup failed. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };
    return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="p-4 bg-white max-w-md mx-auto mt-10 w-full rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Create Account</h1>
        
        {error && <div className="bg-red-100 text-red-700 p-2 mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit}>          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border p-2 w-full mb-3"
            placeholder="Full Name"
            required
          />
          
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 w-full mb-3"
            placeholder="Email"
            required
          />
          
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="border p-2 w-full mb-3"
            placeholder="Password"
            required
          />
          
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="border p-2 w-full mb-4"
            placeholder="Confirm Password"
            required
          />
            <button className="bg-blue-500 text-white p-2 rounded w-full" disabled={isLoading}>
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>        </form>
        
        <SSO />
        
        <div className="mt-4 text-center">
          <p>
            Already have an account?{" "}
            <button 
              type="button"
              onClick={() => navigate("/login")} 
              className="text-blue-500 underline"
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;

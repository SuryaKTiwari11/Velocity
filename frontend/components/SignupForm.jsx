import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../src/store/authStore";
import { authApi } from "../src/front2backconnect/api.js";

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
  const [signupComplete, setSignupComplete] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    // Create user data object without confirmPassword
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password
    };
    
    try {
      console.log("Signing up user:", userData.email);
      const result = await signup(userData);
      
      if (result.success) {
        setSignupComplete(true);
        
        // Store the email for verification
        localStorage.setItem("verifyEmail", userData.email);
        
        console.log("Signup successful, sending verification OTP");
        
        // Send verification OTP
        try {
          const otpResponse = await authApi.resendOTP(userData.email, userData.name);
          
          if (otpResponse.data.success) {
            console.log("Verification OTP sent successfully");
            
            // If in development and we have a preview URL for the email
            if (otpResponse.data.previewUrl) {
              window.open(otpResponse.data.previewUrl, "_blank");
            }
            
            // Navigate to verification page after a short delay
            setTimeout(() => {
              navigate("/verify-otp", { 
                state: { email: userData.email, mode: "email" } 
              });
            }, 1500);
          } else {
            console.error("Failed to send verification OTP");
          }
        } catch (otpError) {
          console.error("Error sending verification OTP:", otpError);
        }
      } else {
        setError(result.error || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("An unexpected error occurred during signup");
    }
  };
  
  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="p-4 bg-white max-w-md mx-auto mt-10">
        <h1 className="text-2xl font-bold mb-4">Create Account</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-2 mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border p-2 w-full"
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border p-2 w-full"
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="block mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="border p-2 w-full"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="border p-2 w-full"
              required
            />
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="bg-gray-300 px-3 py-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-3 py-1"
            >
              Sign Up
            </button>
          </div>
        </form>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-center mb-4">Or sign up with</p>
          <div className="flex gap-4 justify-center">
            <button
              type="button"
              onClick={() => {
                window.location.href = authApi.getGoogleAuthUrl();
              }}
              className="bg-white border border-gray-300 px-4 py-2 rounded flex items-center shadow-sm hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = authApi.getGithubAuthUrl();
              }}
              className="bg-gray-900 text-white px-4 py-2 rounded flex items-center shadow-sm hover:bg-gray-800"
            >
              <svg className="w-5 h-5 mr-2" fill="white" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p>
            Already have an account?{" "}
            <button 
              type="button"
              onClick={() => navigate("/login")} 
              className="text-blue-500 hover:underline"
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>  );
};

export default SignupForm;

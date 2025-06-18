import { useState } from "react";
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
  const [status, setStatus] = useState({ message: "", isError: false });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: "", isError: false });
    setIsLoading(true);
      try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      };      
      const result = await signup(userData);
      if (!result.success) {
        throw new Error("Signup failed. Please try again.");
      }
      setStatus({ message: "Account created. Preparing verification...", isError: false });
      
      const otpResponse = await authApi.resendOTP(userData.email);
      if (!otpResponse.data.success) {
        throw new Error("Account created, but couldn't send verification email. Try again later.");
      }
      
    
      const previewUrl = otpResponse.data.previewUrl || null;    
      const searchParams = new URLSearchParams();
      searchParams.set("mode", "email");
      searchParams.set("email", userData.email);
      if (previewUrl) {
        searchParams.set("previewUrl", previewUrl);
      }
      
      const searchString = searchParams.toString();
      
      setTimeout(() => {
        navigate(`/verify-otp?${searchString}`);
      }, 1000);
      
    } catch (error) {
      setStatus({ message: error.message || "An unexpected error occurred", isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="p-4 bg-white max-w-md mx-auto mt-10 w-full">
        <h1 className="text-2xl font-bold mb-4">Create Account</h1>
        
        {status.message && (
          <div 
            className={`p-2 mb-4 ${
              status.isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}
          >
            {status.message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
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
          
          <button className="bg-blue-500 text-white p-2 w-full" disabled={isLoading}>
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        
        <SSO />
        
        <div className="mt-4 text-center">
          <p>
            Already have an account?{" "}
            <button 
              type="button"
              onClick={() => navigate("/login")} 
              className="text-red-500 "
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

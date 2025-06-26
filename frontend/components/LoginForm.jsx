import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../src/store/authStore";
import { authApi } from "../src/front2backconnect/api.js";
import SSO from "./SSO";

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, ssoSuccess } = useAuthStore();
  const { isAdmin } = useAuthStore();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? "/hradmin" : "/profile");
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    const errorParam = searchParams.get("error");
    const tokenParam = searchParams.get("token");
    
    if (errorParam) {
      setError(errorParam === "failed" ? "Authentication failed." : "An error occurred.");
    }
    
    if (tokenParam) {
      localStorage.setItem("sso-token", tokenParam);
    }
    
    if (location.pathname === "/login/success") {
      setIsLoading(true);
      ssoSuccess()
        .then((result) => {
          if (result.success) {
            navigate(useAuthStore.getState().isAdmin ? "/hradmin" : "/profile");
          } else {
            setError("Authentication failed");
          }
        })
        .catch(() => setError("Failed to complete authentication."))
        .finally(() => setIsLoading(false));
    }
  }, [isAuthenticated, isAdmin, navigate, location, ssoSuccess]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");  
      if (!formData.email || !formData.password) {
      setError("Please provide both email and password");
      return;
    }

    try {
      const result = await login(formData);
      if (result.success) return;

      if (result.needsVerification) {
        setNeedsVerification(true);
        localStorage.setItem("verifyEmail", formData.email);
        setIsLoading(true);
        try {
          const otpResponse = await authApi.resendOTP(formData.email);
          if (otpResponse.data.success) {
            setError("Verification code sent to your email.");
            if (otpResponse.data.previewUrl) {
              window.open(otpResponse.data.previewUrl, "_blank");
            }
          }
        } catch {
          setError("Failed to send code, try entering an existing one.");
        } finally {
          setIsLoading(false);
        }      } else {
        setError("Invalid credentials");
      }
    } catch {
      setError("Login failed, please try again.");
    }
  };

  const handleVerificationCancel = () => {
    setNeedsVerification(false);
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="p-4 bg-white max-w-md mx-auto mt-10 w-full">        {needsVerification ? (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Verify Your Email</h2>
            <p className="mb-4">Please check your email for verification.</p>
            <button
              onClick={handleVerificationCancel}
              className="bg-gray-600 text-white py-2 px-4   hover:bg-gray-700"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            {error && <div className="bg-red-100 text-red-700 p-2 mb-4">{error}</div>}
            <form onSubmit={handleSubmit}>
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
                className="border p-2 w-full mb-4"
                placeholder="Password"
                required
              />
              <div className="text-right mb-4">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-red-500 "
                >
                  Forgot Password?
                </button>
              </div>
              <button className="bg-blue-500 text-white p-2  w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </button>            </form>

            <SSO />

            <div className="mt-4 text-center">
              <p>
                no account?
                <button onClick={() => navigate("/signup")} className="text-red-500 ">
                  Sign Up
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginForm;

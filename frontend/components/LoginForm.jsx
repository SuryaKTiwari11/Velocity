import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../src/store/authStore";
import { authApi } from "../src/front2backconnect/api.js";

const SSOLoginFooter = () => (
  <div className="mt-6 border-t pt-4">
    <p className="text-center mb-2">Or login with</p>
    <div className="flex justify-center space-x-4">
      <button
        type="button"
        onClick={() => window.location.href = authApi.getGoogleAuthUrl()}
        className="px-4 py-2 border rounded hover:bg-gray-50"
      >
        Google
      </button>
      <button
        type="button"
        onClick={() => window.location.href = authApi.getGithubAuthUrl()}
        className="px-4 py-2 border rounded hover:bg-gray-50"
      >
        GitHub
      </button>
    </div>
  </div>
);

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, handleSSOSuccess } = useAuthStore();
  const { isAdmin } = useAuthStore();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationOTP, setVerificationOTP] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const errorParam = searchParams.get("error");
    const tokenParam = searchParams.get("token");

    if (errorParam) {
      setError(errorParam === "failed" ? "Authentication failed." : "An error occurred.");
    }

    if (tokenParam) localStorage.setItem("sso-token", tokenParam);

    if (location.pathname === "/login/success") {
      handleSSOSuccess()
        .then((result) => {
          if (result.success) {
            setTimeout(() => {
              navigate(useAuthStore.getState().isAdmin ? "/hradmin" : "/profile");
            }, 500);
          } else {
            setError(result.error || "Authentication failed");
          }
        })
        .catch(() => setError("Failed to complete authentication."));
    }

    if (isAuthenticated) {
      navigate(isAdmin ? "/hradmin" : "/profile");
    }
  }, [isAuthenticated, isAdmin, navigate, location, handleSSOSuccess]);

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

    // Hardcoded admin shortcut
    if (
      formData.email === "admin@example.com" &&
      formData.password === "admin123"
    ) {
      useAuthStore.setState({
        user: { id: "admin-special", name: "Admin User", email: "admin@example.com" },
        isAuthenticated: true,
        isAdmin: true,
      });
      navigate("/hradmin");
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
              setPreviewUrl(otpResponse.data.previewUrl);
              window.open(otpResponse.data.previewUrl, "_blank");
            }
          }
        } catch {
          setError("Failed to send code, try entering an existing one.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setError(result.error || "Invalid credentials");
      }
    } catch {
      setError("Login failed, please try again.");
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    if (!verificationOTP || verificationOTP.length < 4) {
      setError("Enter a valid verification code");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.verifyOTP(formData.email, verificationOTP);
      if (response.data.success) {
        alert("Email verified! Please log in again.");
        setNeedsVerification(false);
        setVerificationOTP("");
        const result = await login(formData);
        if (!result.success) setError("Login failed, try again.");
      } else {
        throw new Error(response.data.message || "Invalid code");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const response = await authApi.resendOTP(formData.email);
      if (response.data.success) {
        setError("New code sent!");
        if (response.data.previewUrl) {
          setPreviewUrl(response.data.previewUrl);
          window.open(response.data.previewUrl, "_blank");
        }
      }
    } catch {
      setError("Failed to resend code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="p-4 bg-white max-w-md mx-auto mt-10 w-full rounded shadow">
        {needsVerification ? (
          <>
            <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
            {error && <div className="bg-red-100 text-red-700 p-2 mb-4">{error}</div>}
            {previewUrl && (
              <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
                <p className="mb-2 font-semibold">Debug Mode:</p>
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  View Email Preview
                </a>
              </div>
            )}
            <p className="mb-4 text-gray-600">Enter the code sent to {formData.email}</p>
            <form onSubmit={handleVerificationSubmit}>
              <input
                type="text"
                value={verificationOTP}
                onChange={(e) => setVerificationOTP(e.target.value)}
                className="border p-2 w-full mb-4"
                placeholder="Verification code"
                required
              />
              <div className="flex gap-2 mb-4">
                <button className="bg-blue-500 text-white p-2 rounded w-full" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify Email"}
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="bg-gray-200 text-gray-800 p-2 rounded w-full"
                  disabled={isLoading}
                >
                  Resend Code
                </button>
              </div>
              <div className="text-center">
                <button type="button" onClick={() => setNeedsVerification(false)} className="text-blue-500 underline">
                  Back to Login
                </button>
              </div>
            </form>
          </>
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
                  className="text-sm text-blue-500 underline"
                >
                  Forgot Password?
                </button>
              </div>
              <button className="bg-blue-500 text-white p-2 rounded w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>

            <SSOLoginFooter />

            <div className="mt-4 text-center">
              <p>
                Don't have an account?{" "}
                <button onClick={() => navigate("/signup")} className="text-blue-500 underline">
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

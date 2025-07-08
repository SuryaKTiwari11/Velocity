import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../src/front2backconnect/api.js";
import SSO from "./SSO";

const SignupForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: "",
    companyCode: "",
    city: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
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
      if (formData.adminPassword !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const payload = {
        companyName: formData.companyName,
        companyCode: formData.companyCode,
        city: formData.city,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
      };

      const res = await authApi.companyRegister(payload);
      if (!res.data?.success) {
        throw new Error(res.data?.message || "Signup failed. Please try again.");
      }

      setStatus({
        message: "Company registered! Please check your email for verification.",
        isError: false,
      });
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setStatus({
        message:
          error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred",
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="p-4 bg-white max-w-md mx-auto mt-10 w-full">
        <h1 className="text-2xl font-bold mb-4">Register Your Company</h1>
        <div className="mb-2 text-sm text-gray-700">
          This form is for <b>company registration</b> only. If you are joining an existing company, please use your invite link or{" "}
          <a href="/invite-signup" className="text-blue-600 underline">
            invite signup
          </a>.
        </div>

        {status.message && (
          <div
            className={`p-2 mb-4 ${
              status.isError
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="border p-2 w-full mb-3"
            placeholder="Company Name"
            required
          />
          <input
            type="text"
            name="companyCode"
            value={formData.companyCode}
            onChange={handleChange}
            className="border p-2 w-full mb-3"
            placeholder="Company Code (unique)"
            required
          />
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="border p-2 w-full mb-3"
            placeholder="City"
            required
          />
          <input
            type="text"
            name="adminName"
            value={formData.adminName}
            onChange={handleChange}
            className="border p-2 w-full mb-3"
            placeholder="Admin Full Name"
            required
          />
          <input
            type="email"
            name="adminEmail"
            value={formData.adminEmail}
            onChange={handleChange}
            className="border p-2 w-full mb-3"
            placeholder="Admin Email"
            required
          />
          <input
            type="password"
            name="adminPassword"
            value={formData.adminPassword}
            onChange={handleChange}
            className="border p-2 w-full mb-3"
            placeholder="Admin Password"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="border p-2 w-full mb-3"
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

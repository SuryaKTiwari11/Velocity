import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { inviteApi, mapApi } from "../src/front2backconnect/api";

function InviteSignupForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [inviteToken, setInviteToken] = useState("");
  const [inviteInfo, setInviteInfo] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "", city: "" });
  const [status, setStatus] = useState({ message: "", isError: false });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0: enter token, 1: signup
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);

  useEffect(() => {
    if (step === 1) {
      fetchCities();
    }
    // eslint-disable-next-line
  }, [step]);

  const fetchCities = async () => {
    try {
      const response = await mapApi.getCities();
      if (response.data.success) {
        setCities(response.data.cities);
      }
    } catch (error) {
      console.error('Failed to fetch cities:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  // Get token from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("inviteToken") || "";
    if (token) {
      setInviteToken(token);
      handleValidate(token);
    }
    // eslint-disable-next-line
  }, []);

  async function handleValidate(token) {
    setStatus({ message: "", isError: false });
    setLoading(true);
    try {
      const res = await inviteApi.validate(token);
      if (res.data && res.data.success) {
        setInviteInfo(res.data.invite);
        setFormData((f) => ({ ...f, email: res.data.invite.email, name: res.data.invite.name || "" }));
        setStep(1);
      } else {
        throw new Error(res.data.message || "Invalid invite token");
      }
    } catch (err) {
      setStatus({ message: err.response?.data?.message || err.message || "Invalid invite token", isError: true });
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setStatus({ message: "", isError: false });
    setLoading(true);
    try {
      if (formData.password !== formData.confirmPassword) throw new Error("Passwords do not match");
      const payload = {
        inviteToken,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        city: formData.city,
      };
      const res = await inviteApi.signup(payload);
      if (res.data && res.data.success) {
        setStatus({ message: "Signup successful! Please log in.", isError: false });
        setTimeout(() => navigate("/login"), 1500);
      } else {
        throw new Error(res.data.message || "Signup failed");
      }
    } catch (err) {
      setStatus({ message: err.response?.data?.message || err.message || "Signup failed", isError: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="p-4 bg-white max-w-md mx-auto mt-10 w-full">
        <h1 className="text-2xl font-bold mb-4">Join Your Company (Invite Signup)</h1>
        {status.message && (
          <div className={`p-2 mb-4 ${status.isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{status.message}</div>
        )}
        {step === 0 && (
          <form onSubmit={(e) => { e.preventDefault(); handleValidate(inviteToken); }}>
            <input
              type="text"
              name="inviteToken"
              value={inviteToken}
              onChange={(e) => setInviteToken(e.target.value)}
              className="border p-2 w-full mb-3"
              placeholder="Enter your invite token"
              required
            />
            <button className="bg-blue-500 text-white p-2 w-full" disabled={loading}>{loading ? "Validating..." : "Validate Invite"}</button>
          </form>
        )}
        {step === 1 && inviteInfo && (
          <form onSubmit={handleSignup}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border p-2 w-full mb-3"
              placeholder="Full Name"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              className="border p-2 w-full mb-3 bg-gray-100"
              placeholder="Email"
              required
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="border p-2 w-full mb-3"
              placeholder="Password"
              required
            />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="border p-2 w-full mb-3"
              placeholder="Confirm Password"
              required
            />
            <select
              name="city"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
              className="border p-2 w-full mb-3"
              required
              disabled={loadingCities}
            >
              <option value="">
                {loadingCities ? "Loading cities..." : "Select your city"}
              </option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <button className="bg-blue-500 text-white p-2 w-full" disabled={loading}>{loading ? "Signing up..." : "Sign Up"}</button>
          </form>
        )}
        <div className="mt-4 text-center">
          <p>
            Want to register a new company?{' '}
            <button type="button" onClick={() => navigate("/signup") } className="text-blue-600 underline">Company Registration</button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default InviteSignupForm;

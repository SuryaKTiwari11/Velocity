import React, { useEffect, useState } from "react";
import { companyAdminApi } from "../src/front2backconnect/api";

export default function CompanyAdminPanel() {
  const [admins, setAdmins] = useState([]);
  const [usage, setUsage] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError("");
    try {
      const [adminsRes, usageRes, subRes] = await Promise.all([
        companyAdminApi.getAdmins(),
        companyAdminApi.getUsage(),
        companyAdminApi.getSubscription(),
      ]);
      setAdmins(adminsRes.data.admins || []);
      setUsage(usageRes.data.usage || usageRes.data || null);
      setSubscription(subRes.data.subscription || subRes.data || null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error loading company admin data");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveAdmin(userId) {
    if (!window.confirm("Remove this admin?")) return;
    setLoading(true);
    setError("");
    try {
      await companyAdminApi.removeAdmin(userId);
      setAdmins((prev) => prev.filter((a) => a.id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to remove admin");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 32 }}>
      <h1>Company Admin Panel</h1>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {loading && <div>Loading...</div>}
      <h2>Admins</h2>
      <ul>
        {admins.map((admin) => (
          <li key={admin.id}>
            {admin.name} ({admin.email})
            <button onClick={() => handleRemoveAdmin(admin.id)} style={{ marginLeft: 8, color: "red" }}>Remove</button>
          </li>
        ))}
      </ul>
      <h2>Usage</h2>
      <pre>{JSON.stringify(usage, null, 2)}</pre>
      <h2>Subscription</h2>
      <pre>{JSON.stringify(subscription, null, 2)}</pre>
    </div>
  );
}

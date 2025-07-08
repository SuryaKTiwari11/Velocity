import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3000/api/analytics";

export function useAnalyticsData() {
  const [data, setData] = useState({
    dashboard: null,
    employees: null,
    documents: null,
    revenue: null,
  });
  const [loading, setLoading] = useState({
    dashboard: false,
    employees: false,
    documents: false,
    revenue: false,
  });
  const [error, setError] = useState(null);

  // Helper function to make authenticated requests
  const makeRequest = async (endpoint) => {
    try {
      const response = await axios.get(`${API_BASE}${endpoint}`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      throw new Error(err.response?.data?.message || "Failed to fetch data");
    }
  };

  // Fetch dashboard data
  const fetchDashboard = async () => {
    setLoading((prev) => ({ ...prev, dashboard: true }));
    try {
      const result = await makeRequest("/dashboard");
      setData((prev) => ({ ...prev, dashboard: result.data }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, dashboard: false }));
    }
  };

  // Fetch employee analytics
  const fetchEmployees = async () => {
    setLoading((prev) => ({ ...prev, employees: true }));
    try {
      const result = await makeRequest("/employees");
      setData((prev) => ({ ...prev, employees: result.data }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, employees: false }));
    }
  };

  // Fetch document analytics
  const fetchDocuments = async () => {
    setLoading((prev) => ({ ...prev, documents: true }));
    try {
      const result = await makeRequest("/documents");
      setData((prev) => ({ ...prev, documents: result.data }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, documents: false }));
    }
  };

  // Fetch revenue analytics
  const fetchRevenue = async () => {
    setLoading((prev) => ({ ...prev, revenue: true }));
    try {
      const result = await makeRequest("/revenue");
      setData((prev) => ({ ...prev, revenue: result.data }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, revenue: false }));
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchDashboard(),
        fetchEmployees(),
        fetchDocuments(),
        fetchRevenue(),
      ]);
    } catch (err) {
      console.error("Error fetching all analytics data:", err);
    }
  };

  // Refresh specific data
  const refresh = {
    dashboard: fetchDashboard,
    employees: fetchEmployees,
    documents: fetchDocuments,
    revenue: fetchRevenue,
    all: fetchAllData,
  };

  // Auto-fetch dashboard data on mount
  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading((prev) => ({ ...prev, dashboard: true }));
      try {
        const result = await makeRequest("/dashboard");
        setData((prev) => ({ ...prev, dashboard: result.data }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading((prev) => ({ ...prev, dashboard: false }));
      }
    };

    initializeDashboard();
  }, []);

  return {
    data,
    loading,
    error,
    refresh,
    clearError: () => setError(null),
  };
}

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // This is important for cookies to be sent with requests
});

// Get token from localStorage
const getToken = () => {
  // First check for SSO token that might have been saved in the URL
  const ssoToken = localStorage.getItem("sso-token");
  if (ssoToken) return ssoToken;

  // Then check auth store
  try {
    const authStateStr = localStorage.getItem("auth-storage");
    if (!authStateStr) return "";

    const authState = JSON.parse(authStateStr);

    // Check if we're logged out
    if (!authState?.state?.isAuthenticated) {
      return "";
    }

    // Return token from the appropriate location in the auth state
    return authState?.state?.user?.token || authState?.state?.token || "";
  } catch (err) {
    console.error("Error parsing auth state:", err);
    return "";
  }
};

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    // Only add auth header if we have a token and we're not calling the logout endpoint
    if (token && !config.url.includes("/logout")) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Added auth token to request", config.url);
    } else if (config.url.includes("/logout")) {
      console.log("Logout request - including token for proper logout");
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      console.log("No auth token available for request", config.url);
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Employee API endpoints
export const employeeApi = {
  AllEmp: () => api.get("/employees"),
  EmpByID: (id) => api.get(`/employees/${id}`),
  createEMP: (data) => api.post("/employees", data),
  updateEMP: (id, data) => api.put(`/employees/${id}`, data),
  deleteEMP: (id) => api.delete(`/employees/${id}`),
};

// Authentication API endpoints
export const authApi = {
  signup: (data) => api.post("/users/signup", data),
  login: (data) => api.post("/users/login", data),
  logout: () => api.post("/users/logout"),
  getCurrentUser: () => api.get("/users/me"), // SSO endpoints
  getGoogleAuthUrl: () => "http://localhost:3000/api/users/auth/google",
  getGithubAuthUrl: () => "http://localhost:3000/api/users/auth/github",
  checkAuthSuccess: () => api.get("/users/auth/success"),
  // Password reset endpoints
  forgotPassword: (email) => api.post("/users/forgot-password", { email }),
  verifyOTP: (email, otp) => api.post("/otp/verify", { email, otp }),
  verifyResetOTP: (email, otp) =>
    api.post("/users/verify-reset-otp", { email, otp }),
  resetPassword: (resetToken, newPassword) =>
    api.post("/users/reset-password", { resetToken, newPassword }),
  resendOTP: (email, name = "User") => api.post("/otp/send", { email, name }),
};

// Add request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 (Unauthorized) errors automatically
    if (error.response && error.response.status === 401) {
      console.log("Authentication error. Please log in again.");
      // You could dispatch a logout action or redirect to login page here
    }
    return Promise.reject(error);
  }
);

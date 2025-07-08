import axios from "axios";
// Axios instance
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
// Super Admin API
export const superAdminApi = {
  getCompanies: (params) => api.get("/super-admin/companies", { params }),
  getUsers: (params) => api.get("/super-admin/users", { params }),
  getPayments: (params) => api.get("/super-admin/payments", { params }),
  getInvites: (params) => api.get("/super-admin/invites", { params }),
  deleteCompany: (companyId) =>
    api.delete(`/super-admin/companies/${companyId}`),
  // Add more as needed
};
// Company Admin API
export const companyAdminApi = {
  getUsage: () => api.get("/company/usage"),
  getAdmins: () => api.get("/company/admins"),
  removeAdmin: (userId) => api.delete(`/company/admins/${userId}`),
  getSubscription: () => api.get("/company/subscription"),
};

// Invite API
export const inviteApi = {
  create: (email) => api.post("/invite/invite", { email }),
  validate: (inviteToken) =>
    api.get(`/invite/validate`, { params: { inviteToken } }),
  signup: (data) => api.post("/invite/signup", data),
};

// Employee API
export const employeeApi = {
  allEMP: (params) => api.get("/employees", { params }),
  filterOpts: () => api.get("/employees/filter"),
  EmpByID: (id) => api.get(`/employees/${id}`),
  createEMP: (data) => api.post("/employees", data),
  updateEMP: (id, data) => api.put(`/employees/${id}`, data),
  deleteEMP: (id) => api.delete(`/employees/${id}`),
};

// Auth API
export const authApi = {
  signup: (data) => api.post("/users/signup", data),
  companyRegister: (data) => api.post("/register", data),
  login: (data) => api.post("/users/login", data),
  logout: () => api.post("/users/logout"),
  curUser: () => api.get("/users/me"),
  // googleUrl: () => "http://localhost:3000/api/users/auth/google", // Google login/signup disabled
  githubUrl: () => "http://localhost:3000/api/users/auth/github",
  authSuccess: () => api.get("/users/auth/success"),
  forgotPassword: (email) => api.post("/users/forgot-password", { email }),
  verifyOTP: (email, otp) => api.post("/otp/verify", { email, otp }),
  verifyResetOTP: (email, otp) =>
    api.post("/users/verify-reset-otp", { email, otp }),
  resetPassword: (resetToken, newPassword, email) =>
    api.post("/users/reset-password", { resetToken, newPassword, email }),
  resendOTP: (email) => api.post("/otp/send", { email }),
};

// S3 Document API (User)
export const documentApi = {
  upload: (formData) =>
    api.post("/s3-documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  list: () => api.get("/s3-documents/"),
  download: (docId) => api.get(`/s3-documents/${docId}/download`),
  delete: (docId) => api.delete(`/s3-documents/${docId}`),
  search: (query) => api.get(`/s3-documents/?search=${query}`),
  health: () => api.get("/s3-documents/health"),
};

// S3 Document API (Admin/Employee)
export const s3DocumentApi = {
  upload: (formData) =>
    api.post("/s3-documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getByEmployee: (employeeId) =>
    api.get(`/s3-documents/employee/${employeeId}`),
  getDownloadUrl: (docId) => api.get(`/s3-documents/${docId}/download`),
  delete: (docId) => api.delete(`/s3-documents/${docId}`),
  getAll: (params = {}) => api.get("/s3-documents", { params }),
  updateStatus: (docId, status, notes = "") =>
    api.patch(`/s3-documents/${docId}/status`, { status, notes }),
  healthCheck: () => api.get("/s3-documents/health"),
};

// Payment API
export const paymentApi = {
  order: () => api.post("/payment/create-order"),
  verify: (data) => api.post("/payment/verify-payment", data),
  status: () => api.get("/payment/premium-status"),
};

// Livekit API
export const livekitApi = {
  getToken: ({ room, name }) =>
    api.post("/users/livekit-token", { room, name }),
};

// OTP API
export const otpApi = {
  adminCleanup: () => api.post("/otp/admin/cleanup"),
};

// Map API
export const mapApi = {
  getData: () => api.get("/map/data"),
  getUsersByCity: () => api.get("/map/users-by-city"),
  getStats: () => api.get("/map/stats"),
  getCities: () => api.get("/map/cities"),
};

// Chat API
export const chatApi = {
  getStreamToken: () => api.get("/chat/token"),
  searchUsers: (query) =>
    api.get(`/users/search?q=${encodeURIComponent(query)}`),
  upsertTargetUser: (targetUserId) =>
    api.post(`/chat/upsert-user/${targetUserId}`),
};

// Attendance API
export const attendanceApi = {
  // User endpoints
  today: () => api.get("/attendance/today"),
  history: (params) => api.get("/attendance/history", { params }),
  stats: (params) => api.get("/attendance/stats", { params }),
  // Legacy endpoints
  clockIn: () => api.post("/attendance/clock-in"),
  clockOut: () => api.post("/attendance/clock-out"),
  getToday: () => api.get("/attendance/today"),
  getHistory: () => api.get("/attendance/history"),
  // Admin endpoints
  getAllAttendance: (params) => api.get("/attendance/admin/all", { params }),
  getActiveUsers: () => api.get("/attendance/admin/active"),
};

// Audit API
export const auditApi = {
  getLogs: (params) => api.get("/audit/logs", { params }),
  getLoginHistory: (params) => api.get("/audit/login-history", { params }),
  getStats: (params) => api.get("/audit/stats", { params }),
};

// Onboarding API
export const onboardingApi = {
  getData: () => api.get("/onboarding/data"),
  getTrainingStatus: () => api.get("/onboarding/training-status"),
  trackVideoProgress: (data) => api.post("/onboarding/video-progress", data),
  submitDocuments: () => api.post("/onboarding/submit-documents"),
  getPendingVerifications: () =>
    api.get("/onboarding/admin/pending-verifications"),
  verifyUser: (userId, action, notes) =>
    api.patch(`/onboarding/admin/verify-user/${userId}`, { action, notes }),
  // Dev-only: Mark a video as complete for the current user
  markVideoComplete: (videoId) =>
    api.post("/onboarding/dev/mark-video-complete", { videoId }),
};

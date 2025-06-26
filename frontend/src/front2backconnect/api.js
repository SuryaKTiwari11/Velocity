import axios from "axios";
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export const employeeApi = {
  allEMP: (params) => api.get("/employees", { params }),
  filterOpts: () => api.get("/employees/filter"),
  EmpByID: (id) => api.get(`/employees/${id}`),
  createEMP: (data) => api.post("/employees", data),
  updateEMP: (id, data) => api.put(`/employees/${id}`, data),
  deleteEMP: (id) => api.delete(`/employees/${id}`),
};
export const authApi = {
  signup: (data) => api.post("/users/signup", data),
  login: (data) => api.post("/users/login", data),
  logout: () => api.post("/users/logout"),
  curUser: () => api.get("/users/me"),
  googleUrl: () => "http://localhost:3000/api/users/auth/google",
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
export const documentApi = {
  upload: (formData) =>
    api.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  list: (userId) => api.get(`/documents/user/${userId}`),
  download: (docId) =>
    api.get(`/documents/download/${docId}`, {
      responseType: "blob",
    }),
  search: (userId, query) => api.get(`/documents/search/${userId}?q=${query}`),
  delete: (docId) => api.delete(`/documents/${docId}`),
};
export const paymentApi = {
  createOrder: () => api.post("/payment/create-order"),
  verifyPayment: (data) => api.post("/payment/verify-payment", data),
  checkPremium: () => api.get("/payment/premium-status"),
};

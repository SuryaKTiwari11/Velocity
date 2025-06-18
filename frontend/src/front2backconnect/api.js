import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const employeeApi = {
  AllEmp: () => api.get("/employees"),
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

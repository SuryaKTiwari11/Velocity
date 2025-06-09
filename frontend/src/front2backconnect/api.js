import axios from "axios";
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const employeeApi = {
  AllEmp: () => api.get("/employees"),
  EmpByID: (id) => api.get(`/employees/${id}`),
  createEMP: (data) => api.post("/employees", data),
  updateEMP: (id, data) => api.put(`/employees/${id}`, data),
  deleteEMP: (id) => api.delete(`/employees/${id}`),
};

export default api;

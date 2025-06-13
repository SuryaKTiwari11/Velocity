import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { employeeApi } from "../src/front2backconnect/api";
import useAuthStore from "../src/store/authStore";

const InputForm = () => {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
    salary: "",
  });
  const [error, setError] = useState(null);

  // Check admin authorization
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
      if (!isAdmin) {
      navigate('/profile');
      return;
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const data = {
        ...formData,
        // Convert salary to number if provided, otherwise null
        salary: formData.salary ? Number(formData.salary) : null,
        // Set null for empty strings
        position: formData.position || null,
        department: formData.department || null
      };
        await employeeApi.createEMP(data);
      navigate("/hradmin");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create employee");
      console.error(error);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Employee</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-2 mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>
        
        <div className="mb-3">
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
        </div>
        
        <div className="mb-3">
          <label className="block mb-1">Position</label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        
        <div className="mb-3">
          <label className="block mb-1">Department</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-1">Salary</label>
          <input
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate("/hradmin")}
            className="bg-gray-300 px-3 py-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-green-500 text-white px-3 py-1"
          >
            Add Employee
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputForm;

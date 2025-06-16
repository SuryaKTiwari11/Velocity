import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { employeeApi } from "../src/front2backconnect/api";
import useAuthStore from "../src/store/authStore";

const EditEmployee = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin, user, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
    salary: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const fetchEmployee = async () => {
      try {
        const response = await employeeApi.EmpByID(id);
        const employeeData = response.data.data;
        if (!isAdmin) {
          setError("Only administrators can edit employee information");
          navigate('/profile');
          return;
        }
        setFormData(employeeData);
        setLoading(false);
      } catch (error) {
        setError( "Failed to fetch employee data");
        console.error(error);
        navigate('/hradmin');
      }
    };

    fetchEmployee();
  }, [id, isAuthenticated, isAdmin, user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        salary: formData.salary ? Number(formData.salary) : null,
        position: formData.position || null,
        department: formData.department || null
      };
      await employeeApi.updateEMP(id, data);
      navigate("/hradmin");
    } catch (error) {
      setError( "Failed to update employee");
      console.error(error);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-md  mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Employee</h1>
      
      {error && (
        <div className="bg-red-100  text-red-700 p-2 mb-4">
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
            value={formData.position || ""}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1">Department</label>
          <input
            type="text"
            name="department"
            value={formData.department || ""}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Salary</label>
          <input
            type="number"
            name="salary"
            value={formData.salary || ""}
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
            className="bg-blue-500 text-white px-3 py-1"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEmployee;

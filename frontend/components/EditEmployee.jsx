import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { employeeApi } from "../src/front2backconnect/api";

const EditEmployee = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
    salary: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const employee = async () => {
      try {
        const response = await employeeApi.EmpByID(id);
        setFormData(response.data.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    employee();
  }, [id]);

  const handleChange = (e) => {
    e.preventDefault();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
        try {
      await employeeApi.updateEMP(id, formData);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };
  const handleCancel = () => {
    navigate("/");
  };
  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-gray-900 p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Edit Employee
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className=" text-gray-300 text-sm font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter name"
              className="w-full px-4 py-2 bg-gray-800  text-white placeholder-gray-400 "
              required
            />
          </div>
          <div>
            <label className=" text-gray-300 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full px-4 py-2 bg-gray-800 text-white placeholder-gray-400 "
              required
            />
          </div>
          <div>
            <label className=" text-gray-300 text-sm font-medium mb-2">
              Position
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Enter position"
              className="w-full px-4 py-2 bg-gray-800 text-white placeholder-gray-400 "
              required
            />
          </div>
          <div>
            <label className=" text-gray-300 text-sm font-medium mb-2">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Enter department"
              className="w-full px-4 py-2 bg-gray-800 text-white placeholder-gray-400 "
              required
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm font-medium mb-2">
              Salary
            </label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="Enter salary"
              className="w-full px-4 py-2 bg-gray-800 text-white placeholder-gray-400  "
              required
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full py-2 px-4 bg-red-600 text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployee;

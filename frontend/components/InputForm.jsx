import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { employeeApi } from "../src/front2backconnect/api";
const InputForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
    salary: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        salary: Number(formData.salary),
      };
      await employeeApi.createEMP(data);
      navigate("/");
    } catch (error) {
    console.log(error)
    }
};
const handleCancel =async()=>{
    navigate('/');
}

  return (
    <div>
      <div className="flex items-center justify-center bg-black h-screen">
        <div className="bg-gray-900 p-5 m-4 w-100">
          <h1 className="text-3xl font-bold text-white text-center mb-6">
            INPUT FORM
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className=" text-white mb-2">NAME</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter name"
                className="w-full px-4 py-2 bg-gray-800 text-white"
                required
              />
            </div>
            <div>
              <label className=" text-white m-2">position</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="Enter position"
                className="w-full px-4 py-2 bg-gray-800 text-white"
                required
              />
            </div>
            <div>
              <label className=" text-white m-2">email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="w-full px-4 py-2 bg-gray-800 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Enter department"
                className="w-full px-4 py-2 bg-gray-800 text-white"
                required
              />
            </div>
            <div>
              <label className=" text-white m-2">salary</label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="Enter salary"
                className="w-full px-4 py-2 bg-gray-800 text-white"
                required
              />
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full py-2 px-4 bg-red-700 text-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InputForm;

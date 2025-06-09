import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { employeeApi } from "../src/front2backconnect/api";
import Navbar from "./Navbar";

const HomePage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);
  const fetchEmployees = async () => {
    try {
      const response = await employeeApi.AllEmp();
      setEmployees(response.data.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  const handleDelete = async (id) => {
    try {
      await employeeApi.deleteEMP(id);
      setEmployees(employees.filter((emp) => emp._id !== id));
    } catch (error) {
      console.log(error);
    }
  };
  if (loading)
    return (
      <div className=" bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max mx-auto p-10">
        <div className="grid gap-4">
          {employees.map((employee) => (
            <div
              key={employee._id}
              className="bg-gray-800 p-6 flex justify-between items-center"
            >
              <div className="flex-row">
                <h2 className="text-xl font-bold text-white my-2">
                  {employee.name}
                </h2>
                <div className="grid grid-cols-2 gap-2 text-white">
                  <p>
                    <span className="text-gray-400">Email:</span>
                    {employee.email}
                  </p>
                  <p>
                    <span className="text-gray-400">Department:</span>
                    {employee.department}
                  </p>
                  <p>
                    <span className="text-gray-400">Position:</span>
                    {employee.position}
                  </p>
                  <p>
                    <span className="text-gray-400">Salary:</span> $
                    {employee.salary}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link to={`/edit/${employee._id}`}>
                  <button className="bg-yellow-600 text-white px-4 py-2">
                    Edit
                  </button>
                </Link>
                <button
                  onClick={() => handleDelete(employee._id)}
                  className={"bg-red-600 text-white px-4 py-2 "}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

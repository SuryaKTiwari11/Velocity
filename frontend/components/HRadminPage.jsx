import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { employeeApi } from "../src/front2backconnect/api";
import Navbar from "./Navbar";
import useAuthStore from "../src/store/authStore";

const HRadminPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, isAdmin } = useAuthStore();

  useEffect(() => {
    // Only fetch employees if the user is authenticated
    if (isAuthenticated) {
      fetchEmployees();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  const fetchEmployees = async () => {
    try {
      const response = await employeeApi.AllEmp();
      setEmployees(response.data.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setError("Failed to fetch employees. Please try again later.");
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    // Only admin users can delete employees
    if (!isAdmin) {
      setError("Only administrators can delete employee records.");
      return;
    }
    
    try {
      await employeeApi.deleteEMP(id);
      // Update the employees list
      setEmployees(employees.filter((emp) => emp.id !== id));
    } catch (error) {
      console.log(error);
      setError("Failed to delete employee. Please try again.");
    }
  };
  
  if (loading) {
    return (
      <div className="bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black">
      <div className="max mx-auto p-10">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-2 mb-4">
            {error}
          </div>
        )}
        
        {!isAuthenticated ? (
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-6">Welcome to Employee Management System</h1>
            <p className="mb-6">Please login or signup to continue</p>
            <div className="flex gap-4 justify-center">
              <Link to="/login">
                <button className="bg-blue-600 text-white px-6 py-2">Login</button>
              </Link>
              <Link to="/signup">
                <button className="bg-green-600 text-white px-6 py-2">Signup</button>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-white">HR Admin Dashboard</h1>
            <div className="grid gap-4">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="bg-gray-800 p-6 flex justify-between items-center"
                >
                  <div className="flex-row">
                    <h2 className="text-xl font-bold text-white my-2">
                      {employee.name}
                    </h2>
                    <div className="grid grid-cols-2 gap-2 text-white">
                      <p>
                        <span className="text-gray-400">Email: </span>
                        {employee.email}
                      </p>
                      <p>
                        <span className="text-gray-400">Department: </span>
                        {employee.department}
                      </p>
                      <p>
                        <span className="text-gray-400">Position: </span>
                        {employee.position}
                      </p>
                      <p>
                        <span className="text-gray-400">Salary: </span> $
                        {employee.salary}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {isAdmin && (
                      <>
                        <Link to={`/edit/${employee.id}`}>
                          <button className="bg-yellow-600 text-white px-4 py-2">
                            Edit
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(employee.id)}
                          className="bg-red-600 text-white px-4 py-2"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRadminPage;

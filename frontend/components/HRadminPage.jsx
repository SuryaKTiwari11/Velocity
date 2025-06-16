import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { employeeApi } from "../src/front2backconnect/api";
import useAuthStore from "../src/store/authStore";

const HRadminPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, isAdmin, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!isAdmin) {
      navigate('/profile');
      return;
    }
    
    // Fetch employees for admin
    fetchEmployees();
  }, [isAuthenticated, isAdmin, navigate]);
  
  const fetchEmployees = async () => {
    try {
      const response = await employeeApi.AllEmp();
      setEmployees(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
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
        
        <div>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">HR Admin Dashboard</h1>
            <Link to="/add">
              <button className="bg-green-600 text-white px-6 py-2 ">
                Add New Employee
              </button>
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center text-white">
              <p className="text-xl">Loading employees...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center text-white">
              <p className="text-xl mb-4">No employees found</p>
              <p>Start by adding a new employee</p>
            </div>
          ) : (
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
                        {employee.department || 'Not set'}
                      </p>
                      <p>
                        <span className="text-gray-400">Position: </span>
                        {employee.position || 'Not set'}
                      </p>
                      <p>
                        <span className="text-gray-400">Salary: </span> $
                        {employee.salary || '0'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link to={`/edit/${employee.id}`}>
                      <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
                        Edit
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRadminPage;

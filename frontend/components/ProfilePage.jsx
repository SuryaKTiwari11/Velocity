import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../src/store/authStore';
import { employeeApi } from '../src/front2backconnect/api';

const ProfilePage = () => {
  const { user, isAuthenticated, isAdmin } = useAuthStore();
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();  useEffect(() => {
    console.log("Profile page loaded, auth status:", isAuthenticated ? "authenticated" : "not authenticated");
    
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      navigate('/login');
      return;
    }
    
    // Double check we have a user object
    if (!user) {
      console.log("No user object available, redirecting to login");
      navigate('/login');
      return;
    }
    
    const fetchData = async () => {
      try {
        console.log("Fetching employee data, user:", user);
        
        // If admin, fetch all employees
        if (isAdmin) {
          console.log("Admin user, fetching all employees");
          const response = await employeeApi.AllEmp();
          if (response.data && response.data.data) {
            setEmployeeData(response.data.data);
          } else {
            console.error("Invalid response format:", response.data);
            setEmployeeData([]);
          }        } else if (user && user.email) {
          // For regular users, just fetch their own employee data
          console.log("Regular user, fetching data for:", user.email);
          try {
            const response = await employeeApi.AllEmp();
            
            if (response.data && response.data.data) {
              const filtered = response.data.data.filter(emp => emp.email === user.email);
              console.log("Filtered employee data:", filtered);
              
              if (filtered.length === 0) {
                console.log("No matching employee record found for", user.email);
                console.log("Creating temporary employee data from user profile");
                // Create a temporary employee object from user data if no matching record found
                setEmployeeData([{
                  id: 'temp-' + user.id,
                  name: user.name,
                  email: user.email,
                  position: "Not specified",
                  department: "Not specified",
                  salary: 0
                }]);
              } else {
                setEmployeeData(filtered);
              }
            } else {
              console.error("Invalid response format:", response.data);
              setEmployeeData([]);
            }
          } catch (empError) {
            console.error("Failed to fetch employee data:", empError);
            setEmployeeData([]);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch employee data:", error);
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      console.log("No user object available");
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin, user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-black min-h-screen">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <p className="mb-4">
        Welcome, {user?.name} {isAdmin ? '(Admin)' : ''}
      </p>

      {isAdmin ? (
        <div>
          <h2 className="text-xl mb-3">All Employees</h2>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Email</th>
                <th className="border p-2 text-left">Position</th>
                <th className="border p-2 text-left">Department</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employeeData && employeeData.map(employee => (
                <tr key={employee.id}>
                  <td className="border p-2">{employee.name}</td>
                  <td className="border p-2">{employee.email}</td>
                  <td className="border p-2">{employee.position || 'N/A'}</td>
                  <td className="border p-2">{employee.department || 'N/A'}</td>
                  <td className="border p-2">
                    <button 
                      className="bg-blue-500 text-white px-2 py-1 text-sm"
                      onClick={() => navigate(`/edit/${employee.id}`)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border p-4 max-w-md">
          <h2 className="text-xl mb-3">Your Information</h2>
          {employeeData && employeeData.map(employee => (
            <div key={employee.id}>
              <p><strong>Name:</strong> {employee.name}</p>
              <p><strong>Email:</strong> {employee.email}</p>
              <p><strong>Position:</strong> {employee.position || 'Not set'}</p>
              <p><strong>Department:</strong> {employee.department || 'Not set'}</p>
              <p><strong>Salary:</strong> ${employee.salary || 'Not set'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



export default ProfilePage
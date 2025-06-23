import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { employeeApi } from "../src/front2backconnect/api";
import useAuthStore from "../src/store/authStore";

const HRadminPage = () => {
  const [emps, setEmps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState('asc');
  

  const [filters, setFilters] = useState({
    name: '',
    department: '',
    position: '',
  });
  const [depts, setDepts] = useState([]);
  const [pos, setPos] = useState([]);
  
  // Combined fetch function for filter options
  const fetchData = async (queryParams = {}) => {
    try {
      setLoading(true);
      
      
      // API request
      const res = await employeeApi.allEMP(queryParams);
      const { data, total, departments, positions } = res.data;
      
      setEmps(data);
      setTotal(total);
      
      // Update filter options if provided
      if (departments?.length) setDepts(departments);
      if (positions?.length) setPos(positions);
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch employees. Please try again later.");
      setLoading(false);
    }
  };

  // Initial setup
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!isAdmin) {
      navigate('/profile');
      return;
    }
    
    // Get initial filter options
    employeeApi.filterOpts()
      .then(res => {
        if (res.data) {
          setDepts(res.data.departments || []);
          setPos(res.data.positions || []);
        }
      })
      .catch(err => console.error("Failed to fetch filter options:", err));
  }, [isAuthenticated, isAdmin, navigate]);
  
  // Fetch employees when filters/pagination change
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      const params = {
        page,
        limit: perPage,
        sortBy: sort,
        order,
        ...filters
      };
      fetchData(params);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, sort, order, filters.department, filters.position, isAuthenticated, isAdmin]);
  
  const handleDelete = async (id) => {
    if (!isAdmin) {
      setError("Only administrators can delete employee records.");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await employeeApi.deleteEMP(id);
        setEmps(emps.filter((emp) => emp.id !== id));
      } catch {
        setError("Failed to delete employee. Please try again.");
      }
    }
  };

  // Simplified sorting handler
  const handleSort = (field) => {
    const newOrder = field === sort && order === 'asc' ? 'desc' : 'asc';
    setSort(field);
    setOrder(newOrder);
  };

  // Filter change handler
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({...prev, [name]: value}));
    if (name !== 'name') setPage(1);
  };
  
  // Search handler
  const handleSearch = () => {
    setPage(1);
    const params = {
      page: 1,
      limit: perPage,
      sortBy: sort,
      order,
      ...filters
    };
    fetchData(params);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({ name: '', department: '', position: '' });
    setPage(1);
    fetchData({ page: 1, limit: perPage, sortBy: sort, order });
  };
  const paginate = (pageNum) => {
    setPage(pageNum);
  };
  
  
  const pageNums = [];
  for (let i = 1; i <= Math.ceil(total / perPage); i++) {
    pageNums.push(i);
  }
  
  const firstIdx = (page - 1) * perPage + 1;
  const lastIdx = Math.min(page * perPage, total);

  
  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center navbar-spacing">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black navbar-spacing">
      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="bg-red-100 border text-red-700 p-3 mb-4">{error}</div>
        )}
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">HR Admin Dashboard</h1>
          <Link to="/add">
            <button className={`px-6 py-2 bg-green-600 text-white`}>Add New Employee</button>
          </Link>
        </div>
        <div className="bg-gray-800 p-4 mb-6">
          <h2 className="text-white text-xl mb-3">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-300 mb-1">Name</label>
              <div className="flex">
                <input
                  type="text"
                  name="name"
                  value={filters.name}
                  onChange={handleFilterChange}
                  className="flex-1 bg-gray-700 text-white border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search by name..."
                />
                <button onClick={handleSearch} className={`ml-2 bg-blue-600 text-white px-3 py-1 `}>
                  Search
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-1">Department</label>
              <select
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {depts.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-1">Position</label>
              <select
                name="position"
                value={filters.position}
                onChange={handleFilterChange}
                className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Positions</option>
                {pos.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button onClick={resetFilters} className={`px-6 py-2 bg-gray-600 text-white`}>
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {emps.length === 0 ? (
          <div className="text-center text-white bg-gray-800 p-8">
            <p className="text-xl mb-4">no employees found</p>
          
          </div>
        ) : (
          <>
            <div className="overflow-x-auto bg-gray-800  mb-6">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-900 text-gray-300 text-left">
                    <th className="px-6 py-4" onClick={() => handleSort('name')}>
                      Name 
                    </th>
                    <th className="px-6 py-4" onClick={() => handleSort('email')}>
                      Email
                    </th>
                    <th className="px-6 py-4" onClick={() => handleSort('department')}>
                      Department
                    </th>
                    <th className="px-6 py-4" onClick={() => handleSort('position')}>
                      Position
                    </th>
                    <th className="px-6 py-4" onClick={() => handleSort('salary')}>
                      Salary
                    </th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {emps.map((emp) => (
                    <tr key={emp.id} className="bg-gray-800">
                      <td className="px-6 py-4 text-white font-medium">{emp.name}</td>
                      <td className="px-6 py-4 text-gray-300">{emp.email}</td>
                      <td className="px-6 py-4 text-gray-300">{emp.department || 'Not set'}</td>
                      <td className="px-6 py-4 text-gray-300">{emp.position || 'Not set'}</td>
                      <td className="px-6 py-4 text-gray-300">${emp.salary || '0'}</td>
                      <td className="px-6 py-4 flex justify-center gap-2">
                        <Link to={`/edit/${emp.id}`}>
                          <button className={`bg-yellow-600 text-white px-3 py-1 `}>Edit</button>
                        </Link>
                        <button onClick={() => handleDelete(emp.id)} className={`bg-red-600 text-white px-3 py-1`}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        
            <div className="flex justify-between items-center bg-gray-800 p-4">
              <div className="text-gray-300">
                Showing {firstIdx} to {lastIdx} of {total} employees
              </div>
              <nav>
                <ul className="flex space-x-1">
                  <li>
                    <button 
                      onClick={() => paginate(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className={`px-3 py-1 ${page === 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                    >
                      Prev
                    </button>
                  </li>
                  {pageNums.map(num => (
                    <li key={num}>
                      <button
                        onClick={() => paginate(num)}
                        className={`px-3 py-1 ${page === num ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                      >
                        {num}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button 
                      onClick={() => paginate(Math.min(pageNums.length, page + 1))}
                      disabled={page === pageNums.length || pageNums.length === 0}
                      className={`px-3 py-1 ${page === pageNums.length || pageNums.length === 0 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-white'}`}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default HRadminPage;

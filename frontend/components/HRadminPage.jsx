import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { employeeApi as empApi, otpApi } from "../src/front2backconnect/api";
import useAuthStore from "../src/store/authStore";

import ActivityLogs from "./ActivityLogs";
import ErrorBoundary from "./ErrorBoundary";
import InviteUserModal from "./InviteUserModal";

const HRadminPage = () => {
  const [emps, setEmps] = useState([]);
  const [otpMsg, setOtpMsg] = useState("");
  const [otpLoad, setOtpLoad] = useState(false);

  const handleOtp = async () => {
    setOtpMsg("");
    setOtpLoad(true);
    try {
      const r = await otpApi.adminCleanup();
      setOtpMsg(r.data?.msg || "Cleanup triggered.");
    } catch (e) {
      console.error("OTP Cleanup error:", e);
      const m = e?.response?.data?.msg || e?.response?.data?.message || e?.message || "Failed to trigger cleanup.";
      setOtpMsg(`Error: ${m}`);
    } finally {
      setOtpLoad(false);
    }
  };

  const [load, setLoad] = useState(true);
  const [err, setErr] = useState(null);
  const { isAuthenticated: isAuth, isAdmin: isAdm } = useAuthStore();
  const nav = useNavigate();
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [pg, setPg] = useState(1);
  const lim = 5; // Fixed limit per page
  const [tot, setTot] = useState(0);
  const [srt, setSrt] = useState('name');
  const [ord, setOrd] = useState('asc');

  const [flt, setFlt] = useState({
    name: '',
    department: '',
    position: '',
  });
  const [deps, setDeps] = useState([]);
  const [poss, setPoss] = useState([]);

  const getData = async (q = {}) => {
    try {
      setLoad(true);
      const r = await empApi.allEMP(q);
      const { data, total, departments, positions } = r.data;
      setEmps(data);
      setTot(total);
      if (departments?.length) setDeps(departments);
      if (positions?.length) setPoss(positions);
      setLoad(false);
    } catch (e) {
      console.error("Error fetching data:", e);
      setErr("Failed to fetch employees. Please try again later.");
      setLoad(false);
    }
  };

  useEffect(() => {
    if (!isAuth) {
      nav('/login');
      return;
    }
    if (!isAdm) {
      nav('/profile');
      return;
    }
    empApi.filterOpts()
      .then(r => {
        if (r.data) {
          setDeps(r.data.departments || []);
          setPoss(r.data.positions || []);
        }
      })
      .catch(e => console.error("Failed to fetch filter options:", e));
  }, [isAuth, isAdm, nav]);

  useEffect(() => {
    if (isAuth && isAdm) {
      const p = {
        page: pg,
        limit: lim,
        sortBy: srt,
        order: ord,
        ...flt
      };
      getData(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pg, lim, srt, ord, flt.department, flt.position, isAuth, isAdm]);

  const delEmp = async (id) => {
    if (!isAdm) {
      setErr("Only administrators can delete employee records.");
      return;
    }
    try {
      await empApi.deleteEMP(id);
      setEmps(emps.filter((e) => e.id !== id));
    } catch {
      setErr("Failed to delete employee. Please try again.");
    }
  };

  const sortBy = (f) => {
    const o = f === srt && ord === 'asc' ? 'desc' : 'asc';
    setSrt(f);
    setOrd(o);
  };

  const fltChange = (e) => {
    const { name, value } = e.target;
    setFlt(prev => ({ ...prev, [name]: value }));
    if (name !== 'name') setPg(1);
  };

  const doSearch = () => {
    setPg(1);
    const p = {
      page: 1,
      limit: lim,
      sortBy: srt,
      order: ord,
      ...flt
    };
    getData(p);
  };

  const resetFlt = () => {
    setFlt({ name: '', department: '', position: '' });
    setPg(1);
    getData({ page: 1, limit: lim, sortBy: srt, order: ord });
  };

  const goPg = (n) => {
    setPg(n);
  };

  const pgs = [];
  for (let i = 1; i <= Math.ceil(tot / lim); i++) {
    pgs.push(i);
  }

  const fst = (pg - 1) * lim + 1;
  const lst = Math.min(pg * lim, tot);

  if (load) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center navbar-spacing">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black navbar-spacing">
      <div className="max-w-7xl mx-auto p-6">
        {err && (
          <div className="bg-red-100 border text-red-700 p-3 mb-4">{err}</div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">HR Admin Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={handleOtp}
              className={`px-4 py-2 bg-blue-700 text-white  ${otpLoad ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={otpLoad}
            >
              {otpLoad ? 'Cleaning OTPs...' : 'Cleanup OTPs'}
            </button>
            <Link to="/add">
              <button className={`px-6 py-2 bg-green-600 text-white`}>Add New Employee</button>
            </Link>
            {/* Invite User button for admins to generate/send invite links */}
            <button
              className="px-6 py-2 bg-blue-500 text-white"
              onClick={() => setShowInviteModal(true)}
            >
              Invite User
            </button>
            <InviteUserModal
              isOpen={showInviteModal}
              onClose={() => setShowInviteModal(false)}
              onSuccess={() => setShowInviteModal(false)}
            />
          </div>
        </div>
        {otpMsg && (
          <div className="bg-blue-100 border text-blue-700 p-3 mb-4">{otpMsg}</div>
        )}
        <div className="bg-gray-800 p-4 mb-6">
          <h2 className="text-white text-xl mb-3">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-300 mb-1">Name</label>
              <div className="flex">
                <input
                  type="text"
                  name="name"
                  value={flt.name}
                  onChange={fltChange}
                  className="flex-1 bg-gray-700 text-white border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search by name..."
                />
                <button onClick={doSearch} className={`ml-2 bg-blue-600 text-white px-3 py-1 `}>
                  Search
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Department</label>
              <select
                name="department"
                value={flt.department}
                onChange={fltChange}
                className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {deps.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Position</label>
              <select
                name="position"
                value={flt.position}
                onChange={fltChange}
                className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Positions</option>
                {poss.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button onClick={resetFlt} className={`px-6 py-2 bg-gray-600 text-white`}>
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
                    <th className="px-6 py-4" onClick={() => sortBy('name')}>
                      Name
                    </th>
                    <th className="px-6 py-4" onClick={() => sortBy('email')}>
                      Email
                    </th>
                    <th className="px-6 py-4" onClick={() => sortBy('department')}>
                      Department
                    </th>
                    <th className="px-6 py-4" onClick={() => sortBy('position')}>
                      Position
                    </th>
                    <th className="px-6 py-4" onClick={() => sortBy('salary')}>
                      Salary
                    </th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {emps.map((e) => (
                    <tr key={e.id} className="bg-gray-800">
                      <td className="px-6 py-4 text-white font-medium">{e.name}</td>
                      <td className="px-6 py-4 text-gray-300">{e.email}</td>
                      <td className="px-6 py-4 text-gray-300">{e.department || 'Not set'}</td>
                      <td className="px-6 py-4 text-gray-300">{e.position || 'Not set'}</td>
                      <td className="px-6 py-4 text-gray-300">${e.salary || '0'}</td>
                      <td className="px-6 py-4 flex justify-center gap-2">
                        <Link to={`/edit/${e.id}`}>
                          <button className={`bg-yellow-600 text-white px-3 py-1 `}>Edit</button>
                        </Link>
                        <button onClick={() => delEmp(e.id)} className={`bg-red-600 text-white px-3 py-1`}>
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
                Showing {fst} to {lst} of {tot} employees
              </div>
              <nav>
                <ul className="flex space-x-1">
                  <li>
                    <button
                      onClick={() => goPg(Math.max(1, pg - 1))}
                      disabled={pg === 1}
                      className={`px-3 py-1 ${pg === 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                    >
                      Prev
                    </button>
                  </li>
                  {pgs.map(n => (
                    <li key={n}>
                      <button
                        onClick={() => goPg(n)}
                        className={`px-3 py-1 ${pg === n ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                      >
                        {n}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => goPg(Math.min(pgs.length, pg + 1))}
                      disabled={pg === pgs.length || pgs.length === 0}
                      className={`px-3 py-1 ${pg === pgs.length || pgs.length === 0 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-white'}`}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </>
        )}
        
        {/* Activity Logs Section */}
        <div className="mt-12">
          <ErrorBoundary showDetails={true}>
            <ActivityLogs />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};
export default HRadminPage;

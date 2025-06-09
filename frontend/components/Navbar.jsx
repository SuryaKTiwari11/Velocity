import React from "react";
import { Link } from "react-router-dom";
const Navbar = () => {
  return (
    <nav className="bg-blue-500 p-4 ">
      <div className="mx-40 flex justify-between items-center">
        <h1 className=" text-white font-bold text-2xl ">EMP Management</h1>
        <Link to="/add">
          <button className=" flex items-center bg-black text-white px-4 py-2  ">
            Add Employee
          </button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;

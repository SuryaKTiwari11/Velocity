import React from 'react'
import { Link } from 'react-router-dom'

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 bg-black min-h-screen text-center">
      <h1 className="text-white text-4xl font-bold">Welcome to Employee Management System</h1>
      <p className="text-gray-400">Please login or signup to continue</p>
      <div className="flex gap-4 mt-4">
        <Link to="/login">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md text-lg">
            Login
          </button>
        </Link>
        <Link to="/signup">
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-lg">
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  )
}

export default LandingPage

import React from 'react'
import { Link } from 'react-router-dom'

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 bg-black min-h-screen text-center">
      <h1 className="text-white text-4xl font-bold">Welcome to Employee Management System</h1>
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
        <Link to="/login">
          <button className="bg-purple-600 text-white px-6 py-2 text-lg">
            Login
          </button>
        </Link>
        <Link to="/signup">
          <button className="bg-green-600 text-white px-6 py-2 text-lg">
            Sign Up
          </button>
        </Link>
        <Link to="/verify-otp">
          <button className="bg-blue-600 text-white px-6 py-2 text-lg">
            Verify Email
          </button>
        </Link>
      </div>
    </div>
  )
}

export default LandingPage

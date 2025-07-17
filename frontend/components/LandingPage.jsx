  import React from 'react'
import { Link } from 'react-router-dom'
import UserLocationMap from './UserLocationMap'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center gap-6 text-center navbar-spacing py-20">
        <h1 className="text-white text-5xl font-bold mb-4">
          Employee Management System
        </h1> 
        <p className="text-white/80 text-xl mb-8 max-w-2xl">
          Streamline your workforce management with our comprehensive EMS platform. 
          Join thousands of professionals across India using our system.
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/login">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg rounded-lg transition-colors">
              Login
            </button>
          </Link>
          <Link to="/signup">
            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg rounded-lg transition-colors">
              Sign Up
            </button>
          </Link>
          <Link to="/verify-otp">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-lg transition-colors">
              Verify Email
            </button>
          </Link>
        </div>
      </div>

      {/* Map Section */}
      <div className="container mx-auto px-6 pb-20">
        <UserLocationMap />
      </div>

      {/* Features Section */}
      <div className="bg-white/5 backdrop-blur-sm py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose Our EMS?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">User Management</h3>
              <p className="text-white/70">Secure authentication, role-based access, and premium subscriptions</p>
            </div>
            
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 19h8a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Video Meetings</h3>
              <p className="text-white/70">Google Meet-style video calls with real-time chat integration</p>
            </div>
            
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Document Management</h3>
              <p className="text-white/70">Real-time uploads, Socket.IO integration, and premium features</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage

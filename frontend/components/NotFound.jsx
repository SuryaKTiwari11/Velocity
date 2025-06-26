import React from "react";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-400">404</h1>
      <p className="text-xl text-gray-600 mt-4">Page not found</p>
      <a href="/" className="text-blue-500 hover:text-blue-700 mt-2 inline-block">
        Go home
      </a>
    </div>
  </div>
);

export default NotFound;

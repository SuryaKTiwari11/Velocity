import React from "react";

function Bar({ progress }) {
  return (
    <div className="w-full bg-gray-200 rounded-lg overflow-hidden h-6 shadow-sm">
      <div
        className="bg-green-500 h-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
}

export default Bar;
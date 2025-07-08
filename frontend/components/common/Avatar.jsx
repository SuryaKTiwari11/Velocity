import React from 'react';

// Simple function to generate avatar background color based on name
const getAvatarColor = (name) => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const Avatar = ({ name, email, size = 'w-10 h-10', className = '', showOnline = false }) => {
  const displayName = name || email || 'User';
  const initial = displayName[0].toUpperCase();
  const colorClass = getAvatarColor(displayName);

  return (
    <div className={`relative ${className}`}>
      <div className={`${size} ${colorClass} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
        {initial}
      </div>
      {showOnline && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
    </div>
  );
};

export default Avatar;

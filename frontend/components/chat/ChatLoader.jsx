import React from 'react';

const ChatLoader = () => {
  return (
    <div className="flex items-center justify-center h-[93vh] bg-gradient-to-b from-green-100 to-green-200">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-green-800 font-medium">Connecting to chat...</p>
        <p className="text-green-600 text-sm mt-2">Please wait while we establish connection</p>
      </div>
    </div>
  );
};

export default ChatLoader;
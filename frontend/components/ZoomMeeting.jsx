import React, { useState } from 'react';
import { Video, ExternalLink, Copy, Plus, Users } from 'lucide-react';

// Simple Zoom meeting component for students
const ZoomMeeting = () => {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [showEmbed, setShowEmbed] = useState(false);
  const [activeTab, setActiveTab] = useState('join'); // 'join' or 'start'

  // Extract Zoom meeting ID from URL
  const extractMeetingId = (url) => {
    const match = url.match(/\/j\/(\d+)/);
    return match ? match[1] : null;
  };

  // Handle joining meeting
  const handleJoinMeeting = () => {
    if (!meetingUrl.trim()) {
      alert('Please enter a Zoom meeting URL');
      return;
    }

    const meetingId = extractMeetingId(meetingUrl);
    if (!meetingId) {
      alert('Please enter a valid Zoom meeting URL');
      return;
    }

    setShowEmbed(true);
  };

  // Handle starting a new meeting
  const handleStartMeeting = () => {
    // Open Zoom web client to start a new meeting
    window.open('https://zoom.us/start/webmeeting', '_blank');
  };

  // Copy meeting URL to clipboard
  const copyMeetingUrl = () => {
    navigator.clipboard.writeText(meetingUrl);
    alert('Meeting URL copied!');
  };

  if (showEmbed) {
    return (
      <div className="min-h-screen bg-gray-100 navbar-spacing">
        <div className="container mx-auto p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">Zoom Meeting</h1>
              <div className="flex space-x-2">
                <button
                  onClick={copyMeetingUrl}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy URL</span>
                </button>
                <button
                  onClick={() => window.open(meetingUrl, '_blank')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in Zoom</span>
                </button>
                <button
                  onClick={() => setShowEmbed(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Back
                </button>
              </div>
            </div>
          </div>

          {/* Zoom Meeting Embed */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <iframe
              src={meetingUrl}
              width="100%"
              height="600"
              frameBorder="0"
              allow="camera; microphone; fullscreen; speaker; display-capture"
              className="w-full"
              title="Zoom Meeting"
            ></iframe>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 navbar-spacing">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Zoom Meeting</h1>
          <p className="text-gray-600">Join an existing meeting or start a new one</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === 'join'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Join Meeting</span>
          </button>
          <button
            onClick={() => setActiveTab('start')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === 'start'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Start Meeting</span>
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {activeTab === 'join' ? (
            // Join Meeting Form
            <>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Zoom Meeting URL
                </label>
                <input
                  type="url"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://zoom.us/j/1234567890"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <button
                onClick={handleJoinMeeting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg flex items-center justify-center space-x-2"
              >
                <Users className="w-5 h-5" />
                <span>Join Meeting</span>
              </button>
            </>
          ) : (
            // Start Meeting Form
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-green-800 mb-2">Start New Meeting</h3>
                <p className="text-green-700 text-sm">
                  Click below to start a new Zoom meeting. You'll be redirected to Zoom's website 
                  where you can start your meeting instantly.
                </p>
              </div>

              <button
                onClick={handleStartMeeting}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Start New Meeting</span>
              </button>
            </>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          {activeTab === 'join' ? (
            <>
              <p className="text-gray-500 text-sm">
                Paste your Zoom meeting invitation URL above
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Example: https://zoom.us/j/1234567890
              </p>
            </>
          ) : (
            <p className="text-gray-500 text-sm">
              You'll need to sign in to your Zoom account to start a meeting
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZoomMeeting;

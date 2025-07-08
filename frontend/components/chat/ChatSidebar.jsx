import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../src/store/authStore';
import { chatApi } from '../../src/front2backconnect/api';
import { toast } from 'react-hot-toast';
import Avatar from '../common/Avatar';
import { StreamChat } from 'stream-chat';
import { ChannelList, Chat } from 'stream-chat-react';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// Error Boundary for sidebar components
class SidebarErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Sidebar Error Boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="w-80 bg-gray-800 border-r border-gray-700 flex items-center justify-center">
                    <div className="text-center text-white p-4">
                        <p className="text-sm text-gray-400">Sidebar error</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                        >
                            Reload
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const ChatSidebar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('recent'); // 'recent' or 'search'
  const [chatClient, setChatClient] = useState(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Initialize Stream Chat client
  useEffect(() => {
    const initStreamClient = async () => {
      try {
        if (!user) return;

        const response = await chatApi.getStreamToken();
        const { token } = response.data;

        const userData = {
          id: user.id.toString(),
          name: user.name || user.email,
        };

        const client = StreamChat.getInstance(STREAM_API_KEY);
        
        // Only connect if not already connected to prevent consecutive calls
        if (!client.userID) {
          await client.connectUser(userData, token);
        }
        setChatClient(client);
      } catch (error) {
        console.error('Error initializing Stream client:', error);
        toast.error('Failed to initialize chat');
      }
    };

    if (user) {
      initStreamClient();
    }
  }, [user]);

  // Search users when search query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await chatApi.searchUsers(searchQuery.trim());
        setSearchResults(response.data.users || []);
        setActiveTab('search');
      } catch (error) {
        console.error('Error searching users:', error);
        toast.error('Failed to search users');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const startChat = (targetUserId) => {
    navigate(`/chat/${targetUserId}`);
  };

  const startCall = (targetUserId) => {
    const callId = `call-${user.id}-${targetUserId}-${Date.now()}`;
    navigate(`/call/${callId}`);
  };

  const UserItem = ({ targetUser, isRecent = false }) => (
    <div className="flex items-center p-3 hover:bg-gray-700 cursor-pointer group border-b border-gray-600">
      <Avatar 
        name={targetUser.name} 
        email={targetUser.email} 
        size="w-12 h-12" 
        showOnline={true} 
      />
      
      <div className="ml-3 flex-grow min-w-0">
        <h3 className="font-medium text-white truncate">
          {targetUser.name || targetUser.email}
        </h3>
        <p className="text-sm text-gray-300 truncate">
          {targetUser.email}
        </p>
        {isRecent && (
          <p className="text-xs text-gray-400">
            Last message...
          </p>
        )}
      </div>
      
      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            startChat(targetUser.id);
          }}
          className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-xs"
          title="Chat"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.97 8.97 0 01-4.906-1.49L3 21l2.49-5.094A8.97 8.97 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            startCall(targetUser.id);
          }}
          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-xs"
          title="Call"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <SidebarErrorBoundary>
      <div className="h-full bg-gray-800 border-r border-gray-700 w-80 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <h1 className="text-xl font-semibold text-white mb-3">Chats</h1>
          
          {/* Search Input */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4">
            <div className="animate-pulse">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {activeTab === 'search' && searchQuery.trim().length >= 2 && (
          <div>
            {searchResults.length > 0 ? (
              <div>
                <div className="px-4 py-2 bg-gray-700 text-sm font-medium text-gray-200 border-b border-gray-600">
                  Search Results
                </div>
                {searchResults.map((user) => (
                  <UserItem key={user.id} targetUser={user} />
                ))}
              </div>
            ) : !loading && (
              <div className="p-4 text-center text-gray-300">
                No users found for "{searchQuery}"
              </div>
            )}
          </div>
        )}

        {/* Recent Chats using Stream's ChannelList */}
        {activeTab === 'recent' && chatClient && (
          <Chat client={chatClient}>
            <ChannelList
              filters={{ members: { $in: [user.id.toString()] } }}
              sort={{ last_message_at: -1 }}
              options={{ limit: 10 }}
              Preview={(props) => {
                const { channel } = props;
                const members = Object.values(channel.state.members || {});
                const otherMembers = members.filter(member => member.user?.id !== user?.id.toString());
                const otherUser = otherMembers[0]?.user;
                const lastMessage = channel.state.messages[channel.state.messages.length - 1];

                if (!otherUser) return null;

                return (
                  <div
                    className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-600 flex items-center transition-colors"
                    onClick={() => navigate(`/chat/${otherUser.id}`)}
                  >
                    <Avatar
                      name={otherUser.name}
                      email={otherUser.id}
                      size="w-10 h-10"
                      className="mr-3"
                      showOnline={otherUser.online}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">
                          {otherUser.name || otherUser.id}
                        </p>
                        {lastMessage && (
                          <span className="text-xs text-gray-400">
                            {new Date(lastMessage.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 truncate">
                        {otherUser.id}
                      </p>
                      {lastMessage && (
                        <p className="text-xs text-gray-400 truncate mt-1">
                          {lastMessage.text || 'Message'}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }}
            />
          </Chat>
        )}

        {/* Empty state for recent chats */}
        {activeTab === 'recent' && !chatClient && (
          <div className="p-4 text-center text-gray-300">
            <div className="mb-3">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.97 8.97 0 01-4.906-1.49L3 21l2.49-5.094A8.97 8.97 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-2">Loading chats...</p>
          </div>
        )}

        {/* Show recent chats when no search */}
        {!searchQuery.trim() && activeTab !== 'recent' && (
          <div className="p-4 text-center">
            <button
              onClick={() => setActiveTab('recent')}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              View Recent Chats
            </button>
          </div>
        )}
      </div>
    </div>
    </SidebarErrorBoundary>
  );
};

export default ChatSidebar;

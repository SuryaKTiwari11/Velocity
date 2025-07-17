import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StreamChat } from 'stream-chat';
import {
    Chat,
    Channel,
    ChannelHeader,
    MessageList,
    MessageInput,
    Window,
    Thread,
    useChannelStateContext,
    TypingIndicator,
    MessageSimple,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import './ChatTheme.css';
import { toast } from 'react-hot-toast';
import ChatLoader from './ChatLoader';
import { chatApi } from '../../src/front2backconnect/api';
import useAuthStore from '../../src/store/authStore';
import ChatSidebar from './ChatSidebar';
import Avatar from '../common/Avatar';

// Error Boundary for chat components
class ChatErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Chat Error Boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center h-64 bg-gray-900">
                    <div className="text-center text-white">
                        <h3 className="text-lg font-semibold mb-2">Chat Error</h3>
                        <p className="text-gray-400 mb-4">Something went wrong with the chat component.</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Custom message component to handle call invitations
const CustomMessage = (props) => {
    const { message } = props;
    const navigate = useNavigate();
    
    try {
        // Enhanced safety checks - null/undefined messages are normal in Stream Chat
        if (!message || typeof message !== 'object') {
            return <MessageSimple {...props} />;
        }
        
        // Debug logging to see message structure
        console.log('CustomMessage received:', {
            type: message.type,
            text: message.text,
            call_invitation: message.call_invitation,
            custom: message.custom,
            user: message.user?.name
        });
        
        // Check for call invitation in multiple ways
        const hasCallInvitation = message.call_invitation;
        const hasCallText = message.text && (
            message.text.includes('📹') || 
            message.text.includes('📞') || 
            message.text.includes('inviting you to a')
        );
        
        if (hasCallInvitation || hasCallText) {
            let callInvitation, callId, isAudioCall = false;
            
            if (hasCallInvitation) {
                callInvitation = message.call_invitation;
                callId = callInvitation.call_id;
                isAudioCall = callInvitation.type === 'audio' || message.text?.includes('📞');
            } else {
                // Handle legacy messages or messages without custom data
                isAudioCall = message.text?.includes('📞') || message.text?.includes('audio call');
                // Try to extract call ID from various sources
                if (props.channel?.id) {
                    callId = props.channel.id;
                } else {
                    // Fallback: create call ID from message context
                    const userId1 = message.user?.id;
                    const channelMembers = props.channel?.state?.members;
                    if (channelMembers) {
                        const members = Object.values(channelMembers);
                        const otherUser = members.find(m => m.user?.id !== userId1)?.user;
                        if (otherUser) {
                            callId = [userId1, otherUser.id].sort().join('-');
                        }
                    }
                }
                
                callInvitation = { 
                    call_id: callId, 
                    sender_name: message.user?.name || 'Someone',
                    type: isAudioCall ? 'audio' : 'video'
                };
            }
            
            console.log('Call invitation detected:', { callInvitation, callId, isAudioCall });
            
            if (!callId) {
                console.warn('CustomMessage: call_id could not be determined', message);
                return <MessageSimple {...props} />;
            }
            
            return (
                <div className="str-chat__message-wrapper my-2" style={{ width: '100%' }}>
                    <div className="call-invitation-card mx-4 mb-4">
                        <div className={`${isAudioCall ? 'bg-green-600' : 'bg-blue-600'} border-2 ${isAudioCall ? 'border-green-400' : 'border-blue-400'} rounded-xl p-6 shadow-xl`}>
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="bg-white rounded-full p-3 shadow-lg">
                                    {isAudioCall ? (
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L6.16 11.37a1 1 0 00-.55.894v.001a16.094 16.094 0 007.124 7.124h.001a1 1 0 00.894-.55l1.983-4.064a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-bold text-xl mb-1">
                                        {isAudioCall ? '📞 Audio Call Invitation' : '📹 Video Call Invitation'}
                                    </h3>
                                    <p className="text-white/90 text-base">
                                        <strong>{callInvitation.sender_name || 'Someone'}</strong> wants to start {isAudioCall ? 'an audio' : 'a video'} call with you
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    console.log('Joining call with ID:', callId);
                                    navigate(`/call/${callId}${isAudioCall ? '?audio=true' : ''}`);
                                }}
                                className="w-full bg-white text-gray-900 font-bold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
                            >
                                {isAudioCall ? '📞 Join Audio Call' : '🎥 Join Video Call'}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        
        // For regular messages, use the default MessageSimple component
        return <MessageSimple {...props} />;
    } catch (error) {
        console.error('Error in CustomMessage component:', error, { message });
        return <MessageSimple {...props} />;
    }
};

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// Custom channel header component with enhanced features
const CustomChannelHeader = () => {
    const { channel } = useChannelStateContext();
    const navigate = useNavigate();
    const members = Object.values(channel.state.members || {});
    const otherMembers = members.filter(member => member.user?.id !== channel._client?.userID);
    const otherUser = otherMembers[0]?.user;

    if (!otherUser) return null;

    const memberCount = members.length;
    const onlineCount = members.filter(member => member.user?.online).length;

    const startAudioCall = async () => {
        try {
            // Create a consistent call ID that both users can join
            const userId1 = channel._client?.userID;
            const userId2 = otherUser.id;
            const callId = [userId1, userId2].sort().join('-');
            
            // Send an audio call invitation message
            await channel.sendMessage({
                text: `📞 ${channel._client?.user?.name || 'Someone'} is inviting you to an audio call!`,
                call_invitation: {
                    call_id: callId,
                    sender_name: channel._client?.user?.name || 'Someone',
                    timestamp: new Date().toISOString(),
                    type: 'audio'
                }
            });
            
            // Navigate to call with audio-only parameter
            navigate(`/call/${callId}?audio=true`);
        } catch (error) {
            console.error('Error starting audio call:', error);
            toast.error('Failed to start audio call');
        }
    };

    const startVideoCall = async () => {
        try {
            // Create a consistent call ID that both users can join
            const userId1 = channel._client?.userID;
            const userId2 = otherUser.id;
            const callId = [userId1, userId2].sort().join('-');
            
            // Send a call invitation message with custom data
            await channel.sendMessage({
                text: `📹 ${channel._client?.user?.name || 'Someone'} is inviting you to a video call!`,
                call_invitation: {
                    call_id: callId,
                    sender_name: channel._client?.user?.name || 'Someone',
                    timestamp: new Date().toISOString()
                }
            });
            
            // Navigate to call
            navigate(`/call/${callId}`);
        } catch (error) {
            console.error('Error starting video call:', error);
            toast.error('Failed to start video call');
        }
    };

    return (
        <div className="p-4 border-b border-gray-700 bg-gray-800 flex items-center justify-between">
            <div className="flex items-center">
                <Avatar 
                    name={otherUser.name} 
                    email={otherUser.id} 
                    size="w-10 h-10" 
                    className="mr-3"
                    showOnline={otherUser.online}
                />
                <div>
                    <h3 className="font-semibold text-white">
                        {otherUser.name || otherUser.id}
                    </h3>
                    <div className="flex items-center space-x-2">
                        <p className={`text-sm ${otherUser.online ? 'text-green-400' : 'text-gray-400'}`}>
                            {otherUser.online ? 'Online' : 'Offline'}
                        </p>
                        {otherUser.last_active && !otherUser.online && (
                            <span className="text-xs text-gray-500">
                                Last seen {new Date(otherUser.last_active).toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-3">
                <div className="text-xs text-gray-400">
                    {memberCount} member{memberCount !== 1 ? 's' : ''} • {onlineCount} online
                </div>
                <div className="flex space-x-1">
                    <button 
                        className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded transition-colors"
                        onClick={startAudioCall}
                        title="Start audio call"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L6.16 11.37a1 1 0 00-.55.894v.001a16.094 16.094 0 007.124 7.124h.001a1 1 0 00.894-.55l1.983-4.064a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </button>
                    <button 
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"
                        onClick={startVideoCall}
                        title="Start video call"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

const ChatPage = () => {
    const { id: targetUserId } = useParams();
    const [chatClient, setChatClient] = useState(null);
    const [channel, setChannel] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Get user from your auth store
    const { user, isAuthenticated, isLoading } = useAuthStore();

    const initChat = useCallback(async () => {
        try {
            if (!user || !targetUserId) {
                toast.error('Missing user information');
                return;
            }

            // First, upsert the target user in Stream Chat, sending companyId
            await chatApi.upsertTargetUser(targetUserId, user?.companyId);

            // Use your existing chatApi to get the token
            const response = await chatApi.getStreamToken();
            const { token } = response.data;

            // Initialize Stream Chat client using global instance
            const userData = {
                id: user.id.toString(),
                name: user.name || user.email,
            };
            
            // Initialize Stream Chat client
            const client = StreamChat.getInstance(STREAM_API_KEY);
            
            // Only connect if not already connected to prevent consecutive calls
            if (!client.userID) {
                await client.connectUser(userData, token);
            }
            setChatClient(client);

            // Create a unique channel ID by sorting user IDs
            const channelId = [user.id.toString(), targetUserId.toString()].sort().join('-');

            // Create or get the channel
            const currentChannel = client.channel('messaging', channelId, {
                members: [user.id.toString(), targetUserId.toString()],
            });

            await currentChannel.watch();
            setChannel(currentChannel);
            
        } catch (error) {
            console.error('Error initializing chat:', error);
            // Don't redirect on error, just show error message
            toast.error('Failed to initialize chat: ' + error.message);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }, [targetUserId, user]);

    useEffect(() => {
        if (isAuthenticated && user?.id && targetUserId) {
            initChat();
        } else if (isAuthenticated && user?.id && !targetUserId) {
            // If no target user, we're just showing the sidebar, so stop loading
            setLoading(false);
        }

        // Don't add cleanup here to prevent redirects
    }, [initChat, isAuthenticated, user?.id, targetUserId]);

    // Show loading while auth is being checked or chat is initializing
    if (isLoading || (targetUserId && loading)) {
        return <ChatLoader />;
    }

    // If not authenticated, redirect or show error
    if (!isAuthenticated || !user) {
        return (
            <div className="flex items-center justify-center h-[93vh]">
                <div className="text-center">
                    <p className="text-gray-600">Please log in to use chat</p>
                </div>
            </div>
        );
    }

    // If no targetUserId, show available users
    if (!targetUserId) {
        return (
            <div className="flex h-screen pt-16 bg-gray-900">
                <ChatSidebar />
                <div className="flex-1 flex items-center justify-center bg-gray-800">
                    <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl">
                            💬
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Welcome to Chat
                        </h2>
                        <p className="text-gray-400">
                            Select a user from the sidebar to start chatting
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!chatClient || !channel) {
        return (
            <div className="flex items-center justify-center h-[93vh]">
                <div className="text-center">
                    <p className="text-gray-600">Failed to load chat</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }        return (
            <div className="flex h-screen pt-16 bg-gray-900">
                <ChatSidebar />
                <div className="flex-1">
                    <ChatErrorBoundary>
                        <Chat client={chatClient}>
                            <Channel 
                                channel={channel}
                                // Enable additional features
                                enrichURLForPreview={true}
                                skipMessageDataMemoization={false}
                            >
                                <Window>
                                    <CustomChannelHeader />
                                    <MessageList 
                                        // Enable message features
                                        messageActions={['edit', 'delete', 'flag', 'mute', 'pin', 'quote', 'react', 'reply']}
                                        // Enable file uploads
                                        allowMultipleFiles={true}
                                        maxNumberOfFiles={10}
                                        // Enable link previews
                                        enrichURLForPreview={true}
                                        // Show typing indicator
                                        TypingIndicator={TypingIndicator}
                                        // Custom message renderer for call invitations
                                        Message={CustomMessage}
                                        // Ensure our custom message component is used
                                        disableDateSeparator={false}
                                        // Custom message rendering
                                        messageWrapperDisplayName="CustomMessageWrapper"
                                    />
                                    <MessageInput 
                                        focus 
                                        // Enable file uploads
                                        acceptedFiles={['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx', '.txt']}
                                        // Max file size (10MB)
                                        maxFileSize={10 * 1024 * 1024}
                                        // Enable multiple attachments
                                        multipleUploads={true}
                                        // Show character count
                                        maxRows={4}
                                        placeholder="Type a message..."
                                        // Enable mentions
                                        mentionAllAppUsers={true}
                                    />
                                </Window>
                                <Thread 
                                    // Additional thread features
                                    additionalMessageInputProps={{
                                        placeholder: "Reply to thread...",
                                        maxRows: 3,
                                    }}
                                />
                            </Channel>
                        </Chat>
                    </ChatErrorBoundary>
                </div>
            </div>
    );
};

export default ChatPage;

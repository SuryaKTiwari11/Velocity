import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthStore from "../../src/store/authStore";
import { chatApi } from "../../src/front2backconnect/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import { toast } from "react-hot-toast";
import ChatLoader from "./ChatLoader"; // Use your existing loader

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [token, setToken] = useState(null);

  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    const getToken = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        const response = await chatApi.getStreamToken();
        setToken(response.data.token);
      } catch (error) {
        console.error("Failed to get token:", error);
        toast.error("Failed to get video token");
      }
    };

    getToken();
  }, [isAuthenticated, user]);

  useEffect(() => {
    const initCall = async () => {
      if (!token || !user || !callId) return;

      try {
        console.log("Initializing Stream video client...");

        const userData = {
          id: user.id.toString(),
          name: user.name || user.email,
          image: user.avatar,
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user: userData,
          token: token,
        });

        const callInstance = videoClient.call("default", callId);

        await callInstance.join({ create: true });

        console.log("Joined call successfully");

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();
  }, [token, user, callId]);

  if (isLoading || isConnecting) return <ChatLoader />;

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Could not initialize call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const navigate = useNavigate();

  if (callingState === CallingState.LEFT) return navigate("/");

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;
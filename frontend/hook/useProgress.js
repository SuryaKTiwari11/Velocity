import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import getPercent from "./getPercent";

const useProgress = (documentId, userId) => {
  const [status, setStatus] = useState("starting");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!documentId || !userId) return;
    const socket = io("http://localhost:3000");
    socket.emit("join", userId);
    socket.on("doc-progress", (data) => {
      if (data.documentId === documentId) {
        setStatus(data.status);
        setProgress(getPercent(data.status));
      }
    });
    return () => socket.disconnect();
  }, [documentId, userId]);

  return { status, progress };
};

export default useProgress;

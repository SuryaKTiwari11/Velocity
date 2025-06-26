import { useState, useEffect, useCallback, useRef } from "react";
import io from "socket.io-client";
import { documentApi } from "../src/front2backconnect/api.js";
import useAuthStore from "../src/store/authStore.js";

export default function useDocumentManager() {
  const { user } = useAuthStore();
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("resume");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUploadedDocId, setLastUploadedDocId] = useState(null);
  const [progress, setProgress] = useState(0);
  const socketRef = useRef(null);

  const loadDocuments = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await documentApi.list(user.id);
      setDocuments(response.data.documents || []);
    } catch (error) {
      setMessage("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    if (!user) return;
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:3000");
    }
    const socket = socketRef.current;
    const progressMap = {
      starting: 10,
      movingFile: 40,
      updatingDb: 80,
      done: 100,
      error: 0,
    };
    const onProgress = ({ documentId, status }) => {
      if (lastUploadedDocId && documentId === lastUploadedDocId) {
        setProgress(progressMap[status] || 0);
        setMessage(`Status: ${status}`);
        if (status === "done" || status === "error") {
          setTimeout(() => setProgress(0), 1500);

          loadDocuments();
        }
      }
    };
    socket.on("doc-progress", onProgress);
    return () => {
      socket.off("doc-progress", onProgress);
    };
  }, [user, lastUploadedDocId, loadDocuments]);

  // Upload handler
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setMessage("Please select a file");
    setUploading(true);
    setMessage("Uploading...");
    setProgress(5);
    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("documentType", docType);
      const res = await documentApi.upload(formData);
      setMessage("Upload successful! Processing...");
      setFile(null);
      if (e.target && typeof e.target.reset === "function") e.target.reset();
      if (res.data?.document?.id) setLastUploadedDocId(res.data.document.id);
   
      if (!socketRef.current) {
        socketRef.current = io("http://localhost:3000");
        setTimeout(() => loadDocuments(), 200);
      }
    } catch (error) {
      setMessage("Upload failed: " + error.message);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    try {
      await documentApi.delete(docId);
      setMessage("Document deleted");
      loadDocuments();
    } catch (error) {
      setMessage("Delete failed: " + error.message);
    }
  };

  const handleDownload = async (docId, fileName) => {
    try {
      const response = await documentApi.download(docId);
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setMessage("Download failed");
    }
  };


  const handleSearch = async () => {
    if (!searchQuery.trim()) return loadDocuments();
    try {
      const response = await documentApi.search(user.id, searchQuery);
      setDocuments(response.data.documents || []);
    } catch (error) {
      setMessage("Search failed");
    }
  };

  return {
    user,
    file,
    setFile,
    docType,
    setDocType,
    uploading,
    message,
    progress,
    documents,
    loading,
    searchQuery,
    setSearchQuery,
    handleUpload,
    handleDelete,
    handleDownload,
    handleSearch,
    loadDocuments,
    lastUploadedDocId,
  };
}

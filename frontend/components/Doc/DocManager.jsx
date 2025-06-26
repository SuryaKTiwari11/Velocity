import React, { useState, useEffect, useCallback } from 'react';
import { documentApi } from '../../src/front2backconnect/api.js';
import useAuthStore from '../../src/store/authStore.js';

import { ProgressWrapper, DocUpload, DocSearch, DocList } from './DocManagerParts.jsx';

const DocManager = () => {
  const { user } = useAuthStore();
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('resume');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUploadedDocId, setLastUploadedDocId] = useState(null);

  // CRUD logic
  const loadDocuments = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await documentApi.list(user.id);
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { setMessage('❌ Please select a file'); return; }
    setUploading(true); setMessage('🔄 Uploading...');
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', docType);
      const res = await documentApi.upload(formData);
      setMessage('✅ Upload successful! Processing...');
      setFile(null); e.target.reset();
      if (res.data && res.data.document && res.data.document.id) setLastUploadedDocId(res.data.document.id);
      setTimeout(loadDocuments, 2000);
    } catch (error) {
      setMessage('❌ Upload failed: ' + error.message);
    } finally { setUploading(false); }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentApi.delete(docId);
      setMessage('🗑️ Document deleted');
      loadDocuments();
    } catch (error) {
      setMessage('❌ Delete failed: ' + error.message);
    }
  };

  const handleDownload = async (docId, fileName) => {
    try {
      const response = await documentApi.download(docId);
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) { loadDocuments(); return; }
    try {
      const response = await documentApi.search(user.id, searchQuery);
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  if (!user) return <div className="text-center p-8">Please log in to manage documents</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 pt-20">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900"> Document Manager</h1>
      
      </div>
      <DocUpload
        docType={docType}
        setDocType={setDocType}
        setFile={setFile}
        uploading={uploading}
        handleUpload={handleUpload}
        message={message}
        lastUploadedDocId={lastUploadedDocId}
        user={user}
      />
      <DocSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        loadDocuments={loadDocuments}
      />
      <DocList
        documents={documents}
        loading={loading}
        loadDocuments={loadDocuments}
        handleDownload={handleDownload}
        handleDelete={handleDelete}
      />
    </div>
  );
};

export default DocManager;

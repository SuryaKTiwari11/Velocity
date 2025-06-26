import React from 'react';
import useProgress from '../../hook/useProgress.js';
import Progress from '../Progress.jsx';

const docTypes = [
  { value: 'resume', label: '📄 Resume' },
  { value: 'certificate', label: '🏆 Certificate' },
  { value: 'id_proof', label: '🆔 ID Proof' },
  { value: 'other', label: '📋 Other' }
];

export function ProgressWrapper({ documentId, userId }) {
  const { status, progress } = useProgress(documentId, userId);
  if (status === 'done' || status === 'error') return null;
  return <Progress status={status} progress={progress} />;
}

export function DocUpload({ docType, setDocType, setFile, uploading, handleUpload, message, lastUploadedDocId, user }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">📤 Upload Document</h2>
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Document Type</label>
            <select
              value={docType}
              onChange={e => setDocType(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {docTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Choose File</label>
            <input
              type="file"
              onChange={e => setFile(e.target.files[0])}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="w-full p-3 border rounded-lg"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
        >
          {uploading ? '🔄 Uploading...' : '📤 Upload Document'}
        </button>
      </form>
      {message && (
        <div className={`mt-4 p-3 rounded-lg ${
          message.includes('successful') ? 'bg-green-100 text-green-800' :
          message.includes('failed') ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {message}
        </div>
      )}
      {lastUploadedDocId && <ProgressWrapper documentId={lastUploadedDocId} userId={user.id} />}
    </div>
  );
}

export function DocSearch({ searchQuery, setSearchQuery, handleSearch, loadDocuments }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">🔍 Search Documents</h2>
      <div className="flex space-x-3">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by filename..."
          className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          onKeyPress={e => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          🔍 Search
        </button>
        <button
          onClick={loadDocuments}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
}

export function DocList({ documents, loading, loadDocuments, handleDownload, handleDelete }) {
  const formatFileSize = bytes => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };
  const getStatusColor = status => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800';
      case 'uploaded': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">📋 My Documents ({documents.length})</h2>
        <button
          onClick={loadDocuments}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          🔄 Refresh
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📂</div>
          <p className="text-gray-500 text-lg">No documents found</p>
          <p className="text-gray-400 text-sm">Upload your first document above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map(doc => (
            <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">
                      {docTypes.find(t => t.value === doc.documentType)?.label.split(' ')[0] || '📄'}
                    </span>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{doc.originalName}</h3>
                      <p className="text-sm text-gray-600">
                        {docTypes.find(t => t.value === doc.documentType)?.label || doc.documentType} •
                        {formatFileSize(doc.fileSize)} •
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                    {doc.status === 'processed' ? '✅ Ready' :
                      doc.status === 'uploaded' ? '⏳ Processing' : '❌ Error'}
                  </span>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleDownload(doc.id, doc.originalName)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    📥 Download
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

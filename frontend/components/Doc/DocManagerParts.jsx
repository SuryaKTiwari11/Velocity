import useProgress from '../../hook/useProgress.js';
import Progress from '../Progress.jsx';
const docTypes = [
  { value: 'resume', label: 'Resume' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'id_proof', label: 'ID Proof' },
  { value: 'other', label: 'Other' }
];

export function ProgressWrapper({ documentId, userId }) {
  const { status, progress } = useProgress(documentId, userId);
  if (status === 'done' || status === 'error') return null;
  return <Progress status={status} progress={progress} />;
}

export function DocUpload({ docType, setDocType, setFile, uploading, handleUpload, message, lastUploadedDocId, user }) {
  return (
    <div className="bg-gray-100 p-4 mb-4 rounded-lg">
      <h2 className="text-lg font-bold mb-2 flex items-center">
        📤 Upload Document 
        <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
          S3 Storage
        </span>
      </h2>
      <form onSubmit={handleUpload}>
        <div className="mb-2">
          <label className="block text-sm mb-1 font-medium">Document Type</label>
          <select
            value={docType}
            onChange={e => setDocType(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            {docTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block text-sm mb-1 font-medium">Choose File</label>
          <input
            type="file"
            onChange={e => setFile(e.target.files[0])}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
            className="w-full p-2 border rounded-md"
          />
          <p className="text-xs text-gray-500 mt-1">
            Supported: PDF, Images, Word documents, Text files
          </p>
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-500 text-white py-2 rounded-md mt-2 hover:bg-blue-600 disabled:bg-gray-400"
        >
          {uploading ? '⬆️ Uploading to S3...' : '📤 Upload to S3'}
        </button>
      </form>
      {message && (
        <div className={`mt-2 p-2 rounded-md text-sm ${
          message.includes('successful') || message.includes('Downloading') ? 'bg-green-200 text-green-900' :
          message.includes('failed') || message.includes('Failed') ? 'bg-red-200 text-red-900' :
          'bg-blue-200 text-blue-900'
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
    <div className="bg-gray-100   p-4 mb-4">
      <h2 className="text-lg font-bold mb-2">Search Documents</h2>
      <div className="flex mb-2">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by filename..."
          className="flex-1 p-2 border  "
          onKeyPress={e => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-3 py-2   ml-2"
        >
          Search
        </button>
        <button
          onClick={loadDocuments}
          className="bg-gray-400 text-white px-3 py-2   ml-2"
        >
          Reset
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
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStorageIcon = (storageType) => {
    return storageType === 's3' ? '☁️' : '💾';
  };
  
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold flex items-center">
          📁 My Documents ({documents.length})
          <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
            S3 Storage
          </span>
        </h2>
        <button
          onClick={loadDocuments}
          className="text-blue-700 text-sm border px-3 py-1 rounded-md hover:bg-blue-50"
        >
          🔄 Refresh
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin text-2xl">⏳</div>
          <p className="text-gray-600 mt-2">Loading S3 documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg">
          <div className="text-4xl mb-2">📄</div>
          <p className="text-gray-500 text-base">No documents found</p>
          <p className="text-gray-400 text-xs">Upload your first document to S3 above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map(doc => (
            <div key={doc.id} className="border bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getStorageIcon(doc.storageType || 's3')}</span>
                    <h3 className="font-semibold text-base">{doc.originalName || doc.filename}</h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {docTypes.find(t => t.value === doc.documentType)?.label || doc.documentType} | 
                    {formatFileSize(doc.fileSize)} | 
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                      {doc.status === 'processed' || doc.status === 'active' ? '✅ Ready' :
                       doc.status === 'uploaded' || doc.status === 'pending' ? '⏳ Processing' : '❌ Error'}
                    </span>
                    {doc.s3Key && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                        S3: {doc.s3Key.split('/').pop()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleDownload(doc.id, doc.originalName || doc.filename)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 flex items-center gap-1"
                    title="Download from S3"
                  >
                    ⬇️ Download
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${doc.originalName || doc.filename}"?`)) {
                        handleDelete(doc.id);
                      }
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 flex items-center gap-1"
                    title="Delete from S3"
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

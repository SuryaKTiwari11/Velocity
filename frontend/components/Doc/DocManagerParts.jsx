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
    <div className="bg-gray-100  p-4 mb-4">
      <h2 className="text-lg font-bold mb-2">Upload Document</h2>
      <form onSubmit={handleUpload}>
        <div className="mb-2">
          <label className="block text-sm mb-1">Document Type</label>
          <select
            value={docType}
            onChange={e => setDocType(e.target.value)}
            className="w-full p-2 border "
          >
            {docTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block text-sm mb-1">Choose File</label>
          <input
            type="file"
            onChange={e => setFile(e.target.files[0])}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="w-full p-2 border  "
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-500 text-white py-2   mt-2"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {message && (
        <div className={`mt-2 p-2   text-sm ${
          message.includes('successful') ? 'bg-green-200 text-green-900' :
          message.includes('failed') ? 'bg-red-200 text-red-900' :
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
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <div className="bg-gray-100   p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">My Documents ({documents.length})</h2>
        <button
          onClick={loadDocuments}
          className="text-blue-700 text-sm border px-2 py-1  "
        >
          Refresh
        </button>
      </div>
      {loading ? (
        <div className="text-center py-4">
          <p className="text-gray-600">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500 text-base">No documents found</p>
          <p className="text-gray-400 text-xs">Upload your first document above</p>
        </div>
      ) : (
        <div>
          {documents.map(doc => (
            <div key={doc.id} className="border   p-2 mb-2">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-base">{doc.originalName}</h3>
                  <p className="text-xs text-gray-600">
                    {docTypes.find(t => t.value === doc.documentType)?.label || doc.documentType} | {formatFileSize(doc.fileSize)} | {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                  <span className={`inline-block px-2 py-1   text-xs font-medium ${getStatusColor(doc.status)}`}>
                    {doc.status === 'processed' ? 'Ready' :
                      doc.status === 'uploaded' ? 'Processing' : 'Error'}
                  </span>
                </div>
                <div className="flex ml-2">
                  <button
                    onClick={() => handleDownload(doc.id, doc.originalName)}
                    className="bg-blue-500 text-white px-2 py-1   mr-1"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="bg-red-500 text-white px-2 py-1  "
                  >
                    Delete
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

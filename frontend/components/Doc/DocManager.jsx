import React from 'react';
import useDocumentManager from '../../hook/useDocumentManager.js';
import Bar from './Bar';
import { DocUpload, DocSearch, DocList } from './DocManagerParts.jsx';
import S3HealthCheck from './S3HealthCheck.jsx';

function DocManager() {
  const doc = useDocumentManager();
  if (!doc.user) {
    return (
      <div className="text-center p-8">
        <div className="text-4xl mb-4">🔐</div>
        <p className="text-gray-600">Please log in to access S3 documents</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pt-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center flex items-center justify-center">
          📁 Document Manager
          <span className="ml-3 text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
            ☁️ S3
          </span>
        </h1>
      </div>

      {/* S3 Health Status */}
      <S3HealthCheck />

      {/* Progress Bar */}
      <div className="text-center mb-4">
        {doc.progress > 0 && <Bar progress={doc.progress} />}
      </div>

      <DocUpload
        docType={doc.docType}
        setDocType={doc.setDocType}
        setFile={doc.setFile}
        uploading={doc.uploading}
        handleUpload={doc.handleUpload}
        message={doc.message}
        lastUploadedDocId={doc.lastUploadedDocId}
        user={doc.user}
      />
      <DocSearch
        searchQuery={doc.searchQuery}
        setSearchQuery={doc.setSearchQuery}
        handleSearch={doc.handleSearch}
        loadDocuments={doc.loadDocuments}
      />
      <DocList
        documents={doc.documents}
        loading={doc.loading}
        loadDocuments={doc.loadDocuments}
        handleDownload={doc.handleDownload}
        handleDelete={doc.handleDelete}
      />
    </div>
  );
}

export default DocManager;
     

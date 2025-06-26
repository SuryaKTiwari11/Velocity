import React from 'react';
import useDocumentManager from '../../hook/useDocumentManager.js';
import Bar from './Bar';
import { DocUpload, DocSearch, DocList } from './DocManagerParts.jsx';

function DocManager() {
  const doc = useDocumentManager();
  if (!doc.user) return <div className="text-center p-4">Login to manage documents</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 pt-10">
      <div className="text-center mb-4">{doc.progress > 0 && <Bar progress={doc.progress} />}</div>
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
     

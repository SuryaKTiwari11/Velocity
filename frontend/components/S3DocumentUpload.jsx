import React, { useState } from 'react';
import { s3DocumentApi } from '../src/front2backconnect/api';
import { toast } from 'react-hot-toast';

const S3DocumentUpload = ({ employeeId, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('resume');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const documentTypes = [
    { value: 'resume', label: '📄 Resume/CV' },
    { value: 'certificate', label: '🏆 Certificate' },
    { value: 'id_proof', label: '🆔 ID Proof' },
    { value: 'contract', label: '📋 Contract' },
    { value: 'other', label: '📎 Other' }
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        // Auto-generate title from filename
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile || !title || !employeeId) {
      toast.error('Please select a file and enter a title');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('title', title);
      formData.append('type', type);
      formData.append('employeeId', employeeId);

      // Simulate progress (you can implement real progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      const response = await s3DocumentApi.upload(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.data.ok) {
        toast.success('Document uploaded to S3 successfully! 🎉');
        
        // Reset form
        setSelectedFile(null);
        setTitle('');
        setType('resume');
        setUploadProgress(0);
        
        // Reset file input
        const fileInput = document.getElementById('s3-file-input');
        if (fileInput) fileInput.value = '';
        
        // Callback to parent component
        if (onUploadSuccess) {
          onUploadSuccess(response.data.doc);
        }
      } else {
        throw new Error(response.data.msg || 'Upload failed');
      }
      
    } catch (error) {
      console.error('S3 Upload error:', error);
      toast.error(error.response?.data?.msg || 'Upload failed');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    const icons = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      txt: '📃'
    };
    return icons[extension] || '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          ☁️ Upload to S3 Storage
        </h3>
        <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          Cloud Storage
        </span>
      </div>

      <form onSubmit={handleUpload} className="space-y-4">
        {/* File Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📎 Select Document
          </label>
          <input
            id="s3-file-input"
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
            className="block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-lg file:border-0
                       file:text-sm file:font-medium
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100
                       cursor-pointer"
            disabled={uploading}
          />
          
          {selectedFile && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getFileIcon(selectedFile.name)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Document Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📝 Document Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={uploading}
            required
          />
        </div>

        {/* Document Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🏷️ Document Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={uploading}
          >
            {documentTypes.map(docType => (
              <option key={docType.value} value={docType.value}>
                {docType.label}
              </option>
            ))}
          </select>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Uploading to S3...</span>
              <span className="text-blue-600">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || !selectedFile || !title}
          className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-colors ${
            uploading || !selectedFile || !title
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {uploading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Uploading to S3...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>☁️</span>
              <span>Upload to S3 Storage</span>
            </div>
          )}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <span className="text-blue-500 mt-0.5">ℹ️</span>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">S3 Cloud Storage Benefits:</p>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>Secure cloud storage with AWS S3</li>
              <li>Automatic backup and redundancy</li>
              <li>Faster download speeds</li>
              <li>Unlimited storage capacity</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default S3DocumentUpload;

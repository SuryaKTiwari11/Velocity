import React, { useState, useEffect } from 'react';
import { onboardingApi, s3DocumentApi } from '../../src/front2backconnect/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DocUpload } from '../Doc/DocManagerParts';
import useDocumentManager from '../../hook/useDocumentManager';

const OnboardingPage = () => {
    const [onboardingData, setOnboardingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userDocuments, setUserDocuments] = useState([]);
    const doc = useDocumentManager();

    useEffect(() => {
        fetchOnboardingData();
        fetchUserDocuments();
    }, []);

    const fetchOnboardingData = async () => {
        try {
            const response = await onboardingApi.getData();
            setOnboardingData(response.data);
        } catch (error) {
            console.error('Error fetching onboarding data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDocuments = async () => {
        try {
            const response = await s3DocumentApi.getAll();
            setUserDocuments(response.data.data || []);
        } catch (error) {
            console.error('Error fetching user documents:', error);
        }
    };

    const handleDocumentSubmit = async () => {
        try {
            await onboardingApi.submitDocuments();
            fetchOnboardingData(); // Refresh data
            toast.success('Documents submitted successfully! By submitting, you confirm you have watched the training video. Admin will review them soon.');
        } catch (error) {
            console.error('Error submitting documents:', error);
            toast.error('Error submitting documents. Please try again.');
        }
    };

    const handleUploadSuccess = () => {
        fetchUserDocuments(); // Refresh documents list
        toast.success('Document uploaded successfully!');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Loading onboarding data...</p>
                </div>
            </div>
        );
    }

    if (!onboardingData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">Error loading onboarding data.</p>
                    <button 
                        onClick={fetchOnboardingData}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const { user: userData } = onboardingData;

    if (userData.onboardingStatus === 'approved') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="text-6xl mb-4">🎉</div>
                    <h1 className="text-3xl font-bold text-green-600 mb-4">Welcome to the Team!</h1>
                    <p className="text-gray-600 mb-6">
                        Your onboarding is complete. You now have full access to all features.
                    </p>
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status) => {
        const statusStyles = {
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            uploaded: 'bg-yellow-100 text-yellow-800',
            under_review: 'bg-blue-100 text-blue-800'
        };
        return statusStyles[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
            <div className="max-w-4xl mx-auto px-4">
                
                {/* Progress Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h1 className="text-3xl font-bold text-center mb-6">Employee Onboarding</h1>
                    <div className="flex justify-center items-center space-x-4">
                        <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${userDocuments.length > 0 ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                                📄
                            </div>
                            <span className="ml-2 text-sm">Upload Documents</span>
                        </div>
                        <div className="w-12 h-1 bg-gray-300"></div>
                        <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${userData.isDocumentSubmitted ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                                📋
                            </div>
                            <span className="ml-2 text-sm">Submit for Review</span>
                        </div>
                        <div className="w-12 h-1 bg-gray-300"></div>
                        <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${userData.onboardingStatus === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                                ✅
                            </div>
                            <span className="ml-2 text-sm">Approved</span>
                        </div>
                    </div>
                </div>

                {/* Training Video Section */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-4">📹 Training Video</h2>
                    <div className="mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-semibold text-blue-800 mb-2">Employee Handbook & Training</h3>
                                <p className="text-gray-600 mb-4">
                                    Please watch our training video to understand company policies, procedures, and guidelines.
                                </p>
                            </div>
                            
                            {/* YouTube Video Embed */}
                            <div className="relative w-full max-w-4xl mx-auto">
                                <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-lg">
                                    <iframe
                                        className="absolute top-0 left-0 w-full h-full"
                                        src="https://www.youtube.com/embed/kcckpWgkhP0?si=UzJSwrKmv_F7OLIK"
                                        title="Employee Training Video"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                            
                            <div className="text-center mt-6">
                                <p className="text-sm text-gray-500">
                                    By uploading documents below, you confirm that you have watched the training video.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Document Upload Section */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-4">📁 Document Upload</h2>
                    <div className="text-center mb-6">
                        <div className="text-blue-500 text-4xl mb-4">📁</div>
                        <h3 className="text-lg font-semibold mb-4">Upload Your Documents</h3>
                        <p className="text-gray-600 mb-6">
                            Please upload your documents for verification. Admin will review them soon.
                        </p>
                    </div>
                    
                    {/* Use the same upload component as document manager */}
                    <DocUpload
                        docType={doc.docType}
                        setDocType={doc.setDocType}
                        setFile={doc.setFile}
                        uploading={doc.uploading}
                        handleUpload={async (e) => {
                            await doc.handleUpload(e);
                            handleUploadSuccess();
                        }}
                        message={doc.message}
                        user={doc.user}
                    />
                </div>

                {/* My Documents Section */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-4">📋 My Submitted Documents</h2>
                    {userDocuments.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            {userDocuments.map((doc) => (
                                <div key={doc.id} className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <h5 className="font-medium">{doc.title}</h5>
                                        <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(doc.status)}`}>
                                            {doc.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">Type: {doc.type}</p>
                                    <p className="text-xs text-gray-500 mb-3">
                                        Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm flex items-center gap-1"
                                            onClick={async () => {
                                                try {
                                                    const res = await s3DocumentApi.getDownloadUrl(doc.id);
                                                    window.open(res.data.downloadUrl, '_blank');
                                                } catch (error) {
                                                    console.error('Preview error:', error);
                                                    toast.error('Failed to get download link.');
                                                }
                                            }}
                                        >
                                            📄 Preview
                                        </button>
                                        {!userData.isDocumentSubmitted && (
                                            <button
                                                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm flex items-center gap-1"
                                                onClick={async () => {
                                                    if (window.confirm(`Are you sure you want to delete "${doc.title}"?`)) {
                                                        try {
                                                            await s3DocumentApi.delete(doc.id);
                                                            toast.success('Document deleted successfully!');
                                                            fetchUserDocuments(); // Refresh the list
                                                        } catch (error) {
                                                            console.error('Delete error:', error);
                                                            toast.error('Failed to delete document.');
                                                        }
                                                    }
                                                }}
                                            >
                                                🗑️ Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <div className="text-4xl mb-2">📄</div>
                            <p>No documents uploaded yet</p>
                        </div>
                    )}

                    {/* Submit Documents Button */}
                    {userDocuments.length > 0 && !userData.isDocumentSubmitted && (
                        <div className="text-center">
                            <button
                                onClick={handleDocumentSubmit}
                                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                🚀 Submit Documents for Review
                            </button>
                            <p className="text-sm text-gray-500 mt-2">
                                By submitting, you confirm you have watched the training video
                            </p>
                        </div>
                    )}

                    {userData.isDocumentSubmitted && (
                        <div className="text-center">
                            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                                <span className="mr-2">📋</span>
                                Documents submitted and under review
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingPage;
import React, { useState, useEffect } from 'react';
import TrainingVideoPlayer from './TrainingVideoPlayer';
import OnboardingProgress from './OnboardingProgress';
import { onboardingApi, s3DocumentApi } from '../../src/front2backconnect/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OnboardingPage = () => {
    const [onboardingData, setOnboardingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [completedVideos, setCompletedVideos] = useState(new Set());
    const [userDocuments, setUserDocuments] = useState([]);

    // Restore progress from localStorage on mount, but prefer backend if onboarding is complete
    useEffect(() => {
        const saved = localStorage.getItem('onboardingProgress');
        if (saved) {
            const { completedVideos, currentVideoIndex } = JSON.parse(saved);
            setCompletedVideos(new Set(completedVideos));
            setCurrentVideoIndex(currentVideoIndex);
        }
        fetchOnboardingData();
        fetchUserDocuments();
    }, []);

    // When onboardingData loads, if no localStorage, set state from backend
    useEffect(() => {
        if (onboardingData) {
            const saved = localStorage.getItem('onboardingProgress');
            if (!saved) {
                // Set completed videos from progress data
                const completed = new Set(
                    onboardingData.progressData
                        ? onboardingData.progressData.filter(p => p.isCompleted).map(p => p.videoId)
                        : []
                );
                setCompletedVideos(completed);
                // Find current video index
                const nextVideoIndex = onboardingData.trainingVideos
                    ? onboardingData.trainingVideos.findIndex(video => !completed.has(video.id))
                    : 0;
                setCurrentVideoIndex(nextVideoIndex === -1 ? 0 : nextVideoIndex);
            }
        }
    }, [onboardingData]);

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
        setUserDocuments(response.data.data || []); // Use response.data.data
    } catch (error) {
        console.error('Error fetching user documents:', error);
    }
    };

    const handleVideoComplete = async (videoId) => {
        // Mark video as completed locally
        setCompletedVideos(prev => {
            const updated = new Set([...prev, videoId]);
            localStorage.setItem('onboardingProgress', JSON.stringify({
                completedVideos: Array.from(updated),
                currentVideoIndex: currentVideoIndex + 1,
                trainingProgress: onboardingData.trainingProgress
            }));
            return updated;
        });
        // Move to next video
        const nextIndex = currentVideoIndex + 1;
        if (nextIndex < onboardingData.trainingVideos.length) {
            setCurrentVideoIndex(nextIndex);
        }
        // Refresh data to check if training is complete
        setTimeout(fetchOnboardingData, 1000);
    };

    // Save progress to localStorage whenever progress changes (except when onboarding is complete)
    useEffect(() => {
        if (onboardingData && onboardingData.user?.onboardingStatus !== 'approved') {
            localStorage.setItem('onboardingProgress', JSON.stringify({
                completedVideos: Array.from(completedVideos),
                currentVideoIndex,
                trainingProgress: onboardingData.trainingProgress
            }));
        }
    }, [completedVideos, currentVideoIndex, onboardingData]);

    const handleDocumentSubmit = async () => {
        try {
            await onboardingApi.submitDocuments();
            fetchOnboardingData(); // Refresh data
            toast.success('Documents submitted successfully! Admin will review them soon.');
        } catch (error) {
            console.error('Error submitting documents:', error);
            toast.error('Error submitting documents. Please try again.');
        }
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

    const { user: userData, trainingVideos, trainingProgress } = onboardingData;

    if (userData.onboardingStatus === 'approved') {
        // Clear localStorage when onboarding is complete
        localStorage.removeItem('onboardingProgress');
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

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
            <div className="max-w-4xl mx-auto px-4">
                <OnboardingProgress 
                    isTrainingCompleted={userData.isTrainingVideoDone}
                    isDocumentSubmitted={userData.isDocumentSubmitted}
                    isDocumentsApproved={userData.isDocumentsApproved}
                />

                {/* Training Section with YouTube Video and Disclaimer */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-4">Training Video</h2>
                    <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Progress</span>
                            <span>{trainingProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                                className="h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                                style={{ width: `${trainingProgress}%` }}
                            />
                        </div>
                    </div>

                    {/* Hardcoded YouTube video for onboarding */}
                    <div className="mb-6">
                        <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                            <iframe
                                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                                title="Onboarding Training Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute top-0 left-0 w-full h-full rounded"
                            />
                        </div>
                    </div>
                    {/* Disclaimer and Confirm Button */}
                    <div className="mb-4">
                        <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-2">
                            <strong>Disclaimer:</strong> Please watch the training video above. Once completed, document upload will be unlocked automatically. By uploading your documents, you confirm you have finished the training video.
                        </div>
                        {userData.isTrainingVideoDone && (
                            <div className="text-green-600 font-semibold text-center mt-2">You have watched the video. Document upload is now unlocked.</div>
                        )}
                    </div>
                </div>

                {/* Document Upload Section (unchanged) */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Document Upload</h2>
                    {/* Always show document upload and uploaded documents */}
                    <div className="py-8">
                        <div className="text-center mb-6">
                            <div className="text-blue-500 text-4xl mb-4">📁</div>
                            <h3 className="text-lg font-semibold mb-4">Ready to Upload Documents</h3>
                            <p className="text-gray-600 mb-6">
                                Please upload your documents for verification. Admin will review them soon.
                            </p>
                        </div>
                        {/* Document upload modal */}
                        <form
                            className="mb-6 flex flex-col items-center"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                try {
                                await s3DocumentApi.upload(formData);
                                await onboardingApi.submitDocuments();
                                await fetchUserDocuments(); // Always refresh after upload
                                e.target.reset();
                                toast.success('Document uploaded and submitted for admin review!');
                                } catch (error) {
                                    toast.error('Error uploading document. Please try again.');
                                }
                            }}
                        >
                            <input
                                type="file"
                                name="document"
                                required
                                className="mb-2"
                            />
                            <input
                                type="text"
                                name="title"
                                placeholder="Document Title"
                                className="mb-2 px-2 py-1 border rounded"
                                required
                            />
                            <select
                                name="type"
                                className="mb-2 px-2 py-1 border rounded"
                                required
                            >
                                <option value="">Select Document Type</option>
                                <option value="resume">Resume</option>
                                <option value="address_proof">Address Proof</option>
                                <option value="other">Other</option>
                            </select>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                📁 Upload Document
                            </button>
                        </form>
                    </div>
                </div>

                {/* My Documents Section */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">My Submitted Documents</h2>
                    {userDocuments.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-4">
                            {userDocuments.map((doc) => (
                                <div key={doc.id} className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <h5 className="font-medium">{doc.title}</h5>
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {doc.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">{doc.type}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                    </p>
                                    {doc.reviewNotes && (
                                        <p className="text-xs text-gray-700 mt-2 italic">
                                            Admin notes: {doc.reviewNotes}
                                        </p>
                                    )}
                                    <button
                                        className="mt-3 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
                                        onClick={async () => {
                                            try {
                                                const res = await s3DocumentApi.getDownloadUrl(doc.id);
                                                const url = res.data && res.data.downloadUrl;
                                                if (!url) {
                                                    toast.error('No download link received. Please contact support or try again later.');
                                                    return;
                                                }
                                                if (doc.mimeType && doc.mimeType.startsWith('image/')) {
                                                    window.open(url, '_blank');
                                                } else {
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = doc.originalName || doc.filename;
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    document.body.removeChild(a);
                                                }
                                            } catch (err) {
                                                toast.error('Failed to get download link.');
                                            }
                                        }}
                                    >
                                        {doc.mimeType && doc.mimeType.startsWith('image/') ? 'Preview' : 'Download'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No documents submitted yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
export default OnboardingPage;

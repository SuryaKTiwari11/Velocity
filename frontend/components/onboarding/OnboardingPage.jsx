import React, { useState, useEffect } from 'react';
import TrainingVideoPlayer from './TrainingVideoPlayer';
import OnboardingProgress from './OnboardingProgress';
import { onboardingApi, s3DocumentApi } from '../../src/front2backconnect/api';

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
            setUserDocuments(response.data.documents || []);
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
            alert('Documents submitted successfully! Admin will review them soon.');
        } catch (error) {
            console.error('Error submitting documents:', error);
            alert('Error submitting documents. Please try again.');
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
            <div className="max-w-4xl mx-auto px-4">
                <OnboardingProgress 
                    isTrainingCompleted={userData.isTrainingVideoDone}
                    isDocumentSubmitted={userData.isDocumentSubmitted}
                    isDocumentsApproved={userData.isDocumentsApproved}
                />

                {/* Training Section */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-4">Training Videos</h2>
                    <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Overall Progress</span>
                            <span>{trainingProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                                className="h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                                style={{ width: `${trainingProgress}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {trainingVideos.map((video, index) => (
                            <TrainingVideoPlayer
                                key={video.id}
                                video={video}
                                onComplete={handleVideoComplete}
                                isUnlocked={index <= currentVideoIndex || completedVideos.has(video.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Document Upload Section */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Document Upload</h2>
                    
                    {!userData.isTrainingVideoDone ? (
                        <div className="text-center py-8">
                            <div className="text-gray-400 text-4xl mb-4">🔒</div>
                            <p className="text-gray-600">Complete all training videos to unlock document upload</p>
                        </div>
                    ) : userData.isDocumentSubmitted ? (
                        <div className="py-8">
                            <div className="text-center mb-6">
                                <div className="text-green-500 text-4xl mb-4">📋</div>
                                <h3 className="text-lg font-semibold text-green-600 mb-2">Documents Submitted!</h3>
                                <p className="text-gray-600">Your documents are under admin review.</p>
                                {userData.onboardingStatus === 'rejected' && (
                                    <p className="text-red-600 mt-2">Some documents were rejected. Please check your email for details.</p>
                                )}
                            </div>
                            
                            {/* Show uploaded documents */}
                            {userDocuments.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3">Your Uploaded Documents:</h4>
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
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-8">
                            <div className="text-center mb-6">
                                <div className="text-blue-500 text-4xl mb-4">📤</div>
                                <h3 className="text-lg font-semibold mb-4">Ready to Upload Documents</h3>
                                <p className="text-gray-600 mb-6">
                                    Great job completing the training! Now please upload your documents for verification.
                                </p>
                            </div>
                            
                            {/* Show any existing documents */}
                            {userDocuments.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-semibold mb-3">Your Documents:</h4>
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
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div className="space-y-4">
                                <button 
                                    onClick={() => window.location.href = '/documents'}
                                    className="block w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    📁 Upload Documents
                                </button>
                                {userDocuments.length > 0 && (
                                    <button 
                                        onClick={handleDocumentSubmit}
                                        className="block w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                        ✅ Submit Documents for Review
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingPage;

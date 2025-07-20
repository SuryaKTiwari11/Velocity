import React, { useState, useEffect, useCallback } from 'react';

const TrainingVideoPlayer = ({ video, onComplete, isUnlocked = true }) => {
    // Defensive: ensure video is always an object
    const safeVideo = video || {};
    const [isCompleted, setIsCompleted] = useState(false);
    const [watchTime, setWatchTime] = useState(0);

    const handleVideoComplete = useCallback(() => {
        if (!isCompleted) {
            setIsCompleted(true);
            onComplete(video.id);
        }
    }, [isCompleted, onComplete, video.id]);

    // Simulate video watching for demo purposes
    useEffect(() => {
        if (isUnlocked && !isCompleted && typeof safeVideo.duration === 'number') {
            const interval = setInterval(() => {
                setWatchTime(prev => {
                    const newTime = prev + 1;
                    if (newTime >= safeVideo.duration) {
                        handleVideoComplete();
                        clearInterval(interval);
                        return safeVideo.duration;
                    }
                    return newTime;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isUnlocked, isCompleted, safeVideo.duration, handleVideoComplete]);

    const progress = safeVideo.duration ? Math.min((watchTime / safeVideo.duration) * 100, 100) : 0;

    if (!isUnlocked) {
        return (
            <div className="bg-gray-100 p-4 rounded-lg">
                <div className="text-center">
                    <div className="text-gray-500 mb-2">🔒 Locked</div>
                    <h3 className="font-semibold text-gray-700">{safeVideo.title || 'Locked Video'}</h3>
                    <p className="text-sm text-gray-500">Complete previous videos to unlock</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3">{safeVideo.title || 'Untitled Video'}</h3>
            {/* YouTube Embed */}
            <div className="relative mb-4" style={{ paddingBottom: '56.25%', height: 0 }}>
                {safeVideo.youtubeId ? (
                    <iframe
                        src={`https://www.youtube.com/embed/${safeVideo.youtubeId}?enablejsapi=1`}
                        title={safeVideo.title || 'Video'}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full rounded"
                    />
                ) : (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-gray-400">
                        No video available
                    </div>
                )}
            </div>
            {/* Progress Bar */}
            <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
            {/* Status */}
            <div className="text-center">
                {isCompleted ? (
                    <div className="text-green-600 font-medium">✅ Completed</div>
                ) : (
                    <div className="text-blue-600">📺 Watching...</div>
                )}
            </div>
        </div>
    );
};

export default TrainingVideoPlayer;
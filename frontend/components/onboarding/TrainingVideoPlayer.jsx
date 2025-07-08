import React, { useState, useEffect, useCallback } from 'react';

const TrainingVideoPlayer = ({ video, onComplete, isUnlocked = true }) => {
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
        if (isUnlocked && !isCompleted) {
            const interval = setInterval(() => {
                setWatchTime(prev => {
                    const newTime = prev + 1;
                    if (newTime >= video.duration) {
                        handleVideoComplete();
                        clearInterval(interval);
                        return video.duration;
                    }
                    return newTime;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isUnlocked, isCompleted, video.duration, handleVideoComplete]);

    const progress = Math.min((watchTime / video.duration) * 100, 100);

    if (!isUnlocked) {
        return (
            <div className="bg-gray-100 p-4 rounded-lg">
                <div className="text-center">
                    <div className="text-gray-500 mb-2">🔒 Locked</div>
                    <h3 className="font-semibold text-gray-700">{video.title}</h3>
                    <p className="text-sm text-gray-500">Complete previous videos to unlock</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3">{video.title}</h3>
            
            {/* YouTube Embed */}
            <div className="relative mb-4" style={{ paddingBottom: '56.25%', height: 0 }}>
                <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}?enablejsapi=1`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full rounded"
                />
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
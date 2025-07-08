import { VideoProgress, User, S3Document } from "../model/model.js";

// Predefined training videos
const TRAINING_VIDEOS = [
    { id: "video1", title: "Company Introduction", duration: 300, youtubeId: "dQw4w9WgXcQ" },
    { id: "video2", title: "Safety Guidelines", duration: 450, youtubeId: "dQw4w9WgXcQ" },
    { id: "video3", title: "HR Policies", duration: 600, youtubeId: "dQw4w9WgXcQ" },
    { id: "video4", title: "Code of Conduct", duration: 400, youtubeId: "dQw4w9WgXcQ" }
];

export const getOnBoardingData = async (req, res) => {
    try {
        const { userId } = req.user;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        const user = await User.findByPk(userId);
        const progressData = await VideoProgress.findAll({ where: { userId } });
        const documents = await S3Document.findAll({ where: { userId } });

        // Calculate overall progress
        const completedVideos = progressData.filter(p => p.isCompleted).length;
        const trainingProgress = (completedVideos / TRAINING_VIDEOS.length) * 100;

        res.status(200).json({ 
            user: {
                onboardingStatus: user.onboardingStatus,
                isTrainingVideoDone: user.isTrainingVideoDone,
                isDocumentSubmitted: user.isDocumentSubmitted,
                isDocumentsApproved: user.isDocumentsApproved
            },
            progressData,
            documents,
            trainingVideos: TRAINING_VIDEOS,
            trainingProgress: Math.round(trainingProgress)
        });
    } catch (error) {
        console.error("Error fetching onboarding data:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const trainingStatus = async (req, res) => {
    try {
        const { userId } = req.user;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        const progressData = await VideoProgress.findAll({ where: { userId } });
        const completedVideos = progressData.filter(p => p.isCompleted);
        const isTrainingCompleted = completedVideos.length >= TRAINING_VIDEOS.length;
        
        // Update user status if training is completed
        if (isTrainingCompleted) {
            await User.update(
                { 
                    isTrainingVideoDone: true,
                    onboardingStatus: 'document_submission'
                },
                { where: { id: userId } }
            );
        }

        res.status(200).json({ 
            isTrainingCompleted,
            completedCount: completedVideos.length,
            totalVideos: TRAINING_VIDEOS.length,
            progress: Math.round((completedVideos.length / TRAINING_VIDEOS.length) * 100)
        });
    } catch (error) {
        console.error("Error fetching training status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const trackVideoProgress = async (req, res) => {
    try {
        const { userId } = req.user;
        const { videoId, watchedDuration, totalDuration, isCompleted } = req.body;

        if (!userId || !videoId) {
            return res.status(400).json({ message: "User ID and video ID are required" });
        }

        const [progress, created] = await VideoProgress.upsert({
            userId,
            videoId,
            watchedDuration: watchedDuration || 0,
            totalDuration: totalDuration || 0,
            isCompleted: isCompleted || false,
            watchedAt: new Date()
        });

        res.status(200).json({ 
            message: "Video progress updated", 
            progress,
            created
        });
    } catch (error) {
        console.error("Error tracking video progress:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const submitDocuments = async (req, res) => {
    try {
        const { userId } = req.user;
        
        // Check if training is completed
        const user = await User.findByPk(userId);
        if (!user.isTrainingVideoDone) {
            return res.status(400).json({ 
                message: "Please complete training videos before submitting documents" 
            });
        }

        // Check if user has uploaded at least one document
        const userDocuments = await S3Document.findAll({ where: { userId } });
        if (userDocuments.length === 0) {
            return res.status(400).json({ 
                message: "Please upload at least one document before submitting for review" 
            });
        }

        // Update user status to document submission
        await User.update(
            { 
                isDocumentSubmitted: true,
                onboardingStatus: 'under_review'
            },
            { where: { id: userId } }
        );

        res.status(200).json({ 
            message: "Documents submitted successfully. Admin will review them soon.",
            documentsCount: userDocuments.length
        });
    } catch (error) {
        console.error("Error submitting documents:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getVerificationQueue = async (req, res) => {
    try {
        const { isAdmin } = req.user;
        if (!isAdmin) {
            return res.status(403).json({ message: "Admin access required" });
        }

        const pendingUsers = await User.findAll({
            where: {
                onboardingStatus: 'under_review'
            },
            attributes: ['id', 'name', 'email', 'onboardingStatus', 'isTrainingVideoDone', 'createdAt'],
            include: [{
                model: S3Document,
                attributes: ['id', 'title', 'type', 'status', 'uploadedAt']
            }],
            order: [['createdAt', 'ASC']]
        });

        res.status(200).json({ pendingUsers });
    } catch (error) {
        console.error("Error fetching verification queue:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const verifyUserDocuments = async (req, res) => {
    try {
        const { isAdmin, userId: adminId } = req.user;
        const { userId } = req.params;
        const { action, notes } = req.body; // action: 'approve' or 'reject'

        if (!isAdmin) {
            return res.status(403).json({ message: "Admin access required" });
        }

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ message: "Action must be 'approve' or 'reject'" });
        }

        // Update user documents
        await S3Document.update(
            {
                status: action === 'approve' ? 'approved' : 'rejected',
                reviewedBy: adminId,
                reviewNotes: notes || '',
                reviewedAt: new Date()
            },
            { where: { userId } }
        );

        // Update user status
        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        await User.update(
            {
                onboardingStatus: newStatus,
                isDocumentsApproved: action === 'approve'
            },
            { where: { id: userId } }
        );

        res.status(200).json({ 
            message: `User documents ${action}d successfully`,
            action,
            userId
        });
    } catch (error) {
        console.error("Error verifying user documents:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
import { User, S3Document } from "../model/model.js";


export const getOnBoardingData = async (req, res) => {
  try {
    const userId = req.user?.id;
    const companyId = req.user?.companyId;
    if (!userId || !companyId) {
      return res
        .status(400)
        .json({ message: "User ID and company ID are required" });
    }

    const user = await User.findOne({ where: { id: userId, companyId } });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found for this company" });
    }
 
    const documents = await S3Document.findAll({
      where: { userId, companyId },
    });

  
    res.status(200).json({
      user: {
        onboardingStatus: user.onboardingStatus,
        isDocumentSubmitted: user.isDocumentSubmitted,
        isDocumentsApproved: user.isDocumentsApproved,
      },
      documents,
    });
  } catch (error) {
    console.error("Error fetching onboarding data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const submitDocuments = async (req, res) => {
  try {
    const userId = req.user?.id;
    const companyId = req.user?.companyId;
    if (!userId || !companyId) {
      return res
        .status(400)
        .json({ message: "User ID and company ID are required" });
    }

    // Remove training completion check
    const user = await User.findOne({ where: { id: userId, companyId } });

    // Check if user has uploaded at least one document
    const userDocuments = await S3Document.findAll({
      where: { userId, companyId },
    });
    if (userDocuments.length === 0) {
      return res.status(400).json({
        message:
          "Please upload at least one document before submitting for review",
      });
    }

    // Update user status to document submission
    await User.update(
      {
        isDocumentSubmitted: true,
        onboardingStatus: "under_review",
      },
      { where: { id: userId, companyId } }
    );

    res.status(200).json({
      message: "Documents submitted successfully. Admin will review them soon.",
      documentsCount: userDocuments.length,
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
        onboardingStatus: "under_review",
      },
      attributes: [
        "id",
        "name",
        "email",
        "onboardingStatus",
        "createdAt",
      ],
      include: [
        {
          model: S3Document,
          attributes: ["id", "title", "type", "status", "uploadedAt"],
        },
      ],
      order: [["createdAt", "ASC"]],
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

    if (!["approve", "reject"].includes(action)) {
      return res
        .status(400)
        .json({ message: "Action must be 'approve' or 'reject'" });
    }

    // Update user documents
    await S3Document.update(
      {
        status: action === "approve" ? "approved" : "rejected",
        reviewedBy: adminId,
        reviewNotes: notes || "",
        reviewedAt: new Date(),
      },
      { where: { userId } }
    );

    // Update user status
    const newStatus = action === "approve" ? "approved" : "rejected";
    await User.update(
      {
        onboardingStatus: newStatus,
        isDocumentsApproved: action === "approve",
      },
      { where: { id: userId } }
    );

    res.status(200).json({
      message: `User documents ${action}d successfully`,
      action,
      userId,
    });
  } catch (error) {
    console.error("Error verifying user documents:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

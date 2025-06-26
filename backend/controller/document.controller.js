import path from "path";
import { Document } from "../model/model.js";
import { documentQueue } from "../queues/simple.js";
// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const document = await Document.findByPk(docId);
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }
    // Only allow owner to delete
    if (document.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    // Remove file from disk
    try {
      if (document.filePath) {
        const fs = await import("fs-extra");
        await fs.unlink(document.filePath).catch(() => {}); // Ignore if file missing
      }
    } catch {}
    await document.destroy();
    res.json({ success: true, message: "Document deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

// Upload document - Student-friendly with async processing
export const uploadDocument = async (req, res) => {
  try {
    const { documentType } = req.body;
    const file = req.file;
    const userId = req.user.id;

    if (!file || !documentType) {
      return res.status(400).json({
        success: false,
        message: "File and document type are required",
      });
    }

   
    const document = await Document.create({
      userId,
      originalName: file.originalname,
      fileName: file.filename,
      fileSize: file.size,
      mimeType: file.mimetype,
      documentType,
      filePath: file.path,
      status: "uploaded",
    });

    await documentQueue.add("process-document", {
      documentId: document.id,
      filePath: file.path,
      fileName: file.filename,
      userId: userId,
    });

    res.json({
      success: true,
      message: "Document uploaded successfully",
      document: {
        id: document.id,
        name: document.originalName,
        type: document.documentType,
        status: document.status,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
    });
  }
};


export const listDocuments = async (req, res) => {
  try {
    const { userId } = req.params;

    const documents = await Document.findAll({
      where: { userId },
      attributes: [
        "id",
        "originalName",
        "documentType",
        "fileSize",
        "status",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("List documents error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
    });
  }
};


export const downloadDocument = async (req, res) => {
  try {
    const { docId } = req.params;

    const document = await Document.findByPk(docId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

 if (document.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

  
    res.download(document.filePath, document.originalName);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({
      success: false,
      message: "Download failed",
    });
  }
};

export const searchDocuments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
    }

    const documents = await Document.findAll({
      where: {
        userId,
        originalName: {
          [Document.sequelize.Sequelize.Op.iLike]: `%${q.trim()}%`,
        },
      },
      attributes: [
        "id",
        "originalName",
        "documentType",
        "fileSize",
        "status",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      documents,
      query: q,
      count: documents.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
};

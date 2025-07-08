import { Document } from "../models/document.model.js";
import { Op } from "sequelize";
//!LEGACY FILE 
// List all documents for the logged-in user
export const listDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const documents = await Document.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, documents });
  } catch (error) {
    console.error("List error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to list documents" });
  }
};

// Download a document by ID (only if owned by user)
export const downloadDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const document = await Document.findByPk(docId);

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }
    if (document.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.download(document.filePath, document.originalName);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ success: false, message: "Download failed" });
  }
};

// Search documents by name or type for the logged-in user
export const searchDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { q } = req.query;
    if (!q) {
      return res
        .status(400)
        .json({ success: false, message: "Search query required" });
    }

    const documents = await Document.findAll({
      where: {
        userId,
        [Op.or]: [
          { originalName: { [Op.iLike]: `%${q}%` } },
          { documentType: { [Op.iLike]: `%${q}%` } },
        ],
      },
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, documents });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: "Search failed" });
  }
};
export const deleteDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const document = await Document.findByPk(docId);

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }
    if (document.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await document.destroy();
    res.json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

import { Document } from "../model/model.js";
import { documentQueue } from "../queues/simple.js";
import { logAction, logLogin } from "../model/audit.js"; // Import logging functions

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

    // Log the upload action
    await logAction(
      userId,
      "UPLOAD",
      "Document",
      document.id,
      null,
      {
        originalName: file.originalname,
        documentType,
        fileSize: file.size,
        status: "uploaded",
      },
      req
    );

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

    try {
      if (document.filePath) {
        const fs = await import("fs-extra");
        await fs.unlink(document.filePath).catch(() => {});
      }
    } catch {}

    const oldData = {
      originalName: document.originalName,
      documentType: document.documentType,
      fileSize: document.fileSize,
      status: document.status,
    };

    await document.destroy();

    // Log the delete action
    await logAction(
      req.user.id,
      "DELETE",
      "Document",
      docId,
      oldData,
      null,
      req
    );

    res.json({ success: true, message: "Document deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

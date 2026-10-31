import File from "../models/File.js";
import cloudinary from "../config/cloudinary.js";

// ===============================
// Upload File
// ===============================
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const file = await File.create({
      user: req.user.id,
      fileName: req.file.originalname,
      fileUrl: req.file.path,
      publicId: req.file.filename,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      file,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "File upload failed",
    });
  }
};

// ===============================
// Get All Files
// ===============================
export const getFiles = async (req, res) => {
  try {
    const files = await File.find({
      user: req.user.id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: files.length,
      files,
    });
  } catch (error) {
    console.error("GET FILES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Download File
// ===============================
export const downloadFile = async (req, res) => {
  try {
    // Find file in MongoDB
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Verify file ownership
    if (file.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Fetch file from Cloudinary
    const cloudinaryResponse = await fetch(file.fileUrl);

    if (!cloudinaryResponse.ok || !cloudinaryResponse.body) {
      console.error(
        "Cloudinary response:",
        cloudinaryResponse.status,
        cloudinaryResponse.statusText
      );

      return res.status(502).json({
        success: false,
        message: "Unable to retrieve file from Cloudinary",
      });
    }

    // Set file content type
    res.setHeader(
      "Content-Type",
      cloudinaryResponse.headers.get("content-type") ||
        file.fileType ||
        "application/octet-stream"
    );

    // Set download filename
    const safeFileName = file.fileName.replace(/["\\]/g, "_");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeFileName}"`
    );

    // Stream Cloudinary file to browser
    const { Readable } = await import("node:stream");

    Readable.fromWeb(cloudinaryResponse.body).pipe(res);
  } catch (error) {
    console.error("DOWNLOAD ERROR:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Unable to download file",
      });
    }

    res.end();
  }
};

// ===============================
// Delete File
// ===============================
export const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Verify file ownership
    if (file.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Determine Cloudinary resource type
    let resourceType = "image";

    if (
      file.fileType.startsWith("application/") ||
      file.fileType.startsWith("text/")
    ) {
      resourceType = "raw";
    }

    // Delete file from Cloudinary
    await cloudinary.uploader.destroy(file.publicId, {
      resource_type: resourceType,
    });

    // Delete file from MongoDB
    await file.deleteOne();

    return res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("DELETE FILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete file",
    });
  }
};
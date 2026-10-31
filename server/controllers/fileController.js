
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
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Check file ownership
    if (file.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Fetch the file from Cloudinary
    const cloudinaryResponse = await fetch(file.fileUrl);

    if (!cloudinaryResponse.ok || !cloudinaryResponse.body) {
      console.error("Cloudinary error:", cloudinaryResponse.status);

      return res.status(502).json({
        success: false,
        message: "Could not retrieve file from Cloudinary",
      });
    }

    // Set download headers
    res.setHeader(
      "Content-Type",
      cloudinaryResponse.headers.get("content-type") ||
        file.fileType ||
        "application/octet-stream"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.fileName.replace(/"/g, "")}"`
    );

    // Stream file to browser
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
  }
};

    // Determine Cloudinary resource type
    let resourceType = "image";

    if (
      file.fileType.startsWith("application/") ||
      file.fileType.startsWith("text/")
    ) {
      resourceType = "raw";
    }

    // Generate signed Cloudinary download URL
    const extension = file.fileName.split(".").pop();

    const downloadUrl =
      cloudinary.utils.private_download_url(
        file.publicId,
        extension,
        {
          resource_type: resourceType,
          type: "upload",
        }
      );

    // Redirect to signed download URL
    return res.redirect(downloadUrl);

  } catch (error) {
    console.error("DOWNLOAD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to download file",
    });
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

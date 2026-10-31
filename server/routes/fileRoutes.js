
import express from "express";

import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
  uploadFile,
  getFiles,
  downloadFile,
  deleteFile,
} from "../controllers/fileController.js";

const router = express.Router();

// ===============================
// Upload File
// ===============================
router.post(
  "/upload",
  protect,
  upload.single("file"),
  uploadFile
);

// ===============================
// Get All Files of Logged-in User
// ===============================
router.get(
  "/",
  protect,
  getFiles
);

// ===============================
// Download File
// ===============================
router.get(
  "/:id/download",
  protect,
  downloadFile
);

// ===============================
// Delete File
// ===============================
router.delete(
  "/:id",
  protect,
  deleteFile
);

export default router;

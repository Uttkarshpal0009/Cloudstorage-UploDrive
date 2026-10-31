import {
  FaFileAlt,
  FaFilePdf,
  FaFileImage,
  FaDownload,
  FaTrash,
  FaEye,
} from "react-icons/fa";

import api from "../services/api";

function FileCard({ file, onDelete }) {
  const formatSize = (size) => {
    if (!size) return "0 B";

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isImage = file.fileType?.startsWith("image/");
  const isPdf = file.fileType === "application/pdf";

  // ===============================
  // Download File
  // ===============================
  const handleDownload = async () => {
    try {
      // Use shared Axios instance:
      // - Uses VITE_API_URL
      // - Adds the Bearer token automatically
      const response = await api.get(
        `/files/${file._id}/download`,
        {
          responseType: "blob",
        }
      );

      // Convert response into a downloadable Blob
      const blob = new Blob([response.data], {
        type: file.fileType || "application/octet-stream",
      });

      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = file.fileName || "download";

      document.body.appendChild(link);
      link.click();
      link.remove();

      // Release temporary URL after browser starts download
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 1000);
    } catch (error) {
      console.error("Download error:", error);

      let message = "Unable to download file";

      if (error.response) {
        message = `Download failed: ${error.response.status}`;

        if (error.response.data instanceof Blob) {
          try {
            const errorText = await error.response.data.text();
            const errorData = JSON.parse(errorText);

            message = errorData.message || message;
          } catch {
            // Keep default error message
          }
        }
      } else if (error.message) {
        message = error.message;
      }

      alert(message);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-blue-500/20 bg-slate-900/70 backdrop-blur-md p-4 sm:p-5 shadow-lg hover:border-blue-400 transition-all duration-300">
      <div className="flex flex-col gap-5">
        {/* File Info */}
        <div className="flex items-start gap-4 w-full">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500">
            {isPdf ? (
              <FaFilePdf className="text-2xl text-white" />
            ) : isImage ? (
              <FaFileImage className="text-2xl text-white" />
            ) : (
              <FaFileAlt className="text-2xl text-white" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="break-all text-lg font-semibold text-white">
              {file.fileName}
            </h3>

            <p className="mt-1 text-sm text-blue-200">
              {formatSize(file.fileSize)}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Preview */}
          <a
            href={file.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-500"
          >
            <FaEye />
            Preview
          </a>

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-medium text-white transition hover:bg-green-500"
          >
            <FaDownload />
            Download
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => onDelete(file._id)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-medium text-white transition hover:bg-red-500"
          >
            <FaTrash />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default FileCard;
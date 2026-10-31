import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UploadForm from "../components/UploadForm";
import FileCard from "../components/FileCard";
import {
  uploadFile,
  getFiles,
  deleteFile,
} from "../services/fileService";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    try {
      const data = await getFiles();
      setFiles(data.files || []);
    } catch (e) {
      alert(e.response?.data?.message || "Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (selectedFile) => {
    const formData = new FormData();
    formData.append("file", selectedFile);

    await uploadFile(formData);
    fetchFiles();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this file?")) return;

    await deleteFile(id);
    fetchFiles();
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-black via-slate-950 to-blue-950 text-white">

      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-blue-600/20 blur-[180px] rounded-full"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-cyan-500/20 blur-[180px] rounded-full"></div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-black/30 border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 lg:px-10 py-5">

          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-300 via-blue-400 to-blue-600 bg-clip-text text-transparent">
              UploDrive
            </h1>

            <p className="text-blue-200 mt-1">
              Welcome back, <span className="font-semibold">{user?.name}</span>
            </p>
          </div>

          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition duration-300 shadow-lg shadow-blue-600/30"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-x-hidden">

        {/* Top Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-10">

          {/* Upload */}
          <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-blue-500/20 p-8 shadow-2xl">

            <h2 className="text-2xl font-bold mb-6">
              Upload Files
            </h2>

            <UploadForm onUpload={handleUpload} />

          </div>

          {/* Stats */}
          <div className="lg:col-span-2 rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 shadow-2xl relative">

            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

            <div className="relative grid md:grid-cols-2 gap-8 p-8">

              <div>
                <p className="text-blue-100 uppercase tracking-widest text-sm">
                  Total Files
                </p>

                <h2 className="text-6xl font-black mt-2">
                  {files.length}
                </h2>

                <p className="text-blue-100 mt-4">
                  Files stored securely
                </p>
              </div>

              <div className="md:text-right">

                <p className="text-blue-100 uppercase tracking-widest text-sm">
                  Storage
                </p>

                <h2 className="text-4xl font-bold mt-2">
                  Secure Cloud
                </h2>

                <p className="text-blue-100 mt-4">
                  AES Encrypted
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* Files */}
        <section className="rounded-3xl bg-white/5 backdrop-blur-xl border border-blue-500/20 p-8 shadow-2xl">

          <div className="flex justify-between items-center mb-8">

            <div>

              <h2 className="text-3xl font-bold">
                My Files
              </h2>

              <p className="text-blue-200 mt-1">
                Manage your uploaded documents
              </p>

            </div>

            <span className="bg-blue-600/20 border border-blue-500/30 px-5 py-2 rounded-full text-blue-300 font-semibold">
              {files.length} Files
            </span>

          </div>

          {loading ? (
            <div className="text-center py-20 text-blue-300 text-lg">
              Loading...
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-24">

              <div className="text-7xl mb-4">
                📂
              </div>

              <h3 className="text-2xl font-bold mb-2">
                No Files Yet
              </h3>

              <p className="text-blue-200">
                Upload your first file to get started.
              </p>

            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 w-full">
              {files.map((file) => (
                <FileCard
                  key={file._id}
                  file={file}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>

      </main>

    </div>
  );
}

export default Dashboard;
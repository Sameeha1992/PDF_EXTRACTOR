import React, { useEffect, useRef, useState } from "react";
import { FaCloudUploadAlt, FaFilePdf, FaEye, FaTrashAlt } from "react-icons/fa";
import { PdfService } from "../../service/pdf/user.pdf.service";
import type { PdfItem } from "../../types/upload.pdf.type";
import PdfPageViewer from "../../components/PdfPageViewer";
import GeneratedPdfSection from "../../components/GeneratedPdfSection";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearCredentials } from "../../store/auth/authSlice";
import { UserAuthService } from "../../service/auth/auth.user";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [pdfList, setPdfList] = useState<PdfItem[]>([]);
  const [viewingPdf, setViewingPdf] = useState<PdfItem | null>(null);
  // Incrementing this causes GeneratedPdfSection to re-fetch
  const [generatedRefreshToken, setGeneratedRefreshToken] = useState(0);

  const [pdfToDelete, setPdfToDelete] = useState<PdfItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    try {
      await UserAuthService.logout();
    } catch (err) {
      console.warn("Failed to clear cookie on backend, clearing frontend anyway:", err);
    } finally {
      dispatch(clearCredentials());
      navigate("/login");
    }
  };

  const fetchPdfs = async () => {
    try {
      const response = await PdfService.getPdfs();
      if (response.success) {
        setPdfList(response.data);
      }
    } catch {
      // silently fail — list stays empty
    }
  };

  const confirmDelete = async () => {
    if (!pdfToDelete) return;
    try {
      setIsDeleting(true);
      const res = await PdfService.deletePdf(pdfToDelete._id);
      if (res.success) {
        setPdfList((prev) => prev.filter((p) => p._id !== pdfToDelete._id));
      }
    } catch {
      alert("Failed to delete PDF");
    } finally {
      setIsDeleting(false);
      setPdfToDelete(null);
    }
  };

  // Fetch existing PDFs on mount
  useEffect(() => {
    fetchPdfs();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      setIsError(true);
      setMessage("Please select a PDF file.");
      return;
    }

    setSelectedFile(file);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      setIsError(false);

      const response = await PdfService.uploadPdf(selectedFile);
      setMessage(response.message);
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Re-fetch list so the new entry has a real _id from the DB
      await fetchPdfs();
    } catch {
      setIsError(true);
      setMessage("Failed to upload PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-10 py-5 border-b">
        <h1 className="text-2xl font-bold text-[#5A0F3D]">PDF Extractor</h1>

        <div className="flex gap-6 items-center">
          {user ? (
            <>
              <span className="text-gray-700 font-medium">
                Welcome, {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[#5A0F3D] text-white rounded-full font-medium hover:bg-[#7b1856] transition cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-[#5A0F3D] font-medium"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-4 py-2 bg-pink-500 text-white rounded-full"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-col items-center justify-center flex-1 text-center px-6 w-full">
        <h2 className="text-4xl font-bold text-gray-800 mt-10">PDF Tools</h2>

        <p className="text-gray-500 mt-2">
          Upload, extract and manage your PDF files easily
        </p>

        {/* Upload Box */}
        <div className="mt-10 w-full max-w-2xl border-2 border-dashed border-pink-400 rounded-2xl p-12 bg-gradient-to-br from-pink-50 to-purple-50">
          <FaCloudUploadAlt className="text-6xl text-pink-500 mx-auto mb-4" />

          <p className="text-lg font-semibold text-[#5A0F3D]">
            Select PDF files
          </p>

          <p className="text-sm text-gray-500 mt-2">
            or drag and drop PDFs here
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full"
          >
            Browse Files
          </button>

          {selectedFile && (
            <div className="mt-6 flex items-center justify-center gap-2 text-[#5A0F3D]">
              <FaFilePdf className="text-red-500" />
              <span>{selectedFile.name}</span>
            </div>
          )}

          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={loading}
              className="mt-6 px-8 py-3 bg-[#5A0F3D] text-white rounded-full hover:bg-[#7b1856] transition"
            >
              {loading ? "Uploading..." : "Upload PDF"}
            </button>
          )}

          {message && (
            <p
              className={`mt-5 text-sm ${isError ? "text-red-500" : "text-green-600"
                }`}
            >
              {message}
            </p>
          )}
        </div>

        {/* Recent Files List */}
        {pdfList.length > 0 && (
          <div className="mt-10 w-full max-w-2xl pb-10">
            <h3 className="text-xl font-semibold text-[#5A0F3D] mb-4 text-left">
              Recent Files 📚
            </h3>

            <div className="space-y-3">
              {pdfList.map((pdf) => (
                <div
                  key={pdf._id}
                  className="flex justify-between items-center p-4 bg-white border rounded-xl shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FaFilePdf className="text-red-500 text-xl flex-shrink-0" />

                    <div className="text-left min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {pdf.originalName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {pdf.totalPages} {pdf.totalPages === 1 ? "page" : "pages"}
                      </p>
                      {pdf.createdAt && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(pdf.createdAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => setViewingPdf(pdf)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#5A0F3D] border border-[#5A0F3D] rounded-full hover:bg-[#5A0F3D] hover:text-white transition"
                      aria-label={`View pages of ${pdf.originalName}`}
                    >
                      <FaEye className="text-xs" />
                      View Pages
                    </button>
                    <button
                      onClick={() => setPdfToDelete(pdf)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                      aria-label={`Delete ${pdf.originalName}`}
                      title="Delete"
                    >
                      <FaTrashAlt className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Generated PDFs */}
        <GeneratedPdfSection refreshToken={generatedRefreshToken} />
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-4 border-t text-gray-400 text-sm">
        © 2026 PDF Extractor. All rights reserved.
      </footer>

      {/* PDF Page Viewer Modal */}
      {viewingPdf && (
        <PdfPageViewer
          pdf={viewingPdf}
          onClose={() => setViewingPdf(null)}
          onExtracted={() => setGeneratedRefreshToken((t) => t + 1)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {pdfToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete PDF</h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete "{pdfToDelete.originalName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPdfToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition flex items-center justify-center min-w-[80px]"
                disabled={isDeleting}
              >
                {isDeleting ? "..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

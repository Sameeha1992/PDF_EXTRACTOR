import React from "react";
import { FaTimes, FaDownload, FaExternalLinkAlt } from "react-icons/fa";

interface Props {
  filename: string;
  fileUrl: string;
  onClose: () => void;
}

/**
 * Renders a generated PDF inline inside a modal using a native <iframe>.
 * No extra libraries needed — the browser's built-in PDF renderer handles it.
 */
const PdfPreviewModal: React.FC<Props> = ({ filename, fileUrl, onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${filename}`}
    >
      <div className="w-full max-w-4xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-gradient-to-r from-pink-50 to-purple-50 flex-shrink-0">
          <p
            className="font-semibold text-[#5A0F3D] truncate text-sm max-w-xs sm:max-w-md"
            title={filename}
          >
            {filename}
          </p>

          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            {/* Open in new tab */}
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full text-gray-500 hover:text-[#5A0F3D] hover:bg-pink-100 transition"
              title="Open in new tab"
              aria-label="Open in new tab"
            >
              <FaExternalLinkAlt className="text-sm" />
            </a>

            {/* Download */}
            <a
              href={fileUrl}
              download={filename}
              className="p-2 rounded-full text-gray-500 hover:text-[#5A0F3D] hover:bg-pink-100 transition"
              title="Download"
              aria-label="Download"
            >
              <FaDownload className="text-sm" />
            </a>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:text-[#5A0F3D] hover:bg-pink-100 transition"
              aria-label="Close preview"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* ── PDF iframe ── */}
        <div className="flex-1 bg-gray-100 overflow-hidden">
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            title={filename}
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
};

export default PdfPreviewModal;

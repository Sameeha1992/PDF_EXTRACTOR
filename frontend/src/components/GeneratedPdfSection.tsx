import React, { useEffect, useState } from "react";
import {
  FaFilePdf,
  FaDownload,
  FaExternalLinkAlt,
  FaSpinner,
  FaInbox,
} from "react-icons/fa";
import { PdfService } from "../service/pdf/user.pdf.service";
import type { GeneratedPdfItem } from "../types/upload.pdf.type";

interface Props {
  /** Increment this to trigger a re-fetch after a new extraction */
  refreshToken?: number;
}

const GeneratedPdfSection: React.FC<Props> = ({ refreshToken = 0 }) => {
  const [items, setItems] = useState<GeneratedPdfItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await PdfService.getGeneratedPdfs();
        if (!cancelled && response.success) {
          setItems(response.data);
        }
      } catch {
        if (!cancelled) setError("Failed to load generated PDFs. Please refresh.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [refreshToken]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mt-10 w-full max-w-2xl pb-10">
        <h3 className="text-xl font-semibold text-[#5A0F3D] mb-4 text-left">
          Generated PDFs ✨
        </h3>
        <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
          <FaSpinner className="animate-spin text-pink-400 text-xl" />
          <span className="text-sm">Loading generated PDFs…</span>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="mt-10 w-full max-w-2xl pb-10">
        <h3 className="text-xl font-semibold text-[#5A0F3D] mb-4 text-left">
          Generated PDFs ✨
        </h3>
        <p className="text-sm text-red-500 text-center py-8">{error}</p>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="mt-10 w-full max-w-2xl pb-10">
        <h3 className="text-xl font-semibold text-[#5A0F3D] mb-4 text-left">
          Generated PDFs ✨
        </h3>
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
          <FaInbox className="text-4xl text-gray-300" />
          <p className="text-sm">No generated PDFs yet.</p>
          <p className="text-xs text-gray-300">
            Select pages from a PDF and extract them to see results here.
          </p>
        </div>
      </div>
    );
  }

  // ── List ─────────────────────────────────────────────────────────────────
  return (
    <div className="mt-10 w-full max-w-2xl pb-10">
      <h3 className="text-xl font-semibold text-[#5A0F3D] mb-4 text-left">
        Generated PDFs ✨
      </h3>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition"
          >
            {/* File info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                <FaFilePdf className="text-pink-500 text-lg" />
              </div>

              <div className="text-left min-w-0">
                <p
                  className="font-medium text-gray-800 truncate max-w-[240px] sm:max-w-sm"
                  title={item.filename}
                >
                  {item.filename}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.totalPages} {item.totalPages === 1 ? "page" : "pages"}
                  {" · "}
                  <span className="text-gray-400">
                    from {item.originalName}
                  </span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              {/* Open in new tab */}
              <a
                href={item.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full text-gray-500 hover:text-[#5A0F3D] hover:bg-pink-50 transition"
                aria-label={`Open ${item.filename} in new tab`}
                title="View"
              >
                <FaExternalLinkAlt className="text-sm" />
              </a>

              {/* Download */}
              <a
                href={item.downloadUrl}
                download={item.filename}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#5A0F3D] border border-[#5A0F3D] rounded-full hover:bg-[#5A0F3D] hover:text-white transition"
                aria-label={`Download ${item.filename}`}
              >
                <FaDownload className="text-xs" />
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeneratedPdfSection;

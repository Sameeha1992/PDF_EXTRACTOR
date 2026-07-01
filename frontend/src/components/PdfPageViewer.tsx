import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FaFilePdf,
  FaTimes,
  FaSpinner,
  FaDownload,
  FaGripVertical,
  FaCheckCircle,
} from "react-icons/fa";
import { PdfService } from "../service/pdf/user.pdf.service";
import type { PdfItem, PdfPage, ExtractPdfResult } from "../types/upload.pdf.type";

// ─── Sortable thumbnail card used inside the Selected section ────────────────

interface SortablePageCardProps {
  page: PdfPage;
  position: number;
  onRemove: (pageNumber: number) => void;
}

const SortablePageCard: React.FC<SortablePageCardProps> = ({
  page,
  position,
  onRemove,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: page.pageNumber });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative flex flex-col rounded-xl border-2 border-pink-400 bg-white shadow-sm overflow-hidden"
    >
      {/* Drag handle strip */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-center py-1.5 bg-pink-50 cursor-grab active:cursor-grabbing touch-none"
        aria-label={`Drag to reorder page ${page.pageNumber}`}
      >
        <FaGripVertical className="text-pink-300 text-sm" />
      </div>

      {/* Thumbnail */}
      <div className="relative w-full bg-gray-100">
        <img
          src={page.imageUrl}
          alt={`Page ${page.pageNumber}`}
          className="w-full h-auto block"
          draggable={false}
        />
        {/* Position badge */}
        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center font-bold shadow">
          {position}
        </div>
      </div>

      {/* Label + remove */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-pink-50">
        <span className="text-xs font-medium text-pink-700">Page {page.pageNumber}</span>
        <button
          onClick={() => onRemove(page.pageNumber)}
          className="text-pink-400 hover:text-red-500 transition p-0.5"
          aria-label={`Remove page ${page.pageNumber} from selection`}
        >
          <FaTimes className="text-xs" />
        </button>
      </div>
    </div>
  );
};

// ─── Drag overlay card (ghost while dragging) ────────────────────────────────

const DragOverlayCard: React.FC<{ page: PdfPage }> = ({ page }) => (
  <div className="flex flex-col rounded-xl border-2 border-pink-500 bg-white shadow-2xl overflow-hidden rotate-2 scale-105">
    <div className="flex items-center justify-center py-1.5 bg-pink-100">
      <FaGripVertical className="text-pink-400 text-sm" />
    </div>
    <div className="relative w-full bg-gray-100">
      <img
        src={page.imageUrl}
        alt={`Page ${page.pageNumber}`}
        className="w-full h-auto block"
        draggable={false}
      />
    </div>
    <div className="px-2 py-1.5 bg-pink-50">
      <span className="text-xs font-medium text-pink-700">Page {page.pageNumber}</span>
    </div>
  </div>
);

// ─── Extract success card ────────────────────────────────────────────────────

interface SuccessCardProps {
  result: ExtractPdfResult;
  onClose: () => void;
}

const ExtractSuccessCard: React.FC<SuccessCardProps> = ({ result, onClose }) => (
  <div className="flex flex-col items-center justify-center py-10 px-6 gap-4">
    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
      <FaCheckCircle className="text-green-500 text-3xl" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800">PDF Generated!</h3>
    <div className="w-full max-w-sm bg-gray-50 rounded-xl p-4 border text-left space-y-1">
      <p className="text-sm text-gray-700 font-medium truncate">{result.filename}</p>
      <p className="text-xs text-gray-500">
        {result.totalPages} {result.totalPages === 1 ? "page" : "pages"} extracted
      </p>
    </div>
    <div className="flex gap-3 mt-2">
      <a
        href={result.downloadUrl}
        download
        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full text-sm font-medium hover:opacity-90 transition"
      >
        <FaDownload className="text-xs" />
        Download PDF
      </a>
      <button
        onClick={onClose}
        className="px-5 py-2.5 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-50 transition"
      >
        Close
      </button>
    </div>
  </div>
);

// ─── Main component ──────────────────────────────────────────────────────────

interface Props {
  pdf: PdfItem;
  onClose: () => void;
  onExtracted?: () => void;
}

const PdfPageViewer: React.FC<Props> = ({ pdf, onClose, onExtracted }) => {
  // All pages loaded from the API
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Ordered selection — the order here is what gets sent to the backend
  const [orderedSelection, setOrderedSelection] = useState<PdfPage[]>([]);

  // Extraction state
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [extractResult, setExtractResult] = useState<ExtractPdfResult | null>(null);

  // Which page is being dragged (for the overlay)
  const [activeDragPage, setActiveDragPage] = useState<PdfPage | null>(null);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await PdfService.getPdfPages(pdf._id);
        if (response.success) setPages(response.data.pages);
      } catch {
        setError("Failed to load page thumbnails. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchPages();
  }, [pdf._id]);

  // ── Selection helpers ──────────────────────────────────────────────────────

  const isSelected = (pageNumber: number) =>
    orderedSelection.some((p) => p.pageNumber === pageNumber);

  const togglePage = (page: PdfPage) => {
    setOrderedSelection((prev) =>
      prev.some((p) => p.pageNumber === page.pageNumber)
        ? prev.filter((p) => p.pageNumber !== page.pageNumber)
        : [...prev, page],
    );
  };

  const removePage = (pageNumber: number) => {
    setOrderedSelection((prev) => prev.filter((p) => p.pageNumber !== pageNumber));
  };

  const allSelected =
    pages.length > 0 && orderedSelection.length === pages.length;

  const toggleSelectAll = () => {
    setOrderedSelection(allSelected ? [] : [...pages]);
  };

  // ── Drag-and-drop ──────────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const page = orderedSelection.find((p) => p.pageNumber === event.active.id);
    setActiveDragPage(page ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragPage(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrderedSelection((prev) => {
      const oldIndex = prev.findIndex((p) => p.pageNumber === active.id);
      const newIndex = prev.findIndex((p) => p.pageNumber === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  // ── Extract ────────────────────────────────────────────────────────────────

  const handleExtract = async () => {
    if (orderedSelection.length === 0) return;
    try {
      setExtracting(true);
      setExtractError("");
      const pageNumbers = orderedSelection.map((p) => p.pageNumber);
      const response = await PdfService.extractPages(pdf._id, pageNumbers);
      if (response.success) {
        setExtractResult(response.data);
        onExtracted?.();
      } else {
        setExtractError(response.message ?? "Extraction failed. Please try again.");
      }
    } catch (err: any) {
      setExtractError(
        err?.response?.data?.message ?? "Extraction failed. Please try again.",
      );
    } finally {
      setExtracting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Page viewer for ${pdf.originalName}`}
    >
      <div className="w-full sm:max-w-4xl max-h-[90vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-pink-50 to-purple-50 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <FaFilePdf className="text-red-500 text-xl flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-[#5A0F3D] truncate">{pdf.originalName}</p>
              <p className="text-xs text-gray-500">
                {pdf.totalPages} {pdf.totalPages === 1 ? "page" : "pages"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-pink-100 text-gray-500 hover:text-[#5A0F3D] transition flex-shrink-0 ml-4"
            aria-label="Close page viewer"
          >
            <FaTimes />
          </button>
        </div>

        {/* ── Success state (replaces body) ── */}
        {extractResult ? (
          <ExtractSuccessCard result={extractResult} onClose={onClose} />
        ) : (
          <>
            {/* ── Toolbar ── */}
            {!loading && !error && pages.length > 0 && (
              <div className="flex items-center justify-between px-6 py-3 border-b bg-white flex-shrink-0">
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 accent-pink-500"
                    aria-label="Select all pages"
                  />
                  {allSelected ? "Deselect all" : "Select all"}
                </label>
                {orderedSelection.length > 0 && (
                  <span className="text-sm font-medium text-[#5A0F3D]">
                    {orderedSelection.length} page
                    {orderedSelection.length !== 1 ? "s" : ""} selected
                  </span>
                )}
              </div>
            )}

            {/* ── Scrollable body ── */}
            <div className="overflow-y-auto flex-1 p-6 space-y-8">

              {/* Loading */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                  <FaSpinner className="text-4xl animate-spin text-pink-400" />
                  <p className="text-sm">Generating page thumbnails…</p>
                  <p className="text-xs text-gray-300">
                    This may take a moment for large PDFs
                  </p>
                </div>
              )}

              {/* Error */}
              {!loading && error && (
                <div className="flex items-center justify-center py-20">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              {/* ── All pages grid ── */}
              {!loading && !error && (
                <section>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    All Pages — click to select
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {pages.map((page) => {
                      const selected = isSelected(page.pageNumber);
                      return (
                        <button
                          key={page.pageNumber}
                          onClick={() => togglePage(page)}
                          className={`relative flex flex-col rounded-xl border-2 transition-all duration-150 overflow-hidden shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                            selected
                              ? "border-pink-500 ring-2 ring-pink-300"
                              : "border-gray-200 hover:border-pink-300"
                          }`}
                          aria-pressed={selected}
                          aria-label={`Page ${page.pageNumber}`}
                        >
                          <div className="relative w-full bg-gray-100">
                            <img
                              src={page.imageUrl}
                              alt={`Page ${page.pageNumber}`}
                              className="w-full h-auto block"
                              loading="lazy"
                              draggable={false}
                            />
                            {selected && (
                              <div className="absolute inset-0 bg-pink-400/10 pointer-events-none" />
                            )}
                          </div>
                          {/* Checkbox badge */}
                          <div className="absolute top-2 left-2">
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center shadow transition-colors ${
                                selected
                                  ? "bg-pink-500 border-pink-500"
                                  : "bg-white/90 border-gray-400"
                              }`}
                              aria-hidden="true"
                            >
                              {selected && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  viewBox="0 0 12 12"
                                >
                                  <path
                                    d="M2 6l3 3 5-5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                          <div
                            className={`px-2 py-1.5 text-center text-xs font-medium transition-colors ${
                              selected
                                ? "bg-pink-50 text-pink-700"
                                : "bg-white text-gray-600"
                            }`}
                          >
                            Page {page.pageNumber}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ── Selected pages (drag to reorder) ── */}
              {!loading && !error && orderedSelection.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      Selected Order — drag to reorder
                    </h4>
                    <button
                      onClick={() => setOrderedSelection([])}
                      className="text-xs text-red-400 hover:text-red-600 transition"
                    >
                      Clear all
                    </button>
                  </div>

                  {/* Order preview chips */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {orderedSelection.map((p, i) => (
                      <span
                        key={p.pageNumber}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700"
                      >
                        {i + 1}. p{p.pageNumber}
                      </span>
                    ))}
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={orderedSelection.map((p) => p.pageNumber)}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {orderedSelection.map((page, index) => (
                          <SortablePageCard
                            key={page.pageNumber}
                            page={page}
                            position={index + 1}
                            onRemove={removePage}
                          />
                        ))}
                      </div>
                    </SortableContext>

                    <DragOverlay>
                      {activeDragPage && (
                        <DragOverlayCard page={activeDragPage} />
                      )}
                    </DragOverlay>
                  </DndContext>
                </section>
              )}
            </div>

            {/* ── Footer ── */}
            {!loading && !error && orderedSelection.length > 0 && (
              <div className="px-6 py-4 border-t bg-white flex-shrink-0 space-y-2">
                {extractError && (
                  <p className="text-sm text-red-500 text-center">{extractError}</p>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {orderedSelection.length} of {pages.length} page
                    {pages.length !== 1 ? "s" : ""} selected
                  </p>
                  <button
                    onClick={handleExtract}
                    disabled={extracting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full text-sm font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {extracting ? (
                      <>
                        <FaSpinner className="animate-spin text-xs" />
                        Extracting…
                      </>
                    ) : (
                      <>
                        Extract {orderedSelection.length} page
                        {orderedSelection.length !== 1 ? "s" : ""}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PdfPageViewer;

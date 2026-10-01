import { useEffect } from "react";
import {
  X,
  RotateCw,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Check,
} from "lucide-react";
import { PageThumbnail } from "./PageThumbnail";
import type { ManagedPage } from "../types/pdf";

interface PageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfDoc: any;
  pages: ManagedPage[];
  currentPageNumber: number;
  onSelectPage: (displayPageNumber: number) => void;
  onRotatePage: (pageIndex: number) => void;
  onMovePage: (fromIndex: number, toIndex: number) => void;
  onDuplicatePage: (pageIndex: number) => void;
  onDeletePage: (pageIndex: number) => void;
}

export function PageManagerModal({
  isOpen,
  onClose,
  pdfDoc,
  pages,
  currentPageNumber,
  onSelectPage,
  onRotatePage,
  onMovePage,
  onDuplicatePage,
  onDeletePage,
}: PageManagerModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-[0_8px_30px_rgba(15,15,15,0.12),0_1px_3px_rgba(15,15,15,0.06)] border border-[#37352F]/15 w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col text-[#37352F]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#37352F]/10">
          <div className="flex items-center gap-2.5">
            <Layers size={17} className="text-[#2383E2]" />
            <h3 className="font-semibold text-sm text-[#37352F]">
              Page Manager
            </h3>
            <span className="text-xs bg-[#F7F6F3] text-[#787774] border border-[#37352F]/10 px-2 py-0.5 rounded-full font-medium">
              {pages.length} {pages.length === 1 ? "page" : "pages"}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#787774] hover:text-[#37352F] hover:bg-[#37352F]/5 rounded-md transition cursor-pointer"
            title="Close (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Info description */}
        <div className="px-6 py-2.5 bg-[#F7F6F3]/60 border-b border-[#37352F]/10 text-xs text-[#787774] flex items-center justify-between">
          <span>
            Reorder pages with arrows, rotate 90°, duplicate, or delete. Click a page thumbnail to jump to it.
          </span>
        </div>

        {/* Page Thumbnail Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 justify-items-center">
          {pages.map((page, index) => {
            const isCurrent = index + 1 === currentPageNumber;
            const normRotation = ((page.rotation % 360) + 360) % 360;

            return (
              <div
                key={page.id}
                className={`flex flex-col items-center bg-white rounded-xl border transition p-3 shadow-2xs group relative ${
                  isCurrent
                    ? "border-[#2383E2] ring-2 ring-[#2383E2]/20"
                    : "border-[#37352F]/12 hover:border-[#37352F]/30"
                }`}
              >
                {/* Header: Page label + Rotation Badge */}
                <div className="w-full flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-[#37352F]">
                      Page {index + 1}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] bg-[#2383E2]/10 text-[#2383E2] font-semibold px-1.5 py-0.2 rounded">
                        Active
                      </span>
                    )}
                  </div>

                  {normRotation !== 0 && (
                    <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1 rounded font-medium">
                      +{normRotation}°
                    </span>
                  )}
                </div>

                {/* Clickable Page Thumbnail */}
                <div
                  onClick={() => {
                    onSelectPage(index + 1);
                    onClose();
                  }}
                  className="cursor-pointer hover:opacity-90 transition relative rounded overflow-hidden"
                  title={`Jump to Page ${index + 1}`}
                >
                  <PageThumbnail
                    pdfDoc={pdfDoc}
                    originalIndex={page.originalIndex}
                    rotation={page.rotation}
                  />

                  {/* Hover overlay hint */}
                  <div className="absolute inset-0 bg-[#37352F]/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                    <span className="bg-white/90 backdrop-blur-xs text-[#37352F] text-[11px] font-medium px-2 py-0.5 rounded shadow-xs">
                      View Page
                    </span>
                  </div>
                </div>

                {/* Action Buttons Toolbar */}
                <div className="flex items-center justify-center gap-1 mt-3 pt-2 border-t border-[#37352F]/10 w-full">
                  {/* Rotate 90 CW */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRotatePage(index);
                    }}
                    className="p-1.5 text-[#787774] hover:text-[#37352F] hover:bg-[#37352F]/5 rounded transition cursor-pointer"
                    title="Rotate 90° Clockwise"
                  >
                    <RotateCw size={14} />
                  </button>

                  {/* Move Left */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (index > 0) onMovePage(index, index - 1);
                    }}
                    disabled={index === 0}
                    className="p-1.5 text-[#787774] hover:text-[#37352F] hover:bg-[#37352F]/5 rounded disabled:opacity-25 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
                    title="Move Page Earlier"
                  >
                    <ChevronLeft size={15} />
                  </button>

                  {/* Move Right */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (index < pages.length - 1) onMovePage(index, index + 1);
                    }}
                    disabled={index === pages.length - 1}
                    className="p-1.5 text-[#787774] hover:text-[#37352F] hover:bg-[#37352F]/5 rounded disabled:opacity-25 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
                    title="Move Page Later"
                  >
                    <ChevronRight size={15} />
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicatePage(index);
                    }}
                    className="p-1.5 text-[#787774] hover:text-[#37352F] hover:bg-[#37352F]/5 rounded transition cursor-pointer"
                    title="Duplicate Page"
                  >
                    <Copy size={13} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (pages.length > 1) onDeletePage(index);
                    }}
                    disabled={pages.length <= 1}
                    className="p-1.5 text-[#787774] hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-25 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
                    title={
                      pages.length <= 1
                        ? "Cannot delete the only page"
                        : "Delete Page"
                    }
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#37352F]/10 bg-[#F7F6F3]/40">
          <span className="text-xs text-[#787774]">
            Changes automatically sync with editor and export.
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 bg-[#2383E2] hover:bg-[#1a73e8] active:bg-[#1565c0] text-white px-4 py-1.5 rounded-md text-xs font-medium shadow-xs transition cursor-pointer"
          >
            <Check size={13} />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PageManagerModal;

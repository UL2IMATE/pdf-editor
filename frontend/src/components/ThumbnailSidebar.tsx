import { ChevronLeft, RotateCw, Layers } from "lucide-react";
import { PageThumbnail } from "./PageThumbnail";
import type { ManagedPage } from "../types/pdf";

interface ThumbnailSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pdfDoc: any;
  pages: ManagedPage[];
  currentPageNumber: number;
  onSelectPage: (displayPageNum: number) => void;
  onRotatePage: (index: number) => void;
}

export function ThumbnailSidebar({
  isOpen,
  onClose,
  pdfDoc,
  pages,
  currentPageNumber,
  onSelectPage,
  onRotatePage,
}: ThumbnailSidebarProps) {
  if (!isOpen) return null;

  return (
    <aside
      className="w-52 h-full bg-white border-r border-[#37352F]/10 shadow-[2px_0_8px_rgba(15,15,15,0.03)] flex flex-col shrink-0 z-25 select-none animate-in slide-in-from-left duration-200"
      aria-label="Page Thumbnails"
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#37352F]/10 bg-[#FBFBFA]">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#37352F]">
          <Layers size={13} className="text-[#2383E2]" />
          <span>Pages</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-[#37352F]/8 rounded-full text-[#787774] font-medium">
            {pages.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-[#9B9A97] hover:text-[#37352F] hover:bg-[#37352F]/5 p-1 rounded transition cursor-pointer"
          title="Collapse sidebar (Press [)"
        >
          <ChevronLeft size={15} />
        </button>
      </div>

      {/* Scrollable Thumbnails List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col items-center gap-3.5">
        {pages.map((page, index) => {
          const isActive = currentPageNumber === index + 1;

          return (
            <div
              key={page.id}
              className="flex flex-col items-center gap-1 group w-full"
            >
              <div
                onClick={() => onSelectPage(index + 1)}
                className={`relative rounded-lg p-1 transition cursor-pointer w-fit ${
                  isActive
                    ? "ring-2 ring-[#2383E2] bg-[#2383E2]/5 shadow-xs"
                    : "border border-transparent hover:border-[#37352F]/15 hover:bg-[#37352F]/3"
                }`}
                title={`Jump to Page ${index + 1}`}
              >
                <PageThumbnail
                  pdfDoc={pdfDoc}
                  originalIndex={page.originalIndex}
                  rotation={page.rotation}
                  maxWidth={110}
                  maxHeight={145}
                />

                {/* Quick Rotate Button on Hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRotatePage(index);
                  }}
                  className="absolute top-2 right-2 p-1 bg-white/90 hover:bg-white text-[#37352F] rounded-md shadow-xs border border-[#37352F]/15 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  title="Rotate 90° Clockwise"
                >
                  <RotateCw size={12} />
                </button>
              </div>

              {/* Page Number Label */}
              <span
                className={`text-[11px] font-medium transition ${
                  isActive
                    ? "text-[#2383E2] font-semibold"
                    : "text-[#787774] group-hover:text-[#37352F]"
                }`}
              >
                Page {index + 1}
              </span>
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer Hint */}
      <div className="px-3 py-2 border-t border-[#37352F]/10 bg-[#FBFBFA] text-center text-[10px] text-[#9B9A97]">
        Press <kbd className="px-1 py-0.5 font-mono bg-white border border-[#37352F]/15 rounded shadow-2xs text-[#787774]">[</kbd> to toggle
      </div>
    </aside>
  );
}

export default ThumbnailSidebar;

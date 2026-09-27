import { Download, Loader2, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { PdfLogo } from "./PdfLogo";

type ControlsProps = {
  pageNumber: number;
  totalPages: number;
  handlePrevPage: () => void;
  handleNextPage: () => void;
  handleExport?: () => void;
  isExporting?: boolean;
  isPageLoading?: boolean;
};

export function Controls({
  pageNumber,
  totalPages,
  handlePrevPage,
  handleNextPage,
  handleExport,
  isExporting = false,
  isPageLoading = false,
}: ControlsProps) {
  return (
    <div className="w-full flex px-5 py-2.5 bg-white text-[#37352F] justify-between items-center border-b border-[#37352F]/10 shadow-[0_1px_2px_rgba(15,15,15,0.03)] sticky top-0 z-30 select-none">
      {/* Left section: App Brand Logo & Breadcrumb */}
      <div className="flex items-center gap-2.5">
        <PdfLogo size="md" showBadge={false} clickable={true} />
        <span className="text-[#37352F]/20 text-xs">/</span>
        <div className="flex items-center gap-1.5 text-xs text-[#787774] font-medium">
          <FileText size={13} className="text-[#9B9A97]" />
          <span className="truncate max-w-[160px] sm:max-w-[240px]">Document.pdf</span>
        </div>
      </div>

      {/* Center section: Minimal Notion-style Pagination */}
      <div className="flex items-center bg-[#F7F6F3] border border-[#37352F]/10 rounded-lg p-0.5 shadow-2xs">
        <button
          onClick={handlePrevPage}
          disabled={pageNumber <= 1}
          className="p-1 rounded text-[#787774] hover:text-[#37352F] hover:bg-[#37352F]/5 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
          title="Previous page"
        >
          <ChevronLeft size={15} />
        </button>

        <span className="text-[#37352F] font-medium text-xs px-2.5 select-none min-w-[5.5rem] text-center flex items-center justify-center gap-1.5">
          {isPageLoading && <Loader2 size={11} className="animate-spin text-[#787774]" />}
          <span>{pageNumber} {totalPages > 0 ? `of ${totalPages}` : ""}</span>
        </span>

        <button
          onClick={handleNextPage}
          disabled={totalPages > 0 && pageNumber >= totalPages}
          className="p-1 rounded text-[#787774] hover:text-[#37352F] hover:bg-[#37352F]/5 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
          title="Next page"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Right section: Export / Download button */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-1.5 bg-[#2383E2] hover:bg-[#1a73e8] active:bg-[#1565c0] text-white px-3 py-1.5 rounded-md text-xs font-medium shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          title="Export and download edited PDF"
        >
          {isExporting ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <Download size={13} />
              <span>Export</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Controls;

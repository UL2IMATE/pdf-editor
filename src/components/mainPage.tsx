import { Upload, FileUp, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PdfLogo } from "./PdfLogo";

type MainPageProps = {
  handleUrl?: (url: string) => void;
  handleFile?: (file: File) => void;
};

export const MainPage = ({ handleUrl, handleFile }: MainPageProps) => {
  const navigate = useNavigate();

  const handleSelectFile = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    handleUrl?.(fileUrl);
    handleFile?.(file);
    navigate("/Editing");
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex flex-col items-center justify-center p-6 text-[#37352F] select-none">
      <div className="mb-6">
        <PdfLogo size="lg" showBadge={false} clickable={false} />
      </div>

      <div className="bg-white border border-[#37352F]/12 shadow-[0_1px_3px_rgba(15,15,15,0.04),0_6px_16px_rgba(15,15,15,0.03)] max-w-md w-full rounded-xl p-8 flex flex-col items-center text-center gap-6">
        <div className="w-12 h-12 rounded-xl bg-[#F7F6F3] border border-[#37352F]/10 flex items-center justify-center text-[#37352F] shadow-2xs">
          <FileUp size={22} className="text-[#37352F]" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold tracking-tight text-[#37352F]">
            Open PDF Document
          </h2>
          <p className="text-xs text-[#787774] leading-relaxed max-w-xs">
            Edit text in-place with exact font matching, draw vector annotations, or use AI to refine content.
          </p>
        </div>

        {/* Dropzone area */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const file = e.dataTransfer.files?.[0];
            if (file) {
              const isPdf =
                file.type === "application/pdf" ||
                file.name.toLowerCase().endsWith(".pdf");
              if (isPdf) {
                handleSelectFile(file);
              }
            }
          }}
          className="w-full border border-dashed border-[#37352F]/20 hover:border-[#37352F]/40 bg-[#F7F6F3]/40 hover:bg-[#F7F6F3] rounded-xl p-6 flex flex-col items-center gap-3 transition cursor-pointer group"
        >
          <div className="p-2 rounded-lg bg-white border border-[#37352F]/10 text-[#787774] group-hover:text-[#37352F] shadow-2xs transition">
            <Upload size={18} />
          </div>

          <div className="text-center">
            <p className="text-xs font-medium text-[#37352F]">
              Click to browse or drop file here
            </p>
            <p className="text-[11px] text-[#9B9A97] mt-0.5">
              Supports standard PDF documents up to 50MB
            </p>
          </div>

          <span className="mt-1 inline-flex items-center gap-1.5 bg-[#242424] hover:bg-[#37352F] text-white text-xs font-medium px-4 py-1.5 rounded-lg shadow-xs transition">
            Choose PDF File
          </span>

          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleSelectFile(file);
              }
            }}
          />
        </label>

        {/* Minimal Notion-style feature pills */}
        <div className="flex items-center gap-3 text-[11px] text-[#787774] pt-1 border-t border-[#37352F]/8 w-full justify-center">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            100% Private & Local
          </span>
          <span className="text-[#37352F]/20">•</span>
          <span>Vector Fidelity</span>
          <span className="text-[#37352F]/20">•</span>
          <span className="flex items-center gap-1">
            <Sparkles size={11} className="text-[#2383E2]" />
            AI Rewrite
          </span>
        </div>
      </div>
    </div>
  );
};

export default MainPage;

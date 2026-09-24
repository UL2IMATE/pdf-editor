import React, { useState, useEffect } from "react";
import { Sparkles, Check, AlertCircle, X, Loader2 } from "lucide-react";
import { aiRewriteText, type RewriteResponse } from "../services/api";

interface AiRewriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  maxCharacters: number;
  onApply: (newText: string) => void;
}

const PRESET_INSTRUCTIONS = [
  "Make more professional and formal",
  "Make concise and impactful",
  "Fix grammar and polish tone",
  "Summarize key points",
];

export const AiRewriteModal: React.FC<AiRewriteModalProps> = ({
  isOpen,
  onClose,
  originalText,
  maxCharacters,
  onApply,
}) => {
  const [instruction, setInstruction] = useState(PRESET_INSTRUCTIONS[0]);
  const [customInstruction, setCustomInstruction] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RewriteResponse | null>(null);

  useEffect(() => {
    if (isOpen) {
      setResult(null);
      setError(null);
      setLoading(false);
    }
  }, [isOpen, originalText]);

  if (!isOpen) return null;

  const activeInstruction = isCustom
    ? customInstruction || "Rewrite clearly"
    : instruction;

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await aiRewriteText({
        selectedText: originalText,
        instruction: activeInstruction,
        maxCharacters,
      });
      setResult(res);
    } catch (err: unknown) {
      console.error("AI rewrite error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect to backend AI service. Make sure backend is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onApply(result.replacement_text);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs p-4 select-none">
      <div className="bg-white border border-[#37352F]/15 rounded-xl w-full max-w-lg shadow-[0_8px_32px_rgba(15,15,15,0.12),0_1px_3px_rgba(15,15,15,0.05)] text-[#37352F] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#37352F]/10">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-[#2383E2]/10 text-[#2383E2]">
              <Sparkles size={16} />
            </div>
            <h3 className="font-semibold text-sm text-[#37352F]">
              AI Rewrite
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#787774] hover:text-[#37352F] rounded-md hover:bg-[#37352F]/5 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Target Text Box */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-semibold text-[#787774] uppercase tracking-wider">
                Original Text
              </label>
              <span className="text-[11px] text-[#9B9A97]">
                Budget: ~{maxCharacters} chars
              </span>
            </div>
            <div className="p-3 bg-[#F7F6F3] border border-[#37352F]/10 rounded-lg text-xs text-[#37352F] line-clamp-3 leading-relaxed">
              "{originalText}"
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="block text-[10px] font-semibold text-[#787774] uppercase tracking-wider mb-1.5">
              Tone & Intent
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESET_INSTRUCTIONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setInstruction(preset);
                    setIsCustom(false);
                  }}
                  className={`text-left p-2.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    !isCustom && instruction === preset
                      ? "bg-[#2383E2]/10 border-[#2383E2] text-[#2383E2]"
                      : "bg-[#F7F6F3] border-[#37352F]/10 text-[#37352F] hover:bg-[#EFEFED]"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Custom instruction option */}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setIsCustom(!isCustom)}
                className="text-xs text-[#2383E2] hover:underline cursor-pointer mb-1 inline-block"
              >
                {isCustom ? "Select a preset" : "+ Custom instruction"}
              </button>
              {isCustom && (
                <input
                  type="text"
                  placeholder="e.g. Translate to Spanish, Make concise..."
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  className="w-full bg-[#F7F6F3] border border-[#37352F]/12 rounded-lg px-3 py-1.5 text-xs text-[#37352F] focus:outline-none focus:border-[#2383E2] focus:bg-white"
                />
              )}
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* AI Result Preview */}
          {result && (
            <div className="p-3.5 bg-[#F7F6F3] border border-[#37352F]/10 rounded-lg space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#787774] text-[10px] uppercase tracking-wider">
                  Replacement
                </span>
                <span
                  className={`font-mono px-1.5 py-0.5 rounded text-[10px] ${
                    result.overflow_risk
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {result.character_count} / {maxCharacters} chars
                </span>
              </div>
              <p className="text-xs font-medium text-[#37352F] bg-white p-3 rounded-md border border-[#37352F]/10 leading-relaxed">
                {result.replacement_text}
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#37352F]/10 bg-[#F7F6F3]/50">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-[#787774] hover:text-[#37352F] transition cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F7F6F3] text-[#37352F] rounded-md text-xs font-medium border border-[#37352F]/15 disabled:opacity-50 transition cursor-pointer shadow-2xs"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Rewriting...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} className="text-[#2383E2]" />
                  <span>{result ? "Regenerate" : "Rewrite"}</span>
                </>
              )}
            </button>

            {result && (
              <button
                type="button"
                onClick={handleApply}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2383E2] hover:bg-[#1a73e8] text-white rounded-md text-xs font-medium shadow-xs transition cursor-pointer"
              >
                <Check size={13} />
                <span>Apply to Document</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

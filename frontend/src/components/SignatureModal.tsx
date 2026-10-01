import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  PenTool,
  Type,
  Upload,
  Stamp,
  RotateCcw,
  Check,
} from "lucide-react";

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (dataUrl: string) => void;
}

type TabType = "draw" | "type" | "stamp";

const PRESET_STAMPS = [
  { id: "approved", label: "APPROVED", color: "#16a34a", sub: "VERIFIED" },
  { id: "confidential", label: "CONFIDENTIAL", color: "#dc2626", sub: "PRIVATE" },
  { id: "draft", label: "DRAFT", color: "#64748b", sub: "WORK IN PROGRESS" },
  { id: "paid", label: "PAID", color: "#2563eb", sub: "PROCESSED" },
  { id: "void", label: "VOID", color: "#b91c1c", sub: "CANCELLED" },
];

export function SignatureModal({
  isOpen,
  onClose,
  onInsert,
}: SignatureModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("draw");

  // Draw Tab State
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#0f172a");
  const [penWidth, setPenWidth] = useState(3);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Type Tab State
  const [typedName, setTypedName] = useState("");
  const [typeFontIndex, setTypeFontIndex] = useState(0);
  const [typeColor, setTypeColor] = useState("#0f172a");

  // Stamp / Upload Tab State
  const [selectedStamp, setSelectedStamp] = useState<string | null>("approved");
  const [customImage, setCustomImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Setup drawing canvas DPR
  const initCanvas = useCallback(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 500;
    const height = 180;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
  }, [penColor, penWidth]);

  useEffect(() => {
    if (isOpen && activeTab === "draw") {
      setTimeout(initCanvas, 50);
    }
  }, [isOpen, activeTab, initCanvas]);

  const clearCanvas = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    lastPointRef.current = null;
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    lastPointRef.current = { x, y };
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (lastPointRef.current) {
      // Smooth curve using midpoint quadratic curve
      const midX = (lastPointRef.current.x + x) / 2;
      const midY = (lastPointRef.current.y + y) / 2;
      ctx.quadraticCurveTo(lastPointRef.current.x, lastPointRef.current.y, midX, midY);
      ctx.stroke();
    }
    lastPointRef.current = { x, y };
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  // Convert typed name to transparent PNG data URL
  const generateTypedDataUrl = (): string => {
    if (!typedName.trim()) return "";
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 180;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = typeColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const fonts = [
      "italic 52px 'Brush Script MT', 'Segoe Script', cursive, sans-serif",
      "italic 46px 'Times New Roman', Georgia, serif",
      "italic 48px 'Caveat', 'Dancing Script', cursive, sans-serif",
      "bold 38px ui-monospace, SFMono-Regular, Menlo, monospace",
    ];

    ctx.font = fonts[typeFontIndex] || fonts[0];
    ctx.fillText(typedName.trim(), canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL("image/png");
  };

  // Generate official preset stamp as transparent PNG
  const generateStampDataUrl = (presetId: string): string => {
    const preset = PRESET_STAMPS.find((p) => p.id === presetId);
    if (!preset) return "";

    const canvas = document.createElement("canvas");
    canvas.width = 360;
    canvas.height = 130;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pad = 8;
    const width = canvas.width - pad * 2;
    const height = canvas.height - pad * 2;
    const radius = 10;

    // Rounded outer frame
    ctx.save();
    ctx.strokeStyle = preset.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(pad, pad, width, height, radius);
    ctx.stroke();

    // Inner subtle thin border
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(pad + 4, pad + 4, width - 8, height - 8, radius - 2);
    ctx.stroke();

    // Stamp Title
    ctx.fillStyle = preset.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.letterSpacing = "2.5px";
    ctx.fillText(preset.label, canvas.width / 2, canvas.height / 2 - 10);

    // Subtitle / Date
    const today = new Date().toISOString().split("T")[0];
    ctx.font = "600 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.letterSpacing = "1.5px";
    ctx.fillText(`${preset.sub} • ${today}`, canvas.width / 2, canvas.height / 2 + 22);

    ctx.restore();
    return canvas.toDataURL("image/png");
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCustomImage(result);
        setSelectedStamp(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInsert = () => {
    if (activeTab === "draw") {
      const canvas = drawCanvasRef.current;
      if (!canvas || !hasDrawn) return;
      const dataUrl = canvas.toDataURL("image/png");
      onInsert(dataUrl);
      onClose();
    } else if (activeTab === "type") {
      const dataUrl = generateTypedDataUrl();
      if (!dataUrl) return;
      onInsert(dataUrl);
      onClose();
    } else if (activeTab === "stamp") {
      if (customImage) {
        onInsert(customImage);
        onClose();
      } else if (selectedStamp) {
        const dataUrl = generateStampDataUrl(selectedStamp);
        if (!dataUrl) return;
        onInsert(dataUrl);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-[0_8px_30px_rgba(15,15,15,0.12),0_1px_3px_rgba(15,15,15,0.06)] border border-[#37352F]/15 w-full max-w-lg overflow-hidden flex flex-col text-[#37352F]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#37352F]/10">
          <div className="flex items-center gap-2">
            <PenTool size={16} className="text-[#2383E2]" />
            <h3 className="font-semibold text-sm text-[#37352F]">
              Add Signature or Stamp
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#787774] hover:text-[#37352F] hover:bg-[#37352F]/5 rounded-md transition cursor-pointer"
            title="Close (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#37352F]/10 px-5 pt-3 gap-2 bg-[#F7F6F3]/50">
          <button
            onClick={() => setActiveTab("draw")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition cursor-pointer ${
              activeTab === "draw"
                ? "border-[#2383E2] text-[#2383E2]"
                : "border-transparent text-[#787774] hover:text-[#37352F]"
            }`}
          >
            <PenTool size={13} />
            <span>Draw Signature</span>
          </button>
          <button
            onClick={() => setActiveTab("type")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition cursor-pointer ${
              activeTab === "type"
                ? "border-[#2383E2] text-[#2383E2]"
                : "border-transparent text-[#787774] hover:text-[#37352F]"
            }`}
          >
            <Type size={13} />
            <span>Type Signature</span>
          </button>
          <button
            onClick={() => setActiveTab("stamp")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition cursor-pointer ${
              activeTab === "stamp"
                ? "border-[#2383E2] text-[#2383E2]"
                : "border-transparent text-[#787774] hover:text-[#37352F]"
            }`}
          >
            <Stamp size={13} />
            <span>Stamps & Images</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 flex-1 min-h-[260px] flex flex-col justify-between">
          {/* TAB 1: DRAW SIGNATURE */}
          {activeTab === "draw" && (
            <div className="flex flex-col gap-3">
              <div className="relative border border-[#37352F]/15 rounded-lg bg-white overflow-hidden shadow-2xs">
                <canvas
                  ref={drawCanvasRef}
                  onPointerDown={startDrawing}
                  onPointerMove={draw}
                  onPointerUp={stopDrawing}
                  onPointerLeave={stopDrawing}
                  className="cursor-crosshair block w-full touch-none"
                  style={{ height: "180px" }}
                />
                {/* Signature Baseline Marker */}
                <div className="absolute bottom-8 left-6 right-6 border-b border-dashed border-[#37352F]/20 pointer-events-none flex items-center justify-between">
                  <span className="text-[10px] text-[#9B9A97] tracking-wider select-none">
                    ✕ SIGN HERE
                  </span>
                </div>
              </div>

              {/* Draw Controls */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#787774] font-medium">Ink:</span>
                  {[
                    { color: "#0f172a", label: "Black" },
                    { color: "#1d4ed8", label: "Blue" },
                    { color: "#b91c1c", label: "Red" },
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => setPenColor(c.color)}
                      className={`w-5 h-5 rounded-full border transition cursor-pointer flex items-center justify-center ${
                        penColor === c.color
                          ? "border-[#2383E2] scale-110 shadow-xs ring-2 ring-[#2383E2]/20"
                          : "border-black/10 hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                    >
                      {penColor === c.color && (
                        <Check size={10} className="text-white" />
                      )}
                    </button>
                  ))}

                  <div className="w-px h-3.5 bg-[#37352F]/10 mx-1" />

                  <span className="text-[11px] text-[#787774] font-medium">Stroke:</span>
                  {[
                    { width: 2, label: "Fine" },
                    { width: 3.5, label: "Medium" },
                    { width: 5, label: "Bold" },
                  ].map((w) => (
                    <button
                      key={w.width}
                      onClick={() => setPenWidth(w.width)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                        penWidth === w.width
                          ? "bg-[#37352F]/10 text-[#37352F] font-semibold"
                          : "text-[#787774] hover:bg-[#37352F]/5"
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={clearCanvas}
                  className="flex items-center gap-1 text-[11px] text-[#787774] hover:text-red-600 transition cursor-pointer px-2 py-1 rounded hover:bg-red-50"
                  title="Clear signature pad"
                >
                  <RotateCcw size={11} />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TYPE SIGNATURE */}
          {activeTab === "type" && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#787774] mb-1.5">
                  Type your name:
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="e.g. Johnathan Doe"
                  className="w-full px-3 py-2 border border-[#37352F]/15 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#2383E2] shadow-2xs"
                  autoFocus
                />
              </div>

              {/* Signature Font Styles */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-medium text-[#787774]">
                  Choose style:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Cursive Script", style: "italic 26px 'Brush Script MT', cursive, sans-serif" },
                    { label: "Classic Serif", style: "italic 22px 'Times New Roman', Georgia, serif" },
                    { label: "Handwritten", style: "italic 24px 'Caveat', cursive, sans-serif" },
                    { label: "Formal Mono", style: "bold 18px monospace" },
                  ].map((font, idx) => (
                    <div
                      key={font.label}
                      onClick={() => setTypeFontIndex(idx)}
                      className={`p-3 rounded-lg border text-center cursor-pointer transition flex flex-col justify-center items-center min-h-[58px] ${
                        typeFontIndex === idx
                          ? "border-[#2383E2] bg-[#2383E2]/5 text-[#2383E2] shadow-2xs"
                          : "border-[#37352F]/10 hover:border-[#37352F]/20 bg-white"
                      }`}
                    >
                      <span
                        className="truncate max-w-full"
                        style={{
                          font: font.style,
                          color: typeColor,
                        }}
                      >
                        {typedName.trim() || font.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Selector for Typed Signature */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-[#787774] font-medium">Color:</span>
                {[
                  { color: "#0f172a", label: "Black" },
                  { color: "#1d4ed8", label: "Blue" },
                  { color: "#b91c1c", label: "Red" },
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setTypeColor(c.color)}
                    className={`w-5 h-5 rounded-full border transition cursor-pointer flex items-center justify-center ${
                      typeColor === c.color
                        ? "border-[#2383E2] scale-110 shadow-xs ring-2 ring-[#2383E2]/20"
                        : "border-black/10 hover:scale-105"
                    }`}
                    style={{ backgroundColor: c.color }}
                  >
                    {typeColor === c.color && <Check size={10} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STAMPS & CUSTOM IMAGE */}
          {activeTab === "stamp" && (
            <div className="flex flex-col gap-4">
              {/* Preset Stamps */}
              <div>
                <span className="block text-[11px] font-medium text-[#787774] mb-2">
                  Official Business Stamps:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_STAMPS.map((stamp) => {
                    const isSelected = selectedStamp === stamp.id && !customImage;
                    return (
                      <button
                        key={stamp.id}
                        onClick={() => {
                          setSelectedStamp(stamp.id);
                          setCustomImage(null);
                        }}
                        className={`p-2.5 rounded-lg border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                          isSelected
                            ? "border-[#2383E2] bg-[#2383E2]/5 ring-1 ring-[#2383E2]"
                            : "border-[#37352F]/10 hover:border-[#37352F]/25 bg-white"
                        }`}
                      >
                        <div
                          className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider border"
                          style={{
                            borderColor: stamp.color,
                            color: stamp.color,
                          }}
                        >
                          {stamp.label}
                        </div>
                        <span className="text-[9px] text-[#9B9A97]">
                          {stamp.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Image Upload */}
              <div>
                <span className="block text-[11px] font-medium text-[#787774] mb-2">
                  Or upload an image or scanned signature:
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {customImage ? (
                  <div className="relative border border-[#2383E2] bg-[#2383E2]/5 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img
                        src={customImage}
                        alt="Uploaded preview"
                        className="w-12 h-12 object-contain bg-white rounded border border-[#37352F]/10 p-0.5"
                      />
                      <span className="text-xs font-medium text-[#37352F] truncate">
                        Custom image ready to place
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setCustomImage(null);
                        setSelectedStamp("approved");
                      }}
                      className="p-1 text-[#787774] hover:text-red-600 rounded transition cursor-pointer"
                      title="Remove image"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border border-dashed border-[#37352F]/20 hover:border-[#37352F]/40 bg-[#F7F6F3]/50 hover:bg-[#F7F6F3] rounded-lg p-3.5 flex items-center justify-center gap-2 text-xs text-[#787774] hover:text-[#37352F] transition cursor-pointer"
                  >
                    <Upload size={14} />
                    <span>Upload PNG, JPG, or SVG</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#37352F]/10 mt-3">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#787774] hover:text-[#37352F] hover:bg-[#37352F]/5 rounded-md transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              disabled={
                (activeTab === "draw" && !hasDrawn) ||
                (activeTab === "type" && !typedName.trim()) ||
                (activeTab === "stamp" && !selectedStamp && !customImage)
              }
              className="flex items-center gap-1.5 bg-[#2383E2] hover:bg-[#1a73e8] active:bg-[#1565c0] text-white px-4 py-1.5 rounded-md text-xs font-medium shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <Check size={13} />
              <span>Place on Document</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignatureModal;

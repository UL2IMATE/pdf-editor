import { useState, useEffect } from "react";
import { Canvas, FabricObject } from "fabric";
import { Trash2, Bold, Italic, X } from "lucide-react";

interface SettingsProps {
  canvas: Canvas | null;
  activeEdit?: any;
  onClose?: () => void;
  onDeleteText?: () => void;
  onUpdateEdit?: (updates: {
    fontWeight?: string;
    fontStyle?: string;
    fontSize?: number;
    color?: string;
  }) => void;
}

// High-contrast, vibrant sticky note presets with well-defined contrasting borders and dark ink
const STICKY_PRESETS = [
  { name: "Canary Yellow", bg: "#fef08a", border: "#ca8a04", text: "#0f172a" },
  { name: "Lime Mint", bg: "#bbf7d0", border: "#16a34a", text: "#0f172a" },
  { name: "Sky Blue", bg: "#bae6fd", border: "#0284c7", text: "#0f172a" },
  { name: "Rose Pink", bg: "#fbcfe8", border: "#db2777", text: "#0f172a" },
  { name: "Lavender", bg: "#e9d5ff", border: "#9333ea", text: "#0f172a" },
  { name: "Warm Peach", bg: "#fed7aa", border: "#ea580c", text: "#0f172a" },
  { name: "Paper White", bg: "#ffffff", border: "#64748b", text: "#0f172a" },
];

const INK_PRESETS = [
  { name: "Deep Slate", color: "#0f172a" },
  { name: "Pure Black", color: "#000000" },
  { name: "Navy Blue", color: "#1e3a8a" },
  { name: "Dark Green", color: "#14532d" },
  { name: "Crimson", color: "#991b1b" },
];

const ARROW_PRESETS = [
  { name: "Blue", fill: "#2563eb", stroke: "#1d4ed8" },
  { name: "Red", fill: "#dc2626", stroke: "#b91c1c" },
  { name: "Green", fill: "#16a34a", stroke: "#15803d" },
  { name: "Amber", fill: "#d97706", stroke: "#b45309" },
  { name: "Purple", fill: "#9333ea", stroke: "#7e22ce" },
  { name: "Black", fill: "#18181b", stroke: "#09090b" },
];

const SHAPE_FILL_PRESETS = [
  { name: "Blue Tint", fill: "rgba(59, 130, 246, 0.2)", border: "#2563eb" },
  { name: "Red Tint", fill: "rgba(239, 68, 68, 0.2)", border: "#dc2626" },
  { name: "Green Tint", fill: "rgba(34, 197, 94, 0.2)", border: "#16a34a" },
  { name: "Yellow Tint", fill: "rgba(234, 179, 8, 0.2)", border: "#ca8a04" },
  { name: "No Fill", fill: "transparent", border: "#2563eb" },
  { name: "Solid White", fill: "#ffffff", border: "#cbd5e1" },
];

const Settings = ({
  canvas,
  activeEdit,
  onClose,
  onDeleteText,
  onUpdateEdit,
}: SettingsProps) => {
  const [selectedObject, setSelectedObject] = useState<FabricObject | any | null>(null);
  const [width, setWidth] = useState<number | string>("");
  const [height, setHeight] = useState<number | string>("");
  const [diameter, setDiameter] = useState<number | string>("");
  const [fontSize, setFontSize] = useState<number | string>("");
  const [strokeWidth, setStrokeWidth] = useState<number | string>("");
  const [color, setColor] = useState<string>("#0f172a");
  const [bgColor, setBgColor] = useState<string>("#fef08a");
  const [borderColor, setBorderColor] = useState<string>("#ca8a04");

  useEffect(() => {
    if (canvas) {
      canvas.on("selection:created", (e: any) => {
        handleObjectSelection(e.selected?.[0]);
      });
      canvas.on("selection:updated", (e: any) => {
        handleObjectSelection(e.selected?.[0]);
      });
      canvas.on("selection:cleared", () => {
        setSelectedObject(null);
        clearSetting();
      });
      canvas.on("object:modified", (e: any) => {
        handleObjectSelection(e.target);
      });
      canvas.on("object:scaling", (e: any) => {
        handleObjectSelection(e.target);
      });
    }
  }, [canvas]);

  useEffect(() => {
    if (activeEdit && !selectedObject) {
      setFontSize(Math.round(activeEdit.fontSize || 14));
      setColor(activeEdit.color || "#000000");
    }
  }, [activeEdit, selectedObject]);

  const handleObjectSelection = (object: any) => {
    if (!object) return;
    setSelectedObject(object);

    const arrowMatch =
      object.customType === "arrow" ||
      (object.type === "path" && object.fill && object.fill !== "transparent");
    const stickyMatch =
      object.customType === "stickyNote" ||
      (object.type === "textbox" && Boolean(object.backgroundColor));

    if (arrowMatch) {
      setColor(object.fill || object.stroke || "#2563eb");
      setBorderColor(object.stroke || "#1d4ed8");
      setStrokeWidth(Math.round(object.strokeWidth || 1));
      setWidth("");
      setHeight("");
      setDiameter("");
      setFontSize("");
    } else if (stickyMatch) {
      setBgColor(object.backgroundColor || "#fef08a");
      setBorderColor(object.stroke || "#ca8a04");
      setColor(typeof object.fill === "string" ? object.fill : "#0f172a");
      setFontSize(Math.round(object.fontSize || 14));
      setStrokeWidth(Math.round(object.strokeWidth || 2));
      setWidth("");
      setHeight("");
      setDiameter("");
    } else if (object.type === "rect") {
      setWidth(Math.round(object.width * (object.scaleX || 1)));
      setHeight(Math.round(object.height * (object.scaleY || 1)));
      setColor(typeof object.fill === "string" ? object.fill : "rgba(59, 130, 246, 0.2)");
      setBorderColor(object.stroke || "#2563eb");
      setStrokeWidth(Math.round(object.strokeWidth || 2));
      setDiameter("");
      setFontSize("");
    } else if (object.type === "circle") {
      setDiameter(Math.round(object.radius * 2 * (object.scaleX || 1)));
      setColor(typeof object.fill === "string" ? object.fill : "rgba(239, 68, 68, 0.2)");
      setBorderColor(object.stroke || "#dc2626");
      setStrokeWidth(Math.round(object.strokeWidth || 2));
      setWidth("");
      setHeight("");
      setFontSize("");
    } else if (object.type === "path") {
      setColor(object.stroke || "#ef4444");
      setStrokeWidth(Math.round(object.strokeWidth || 4));
      setWidth("");
      setHeight("");
      setDiameter("");
      setFontSize("");
    } else if (
      object.type === "textbox" ||
      object.type === "text" ||
      object.type === "i-text"
    ) {
      setFontSize(Math.round(object.fontSize || 14));
      setColor(typeof object.fill === "string" ? object.fill : "#000000");
      setBgColor(object.backgroundColor || "transparent");
      setWidth("");
      setHeight("");
      setDiameter("");
      setStrokeWidth("");
    }
  };

  const clearSetting = () => {
    setColor("#0f172a");
    setBgColor("#fef08a");
    setBorderColor("#ca8a04");
    setDiameter("");
    setHeight("");
    setWidth("");
    setFontSize("");
    setStrokeWidth("");
  };

  const applyCanvasUpdate = (props: Record<string, any>) => {
    if (!selectedObject || !canvas) return;
    selectedObject.set(props);
    canvas.renderAll();
    canvas.fire("object:modified", { target: selectedObject });
  };

  const isArrow =
    selectedObject?.customType === "arrow" ||
    (selectedObject?.type === "path" &&
      Boolean(selectedObject?.fill) &&
      selectedObject?.fill !== "transparent");

  const isStickyNote =
    selectedObject?.customType === "stickyNote" ||
    (selectedObject?.type === "textbox" &&
      Boolean(selectedObject?.backgroundColor));

  const isRect = selectedObject?.type === "rect";
  const isCircle = selectedObject?.type === "circle";
  const isFreehand = selectedObject?.type === "path" && !isArrow;

  const isTextElement =
    Boolean(activeEdit) ||
    Boolean(
      selectedObject &&
        (selectedObject.type === "textbox" ||
          selectedObject.type === "text" ||
          selectedObject.type === "i-text")
    );

  const isBoldActive = Boolean(
    activeEdit
      ? activeEdit.fontWeight === "bold" ||
          activeEdit.fontWeight === "700" ||
          activeEdit.fontWeight === "800" ||
          activeEdit.fontWeight === "900" ||
          activeEdit.fontWeight === "bolder"
      : selectedObject &&
          (selectedObject.fontWeight === "bold" ||
            selectedObject.fontWeight === 700 ||
            selectedObject.fontWeight === "700" ||
            selectedObject.fontWeight === 500)
  );

  const isItalicActive = Boolean(
    activeEdit
      ? activeEdit.fontStyle === "italic" || activeEdit.fontStyle === "oblique"
      : selectedObject &&
          (selectedObject.fontStyle === "italic" ||
            selectedObject.fontStyle === "oblique")
  );

  const toggleBold = () => {
    const nextBold = isBoldActive ? "normal" : "bold";
    if (activeEdit && onUpdateEdit) {
      onUpdateEdit({ fontWeight: nextBold });
    } else if (selectedObject && canvas) {
      applyCanvasUpdate({ fontWeight: nextBold });
    }
  };

  const toggleItalic = () => {
    const nextItalic = isItalicActive ? "normal" : "italic";
    if (activeEdit && onUpdateEdit) {
      onUpdateEdit({ fontStyle: nextItalic });
    } else if (selectedObject && canvas) {
      applyCanvasUpdate({ fontStyle: nextItalic });
    }
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");
    const initValue = parseInt(value, 10);
    setWidth(isNaN(initValue) ? "" : initValue);

    if (
      selectedObject &&
      selectedObject.type === "rect" &&
      !isNaN(initValue) &&
      initValue >= 0
    ) {
      applyCanvasUpdate({ width: initValue / (selectedObject.scaleX || 1) });
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");
    const initValue = parseInt(value, 10);
    setHeight(isNaN(initValue) ? "" : initValue);

    if (
      selectedObject &&
      selectedObject.type === "rect" &&
      !isNaN(initValue) &&
      initValue >= 0
    ) {
      applyCanvasUpdate({ height: initValue / (selectedObject.scaleY || 1) });
    }
  };

  const handleDiameterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");
    const initValue = parseInt(value, 10);
    setDiameter(isNaN(initValue) ? "" : initValue);

    if (
      selectedObject &&
      selectedObject.type === "circle" &&
      !isNaN(initValue) &&
      initValue >= 0
    ) {
      applyCanvasUpdate({
        radius: initValue / 2 / (selectedObject.scaleX || 1),
      });
    }
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");
    const initValue = parseInt(value, 10);
    setFontSize(isNaN(initValue) ? "" : initValue);

    if (!isNaN(initValue) && initValue > 0) {
      if (activeEdit && onUpdateEdit) {
        onUpdateEdit({ fontSize: initValue });
      } else if (selectedObject) {
        applyCanvasUpdate({ fontSize: initValue });
      }
    }
  };

  const handleStrokeWidthChange = (val: number) => {
    setStrokeWidth(val);
    applyCanvasUpdate({ strokeWidth: val });
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    if (activeEdit && onUpdateEdit) {
      onUpdateEdit({ color: newColor });
    } else if (selectedObject) {
      if (isArrow) {
        applyCanvasUpdate({ fill: newColor, stroke: newColor });
      } else if (isFreehand) {
        applyCanvasUpdate({ stroke: newColor });
      } else {
        applyCanvasUpdate({ fill: newColor });
      }
    }
  };

  const handleBgColorChange = (newBg: string) => {
    setBgColor(newBg);
    applyCanvasUpdate({ backgroundColor: newBg });
  };

  const handleBorderColorChange = (newBorder: string) => {
    setBorderColor(newBorder);
    applyCanvasUpdate({ stroke: newBorder });
  };

  if (!selectedObject && !activeEdit) {
    return null;
  }

  const getHeaderTitle = () => {
    if (activeEdit) return "Text Box";
    if (isStickyNote) return "Sticky Note";
    if (isArrow) return "Arrow";
    if (isRect) return "Rectangle";
    if (isCircle) return "Circle";
    if (isFreehand) return "Drawing Stroke";
    return "Object";
  };

  return (
    <div
      data-settings-panel="true"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 bg-white/95 backdrop-blur-md text-[#37352F] p-4 rounded-xl border border-[#37352F]/15 shadow-[0_4px_20px_rgba(15,15,15,0.08),0_1px_3px_rgba(15,15,15,0.04)] w-[235px] max-h-[85vh] overflow-y-auto text-left z-50 select-none"
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#37352F]/10 pb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#787774]">
          {getHeaderTitle()} Properties
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (activeEdit) {
              onClose?.();
            } else if (canvas && selectedObject) {
              canvas.discardActiveObject();
              canvas.renderAll();
              setSelectedObject(null);
              clearSetting();
            }
          }}
          className="text-[#9B9A97] hover:text-[#37352F] p-0.5 rounded hover:bg-[#37352F]/5 transition cursor-pointer"
          title="Close panel"
        >
          <X size={14} />
        </button>
      </div>

      {/* 1. HIGH-CONTRAST STICKY NOTE CONTROLS */}
      {isStickyNote && (
        <div className="flex flex-col gap-3">
          {/* Note Color Presets */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-[#787774]">
              Note Color & Outline
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {STICKY_PRESETS.map((p) => {
                const isSelected = bgColor.toLowerCase() === p.bg.toLowerCase();
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setBgColor(p.bg);
                      setBorderColor(p.border);
                      setColor(p.text);
                      applyCanvasUpdate({
                        backgroundColor: p.bg,
                        stroke: p.border,
                        strokeWidth: strokeWidth || 2,
                        fill: p.text,
                      });
                    }}
                    className={`w-5 h-5 rounded-full border-2 transition cursor-pointer ${
                      isSelected
                        ? "ring-2 ring-[#2383E2] scale-110 shadow-xs"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: p.bg, borderColor: p.border }}
                    title={`${p.name} (High Contrast)`}
                  />
                );
              })}
            </div>
          </div>

          {/* Border Width (Outline Thickness) */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-[#787774]">
              Outline Thickness
            </label>
            <div className="flex items-center gap-1">
              {[
                { w: 1, label: "Fine" },
                { w: 2, label: "Medium" },
                { w: 3, label: "Bold" },
                { w: 4, label: "Thick" },
              ].map((item) => (
                <button
                  key={item.w}
                  type="button"
                  onClick={() => handleStrokeWidthChange(item.w)}
                  className={`flex-1 py-1 rounded text-[11px] font-medium border transition cursor-pointer ${
                    strokeWidth === item.w
                      ? "bg-[#242424] text-white border-[#242424] shadow-xs"
                      : "bg-[#F7F6F3] text-[#787774] border-[#37352F]/12 hover:text-[#37352F]"
                  }`}
                  title={`${item.label} outline (${item.w}px)`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Border Outline Color */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-[#787774]">
              Outline Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={borderColor.startsWith("#") ? borderColor : "#ca8a04"}
                onChange={(e) => handleBorderColorChange(e.target.value)}
                className="w-6 h-6 rounded border border-[#37352F]/15 cursor-pointer bg-transparent p-0"
              />
              <input
                type="text"
                value={borderColor}
                onChange={(e) => handleBorderColorChange(e.target.value)}
                className="flex-1 bg-[#F7F6F3] border border-[#37352F]/12 rounded-md px-2 py-0.5 text-xs text-[#37352F] uppercase focus:outline-none focus:border-[#2383E2] font-mono"
              />
            </div>
          </div>

          {/* Custom Background Color */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-[#787774]">
              Custom Note Tint
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor.startsWith("#") ? bgColor : "#fef08a"}
                onChange={(e) => handleBgColorChange(e.target.value)}
                className="w-6 h-6 rounded border border-[#37352F]/15 cursor-pointer bg-transparent p-0"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => handleBgColorChange(e.target.value)}
                className="flex-1 bg-[#F7F6F3] border border-[#37352F]/12 rounded-md px-2 py-0.5 text-xs text-[#37352F] uppercase focus:outline-none focus:border-[#2383E2] font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. ARROW CONTROLS */}
      {isArrow && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-[#787774]">
              Arrow Color
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {ARROW_PRESETS.map((p) => {
                const isSelected = color.toLowerCase() === p.fill.toLowerCase();
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setColor(p.fill);
                      setBorderColor(p.stroke);
                      applyCanvasUpdate({
                        fill: p.fill,
                        stroke: p.stroke,
                      });
                    }}
                    className={`w-5 h-5 rounded-full border transition cursor-pointer ${
                      isSelected
                        ? "ring-2 ring-[#2383E2] scale-110 shadow-xs"
                        : "border-black/10 hover:scale-105"
                    }`}
                    style={{ backgroundColor: p.fill }}
                    title={p.name}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. RECTANGLE CONTROLS */}
      {isRect && (
        <div className="flex flex-col gap-3">
          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[#787774]">
                Width (px)
              </label>
              <input
                type="number"
                value={width}
                onChange={handleWidthChange}
                className="w-full bg-[#F7F6F3] border border-[#37352F]/12 rounded-md px-2 py-1 text-xs text-[#37352F] focus:outline-none focus:border-[#2383E2]"
                placeholder="140"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[#787774]">
                Height (px)
              </label>
              <input
                type="number"
                value={height}
                onChange={handleHeightChange}
                className="w-full bg-[#F7F6F3] border border-[#37352F]/12 rounded-md px-2 py-1 text-xs text-[#37352F] focus:outline-none focus:border-[#2383E2]"
                placeholder="90"
              />
            </div>
          </div>

          {/* Style Presets */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-[#787774]">
              Preset Styles
            </label>
            <div className="grid grid-cols-3 gap-1">
              {SHAPE_FILL_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    setColor(p.fill);
                    setBorderColor(p.border);
                    applyCanvasUpdate({ fill: p.fill, stroke: p.border });
                  }}
                  className="px-1.5 py-1 rounded text-[10px] font-medium border border-[#37352F]/12 hover:bg-[#F7F6F3] transition cursor-pointer truncate"
                  title={p.name}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Border Width */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-[#787774]">
              Border Width
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 4, 8].map((bw) => (
                <button
                  key={bw}
                  type="button"
                  onClick={() => handleStrokeWidthChange(bw)}
                  className={`flex-1 py-0.5 rounded text-xs font-medium border transition cursor-pointer ${
                    strokeWidth === bw
                      ? "bg-[#242424] text-white border-[#242424]"
                      : "bg-[#F7F6F3] text-[#787774] border-[#37352F]/12 hover:text-[#37352F]"
                  }`}
                >
                  {bw}px
                </button>
              ))}
            </div>
          </div>

          {/* Border Color */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-[#787774]">
              Border Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={borderColor.startsWith("#") ? borderColor : "#2563eb"}
                onChange={(e) => handleBorderColorChange(e.target.value)}
                className="w-6 h-6 rounded border border-[#37352F]/15 cursor-pointer bg-transparent p-0"
              />
              <input
                type="text"
                value={borderColor}
                onChange={(e) => handleBorderColorChange(e.target.value)}
                className="flex-1 bg-[#F7F6F3] border border-[#37352F]/12 rounded-md px-2 py-0.5 text-xs text-[#37352F] uppercase focus:outline-none focus:border-[#2383E2] font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. CIRCLE CONTROLS */}
      {isCircle && (
        <div className="flex flex-col gap-3">
          {/* Diameter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-[#787774]">
              Diameter (px)
            </label>
            <input
              type="number"
              value={diameter}
              onChange={handleDiameterChange}
              className="w-full bg-[#F7F6F3] border border-[#37352F]/12 rounded-md px-2 py-1 text-xs text-[#37352F] focus:outline-none focus:border-[#2383E2]"
              placeholder="90"
            />
          </div>

          {/* Style Presets */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-[#787774]">
              Preset Styles
            </label>
            <div className="grid grid-cols-3 gap-1">
              {SHAPE_FILL_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    setColor(p.fill);
                    setBorderColor(p.border);
                    applyCanvasUpdate({ fill: p.fill, stroke: p.border });
                  }}
                  className="px-1.5 py-1 rounded text-[10px] font-medium border border-[#37352F]/12 hover:bg-[#F7F6F3] transition cursor-pointer truncate"
                  title={p.name}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Border Width */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-[#787774]">
              Border Width
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 4, 8].map((bw) => (
                <button
                  key={bw}
                  type="button"
                  onClick={() => handleStrokeWidthChange(bw)}
                  className={`flex-1 py-0.5 rounded text-xs font-medium border transition cursor-pointer ${
                    strokeWidth === bw
                      ? "bg-[#242424] text-white border-[#242424]"
                      : "bg-[#F7F6F3] text-[#787774] border-[#37352F]/12 hover:text-[#37352F]"
                  }`}
                >
                  {bw}px
                </button>
              ))}
            </div>
          </div>

          {/* Border Color */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-[#787774]">
              Border Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={borderColor.startsWith("#") ? borderColor : "#dc2626"}
                onChange={(e) => handleBorderColorChange(e.target.value)}
                className="w-6 h-6 rounded border border-[#37352F]/15 cursor-pointer bg-transparent p-0"
              />
              <input
                type="text"
                value={borderColor}
                onChange={(e) => handleBorderColorChange(e.target.value)}
                className="flex-1 bg-[#F7F6F3] border border-[#37352F]/12 rounded-md px-2 py-0.5 text-xs text-[#37352F] uppercase focus:outline-none focus:border-[#2383E2] font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. DRAWING STROKE CONTROLS */}
      {isFreehand && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-[#787774]">
              Stroke Width (px)
            </label>
            <div className="flex items-center gap-1">
              {[2, 4, 8, 16].map((bw) => (
                <button
                  key={bw}
                  type="button"
                  onClick={() => handleStrokeWidthChange(bw)}
                  className={`flex-1 py-0.5 rounded text-xs font-medium border transition cursor-pointer ${
                    strokeWidth === bw
                      ? "bg-[#242424] text-white border-[#242424]"
                      : "bg-[#F7F6F3] text-[#787774] border-[#37352F]/12 hover:text-[#37352F]"
                  }`}
                >
                  {bw}px
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TEXT FORMATTING (Bold, Italic, Font Size) - for Sticky Notes and Text Blocks */}
      {isTextElement && (
        <div className="flex flex-col gap-3 pt-1 border-t border-[#37352F]/10">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-[#787774]">
              Formatting
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleBold}
                className={`flex-1 py-1 px-2.5 rounded-md border text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  isBoldActive
                    ? "bg-[#242424] text-white border-[#242424] shadow-xs"
                    : "bg-[#F7F6F3] text-[#787774] border-[#37352F]/12 hover:bg-[#EFEFED] hover:text-[#37352F]"
                }`}
                title="Toggle Bold"
              >
                <Bold size={12} />
                <span>Bold</span>
              </button>
              <button
                type="button"
                onClick={toggleItalic}
                className={`flex-1 py-1 px-2.5 rounded-md border text-xs italic transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  isItalicActive
                    ? "bg-[#242424] text-white border-[#242424] shadow-xs"
                    : "bg-[#F7F6F3] text-[#787774] border-[#37352F]/12 hover:bg-[#EFEFED] hover:text-[#37352F]"
                }`}
                title="Toggle Italic"
              >
                <Italic size={12} />
                <span>Italic</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-[#787774]">
              Font Size (px)
            </label>
            <input
              type="number"
              min={8}
              max={120}
              value={fontSize}
              onChange={handleFontSizeChange}
              className="w-full bg-[#F7F6F3] border border-[#37352F]/12 rounded-md px-2.5 py-1 text-xs text-[#37352F] placeholder-[#9B9A97] focus:outline-none focus:border-[#2383E2] focus:bg-white transition"
              placeholder="14"
            />
          </div>

          {/* Quick Ink Presets for text / sticky note */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-[#787774]">
              High-Contrast Ink
            </label>
            <div className="flex items-center gap-1.5">
              {INK_PRESETS.map((ink) => (
                <button
                  key={ink.name}
                  type="button"
                  onClick={() => handleColorChange(ink.color)}
                  className={`w-4 h-4 rounded-full border transition cursor-pointer ${
                    color.toLowerCase() === ink.color.toLowerCase()
                      ? "ring-2 ring-[#2383E2] scale-110 shadow-xs"
                      : "border-black/20 hover:scale-105"
                  }`}
                  style={{ backgroundColor: ink.color }}
                  title={ink.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PRIMARY COLOR INPUT (Text Color for text/sticky, or Stroke/Fill for shapes) */}
      <div className="flex flex-col gap-1 pt-1 border-t border-[#37352F]/10">
        <label className="text-[11px] font-medium text-[#787774]">
          {isTextElement
            ? "Text Ink Color"
            : isArrow
            ? "Arrow Color"
            : isFreehand
            ? "Stroke Color"
            : "Fill Color"}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color.startsWith("#") ? color : "#0f172a"}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-6 h-6 rounded border border-[#37352F]/15 cursor-pointer bg-transparent p-0"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="flex-1 bg-[#F7F6F3] border border-[#37352F]/12 rounded-md px-2 py-0.5 text-xs text-[#37352F] uppercase focus:outline-none focus:border-[#2383E2] font-mono"
            placeholder="#0f172a"
          />
        </div>
      </div>

      {/* DELETE BUTTON */}
      <div className="pt-2 border-t border-[#37352F]/10">
        <button
          type="button"
          onClick={() => {
            if (activeEdit && onDeleteText) {
              onDeleteText();
            } else if (canvas && selectedObject) {
              canvas.remove(selectedObject);
              canvas.discardActiveObject();
              canvas.renderAll();
              canvas.fire("object:removed", { target: selectedObject });
              setSelectedObject(null);
              clearSetting();
            }
          }}
          disabled={!activeEdit && !selectedObject}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-red-50 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed text-red-600 border border-red-200/80 rounded-md text-xs font-medium transition cursor-pointer"
          title="Delete selected item"
        >
          <Trash2 size={13} />
          <span>
            {activeEdit
              ? "Delete Text Box"
              : isStickyNote
              ? "Delete Sticky Note (⌫)"
              : isArrow
              ? "Delete Arrow (⌫)"
              : isRect
              ? "Delete Rectangle (⌫)"
              : isCircle
              ? "Delete Circle (⌫)"
              : isFreehand
              ? "Delete Stroke (⌫)"
              : "Delete Object (⌫)"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Settings;

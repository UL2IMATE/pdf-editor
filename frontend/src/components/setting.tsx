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

const Settings = ({
  canvas,
  activeEdit,
  onClose,
  onDeleteText,
  onUpdateEdit,
}: SettingsProps) => {
  const [selectedObject, setSelectedObject] = useState<
    FabricObject | any | null
  >(null);
  const [width, setWidth] = useState<number | string>("");
  const [height, setHeight] = useState<number | string>("");
  const [diameter, setDiameter] = useState<number | string>("");
  const [fontSize, setFontSize] = useState<number | string>("");
  const [strokeWidth, setStrokeWidth] = useState<number | string>("");
  const [color, setColor] = useState<string>("#3b82f6");

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

    if (object.type === "path") {
      setColor(object.stroke || "#ef4444");
      setStrokeWidth(Math.round(object.strokeWidth || 4));
      setWidth("");
      setHeight("");
      setDiameter("");
      setFontSize("");
    } else {
      const fillColor =
        typeof object.fill === "string" ? object.fill : "#3b82f6";
      setColor(fillColor);

      if (object.type === "rect") {
        setWidth(Math.round(object.width * (object.scaleX || 1)));
        setHeight(Math.round(object.height * (object.scaleY || 1)));
        setDiameter("");
        setFontSize("");
        setStrokeWidth("");
      } else if (object.type === "circle") {
        setDiameter(Math.round(object.radius * 2 * (object.scaleX || 1)));
        setHeight("");
        setWidth("");
        setFontSize("");
        setStrokeWidth("");
      } else if (
        object.type === "textbox" ||
        object.type === "text" ||
        object.type === "i-text"
      ) {
        setFontSize(Math.round(object.fontSize || 20));
        setWidth("");
        setHeight("");
        setDiameter("");
        setStrokeWidth("");
      }
    }
  };

  const clearSetting = () => {
    setColor("#3b82f6");
    setDiameter("");
    setHeight("");
    setWidth("");
    setFontSize("");
    setStrokeWidth("");
  };

  const isTextSelected =
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
            selectedObject.fontWeight === "700")
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
      selectedObject.set({ fontWeight: nextBold });
      canvas.renderAll();
    }
  };

  const toggleItalic = () => {
    const nextItalic = isItalicActive ? "normal" : "italic";
    if (activeEdit && onUpdateEdit) {
      onUpdateEdit({ fontStyle: nextItalic });
    } else if (selectedObject && canvas) {
      selectedObject.set({ fontStyle: nextItalic });
      canvas.renderAll();
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
      selectedObject.set({ width: initValue / (selectedObject.scaleX || 1) });
      canvas?.renderAll();
    }
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");
    const initValue = parseInt(value, 10);
    setFontSize(isNaN(initValue) ? "" : initValue);

    if (!isNaN(initValue) && initValue > 0) {
      if (activeEdit && onUpdateEdit) {
        onUpdateEdit({ fontSize: initValue });
      } else if (
        selectedObject &&
        (selectedObject.type === "textbox" ||
          selectedObject.type === "text" ||
          selectedObject.type === "i-text")
      ) {
        selectedObject.set({ fontSize: initValue });
        canvas?.renderAll();
      }
    }
  };

  const handleStrokeWidthChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/,/g, "");
    const initValue = parseInt(value, 10);
    setStrokeWidth(isNaN(initValue) ? "" : initValue);

    if (
      selectedObject &&
      selectedObject.type === "path" &&
      !isNaN(initValue) &&
      initValue > 0
    ) {
      selectedObject.set({ strokeWidth: initValue });
      canvas?.renderAll();
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
      selectedObject.set({ height: initValue / (selectedObject.scaleY || 1) });
      canvas?.renderAll();
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
      selectedObject.set({
        radius: initValue / 2 / (selectedObject.scaleX || 1),
      });
      canvas?.renderAll();
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setColor(value);

    if (activeEdit && onUpdateEdit) {
      onUpdateEdit({ color: value });
    } else if (selectedObject) {
      if (selectedObject.type === "path") {
        selectedObject.set({ stroke: value });
      } else {
        selectedObject.set({ fill: value });
      }
      canvas?.renderAll();
    }
  };

  if (!selectedObject && !activeEdit) {
    return null;
  }

  return (
    <div
      data-settings-panel="true"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3.5 bg-white/95 backdrop-blur-md text-[#37352F] p-4 rounded-xl border border-[#37352F]/15 shadow-[0_4px_20px_rgba(15,15,15,0.08),0_1px_3px_rgba(15,15,15,0.04)] min-w-[210px] text-left z-50 select-none"
    >
      <div className="flex items-center justify-between border-b border-[#37352F]/10 pb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#787774]">
          {activeEdit
            ? "Text Properties"
            : selectedObject?.type === "rect"
            ? "Rectangle"
            : selectedObject?.type === "circle"
            ? "Circle"
            : selectedObject?.type === "path"
            ? "Drawing Stroke"
            : isTextSelected
            ? "Text"
            : "Shape"}{" "}
          Properties
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

      {/* Formatting buttons for Text (Bold, Italic) */}
      {isTextSelected && (
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
      )}

      {selectedObject?.type === "rect" && (
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-[#787774]">
              Width (px)
            </label>
            <input
              type="number"
              value={width}
              onChange={handleWidthChange}
              className="w-full bg-[#F7F6F3] border border-[#37352F]/12 rounded-md px-2.5 py-1.5 text-xs text-[#37352F] placeholder-[#9B9A97] focus:outline-none focus:border-[#2383E2] focus:bg-white transition"
              placeholder="e.g. 100"
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
              className="w-full bg-[#F7F6F3] border border-[#37352F]/12 rounded-md px-2.5 py-1.5 text-xs text-[#37352F] placeholder-[#9B9A97] focus:outline-none focus:border-[#2383E2] focus:bg-white transition"
              placeholder="e.g. 60"
            />
          </div>
        </div>
      )}

      {selectedObject?.type === "circle" && (
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-[#787774]">
            Diameter (px)
          </label>
          <input
            type="number"
            value={diameter}
            onChange={handleDiameterChange}
            className="w-full bg-[#F7F6F3] border border-[#37352F]/12 rounded-md px-2.5 py-1.5 text-xs text-[#37352F] placeholder-[#9B9A97] focus:outline-none focus:border-[#2383E2] focus:bg-white transition"
            placeholder="e.g. 100"
          />
        </div>
      )}

      {selectedObject?.type === "path" && (
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-[#787774]">
            Stroke Width (px)
          </label>
          <input
            type="number"
            min={1}
            max={60}
            value={strokeWidth}
            onChange={handleStrokeWidthChange}
            className="w-full bg-[#F7F6F3] border border-[#37352F]/12 rounded-md px-2.5 py-1.5 text-xs text-[#37352F] placeholder-[#9B9A97] focus:outline-none focus:border-[#2383E2] focus:bg-white transition"
            placeholder="e.g. 4"
          />
        </div>
      )}

      {isTextSelected && (
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-[#787774]">
            Font Size (px)
          </label>
          <input
            type="number"
            value={fontSize}
            onChange={handleFontSizeChange}
            className="w-full bg-[#F7F6F3] border border-[#37352F]/12 rounded-md px-2.5 py-1.5 text-xs text-[#37352F] placeholder-[#9B9A97] focus:outline-none focus:border-[#2383E2] focus:bg-white transition"
            placeholder="e.g. 14"
          />
        </div>
      )}

      <div className="flex flex-col gap-1 pt-0.5">
        <label className="text-[11px] font-medium text-[#787774]">
          {selectedObject?.type === "path" ? "Stroke Color" : "Color"}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color.startsWith("#") ? color : "#3b82f6"}
            onChange={handleColorChange}
            className="w-7 h-7 rounded border border-[#37352F]/15 cursor-pointer bg-transparent p-0"
          />
          <input
            type="text"
            value={color}
            onChange={handleColorChange}
            className="flex-1 bg-[#F7F6F3] border border-[#37352F]/12 rounded-md px-2.5 py-1 text-xs text-[#37352F] uppercase focus:outline-none focus:border-[#2383E2] focus:bg-white font-mono"
            placeholder="#3b82f6"
          />
        </div>
      </div>

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
              : selectedObject?.type === "path"
              ? "Delete Stroke"
              : "Delete Shape (⌫)"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Settings;

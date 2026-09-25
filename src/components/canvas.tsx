import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Square,
  Circle,
  Type,
  FileText,
  Check,
  Move,
  Trash2,
  Bold,
  Italic,
  Paintbrush,
  Highlighter,
  Eraser,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Canvas as FabricCanvas,
  Rect,
  Circle as FabricCircle,
  PencilBrush,
} from "fabric";
import Settings from "./setting";
import {
  exportPdfWithAnnotations,
  downloadPdfBlob,
} from "../utils/pdfExport";
import {
  extractBlocks,
  type TextBlock,
} from "../services/api";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface TextEdit {
  id: string;
  originalText: string;
  text: string;
  x: number; // PDF coordinates at scale = 1
  y: number; // PDF coordinates at scale = 1 (top of text box)
  baselineY: number; // PDF baseline coordinates at scale = 1
  originalX?: number; // Starting X coordinate of original PDF text
  originalY?: number; // Starting Y coordinate of original PDF text
  originalWidth?: number;
  originalHeight?: number;
  width: number;
  height: number;
  fontSize: number; // Exact point size (e.g. 7.2, 8.6, 11.5, 16.0)
  fontFamily: string; // Matched CSS font stack
  fontWeight: string; // 'bold' | '600' | 'normal'
  fontStyle: string; // 'italic' | 'normal'
  pdfFontType: "serif" | "mono" | "sans";
  ascent: number;
  descent: number;
  color: string;
  bgColor: string;
  isCustom?: boolean;
}

export interface DetailedTextBlock extends TextBlock {
  id: string;
  baselineY: number;
  pdfFontType: "serif" | "mono" | "sans";
  ascent: number;
  descent: number;
}

export const isBoldWeight = (weight?: string): boolean => {
  if (!weight) return false;
  const w = weight.toLowerCase();
  return (
    w === "bold" ||
    w === "700" ||
    w === "800" ||
    w === "900" ||
    w === "bolder"
  );
};

export const isItalicStyle = (style?: string): boolean => {
  if (!style) return false;
  const s = style.toLowerCase();
  return s === "italic" || s === "oblique";
};

export function parsePdfFontName(
  rawName?: string,
  styleFamily?: string
): {
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  cleanName: string;
  pdfFontType: "serif" | "mono" | "sans";
} {
  let name = rawName || "";
  // Strip 6-letter subset prefix like "LZWAFW+" or "ABCDEF+"
  if (name.includes("+")) {
    name = name.split("+")[1];
  }

  const combined = `${name} ${styleFamily || ""}`.toLowerCase();

  // 1. Detect Font Weight
  let fontWeight = "normal";
  if (
    combined.includes("bold") ||
    combined.includes("heavy") ||
    combined.includes("black") ||
    combined.includes("bolder") ||
    combined.includes("-b") ||
    combined.includes("700") ||
    combined.includes("800") ||
    combined.includes("900")
  ) {
    fontWeight = "bold";
  } else if (
    combined.includes("medium") ||
    combined.includes("semibold") ||
    combined.includes("semi-bold") ||
    combined.includes("600") ||
    combined.includes("500")
  ) {
    fontWeight = "600";
  } else if (
    combined.includes("light") ||
    combined.includes("300") ||
    combined.includes("thin") ||
    combined.includes("100")
  ) {
    fontWeight = "300";
  }

  // 2. Detect Font Style
  let fontStyle = "normal";
  if (
    combined.includes("italic") ||
    combined.includes("oblique") ||
    combined.includes("-it") ||
    combined.includes("-obl")
  ) {
    fontStyle = "italic";
  }

  // 3. Detect Font Family Stack
  let fontFamily = "Arial, Helvetica, sans-serif";
  let pdfFontType: "serif" | "mono" | "sans" = "sans";

  if (
    combined.includes("mono") ||
    combined.includes("courier") ||
    combined.includes("console") ||
    combined.includes("menlo") ||
    combined.includes("code") ||
    combined.includes("monospace")
  ) {
    pdfFontType = "mono";
    if (combined.includes("noto")) {
      fontFamily = "'Noto Sans Mono', 'Courier New', Courier, Menlo, Consolas, monospace";
    } else if (combined.includes("courier")) {
      fontFamily = "'Courier New', Courier, monospace";
    } else {
      fontFamily = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace";
    }
  } else if (
    combined.includes("times") ||
    combined.includes("roman") ||
    combined.includes("georgia") ||
    combined.includes("garamond") ||
    combined.includes("baskerville") ||
    (combined.includes("serif") && !combined.includes("sans"))
  ) {
    pdfFontType = "serif";
    fontFamily = "'Times New Roman', Times, Georgia, Cambria, serif";
  } else if (
    combined.includes("nimbus") ||
    combined.includes("helvetica")
  ) {
    pdfFontType = "sans";
    fontFamily = "'Nimbus Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  } else if (combined.includes("calibri")) {
    pdfFontType = "sans";
    fontFamily = "Calibri, Candara, 'Segoe UI', Arial, sans-serif";
  } else if (combined.includes("arial")) {
    pdfFontType = "sans";
    fontFamily = "Arial, 'Helvetica Neue', Helvetica, sans-serif";
  } else if (combined.includes("roboto")) {
    pdfFontType = "sans";
    fontFamily = "Roboto, 'Helvetica Neue', Arial, sans-serif";
  } else if (combined.includes("verdana")) {
    pdfFontType = "sans";
    fontFamily = "Verdana, Geneva, sans-serif";
  } else if (combined.includes("trebuchet")) {
    pdfFontType = "sans";
    fontFamily = "'Trebuchet MS', 'Lucida Sans', sans-serif";
  } else if (
    styleFamily &&
    styleFamily !== "sans-serif" &&
    styleFamily !== "serif"
  ) {
    fontFamily = styleFamily;
  }

  return { fontFamily, fontWeight, fontStyle, cleanName: name, pdfFontType };
}

export function normalizeTextColor(color?: string): string {
  if (!color) return "#000000";
  const c = color.trim().toLowerCase();
  if (c === "#000000" || c === "black" || c === "#000") return "#000000";
  if (c.startsWith("#") && c.length === 7) {
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const isNeutral =
        Math.abs(r - g) < 25 && Math.abs(g - b) < 25 && Math.abs(r - b) < 25;
      // If it's a dark neutral tone (which happens when anti-aliased edge pixels are averaged),
      // snap to pure black #000000 to match the original sharp document text
      if (isNeutral && lum < 125) {
        return "#000000";
      }
    }
  }
  return color;
}

function sampleTextAndBgColor(
  canvas: HTMLCanvasElement | null,
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number
): { textColor: string; bgColor: string } {
  if (!canvas) return { textColor: "#000000", bgColor: "#ffffff" };
  try {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return { textColor: "#000000", bgColor: "#ffffff" };

    const dpr = window.devicePixelRatio || 1;
    const sx = Math.max(0, Math.floor(x * scale * dpr));
    const sy = Math.max(0, Math.floor(y * scale * dpr));
    const sw = Math.min(
      canvas.width - sx,
      Math.max(1, Math.ceil(width * scale * dpr))
    );
    const sh = Math.min(
      canvas.height - sy,
      Math.max(1, Math.ceil(height * scale * dpr))
    );

    if (sw <= 0 || sh <= 0) return { textColor: "#000000", bgColor: "#ffffff" };

    const imgData = ctx.getImageData(sx, sy, sw, sh);
    const data = imgData.data;

    // 1. Determine background color by sampling the 4 corners
    const cornerIndices = [
      0,
      Math.max(0, (sw - 1) * 4),
      Math.max(0, (sh - 1) * sw * 4),
      Math.max(0, ((sh - 1) * sw + (sw - 1)) * 4),
    ];

    let bgR = 255,
      bgG = 255,
      bgB = 255;
    let maxBright = -1;
    for (const idx of cornerIndices) {
      if (idx < data.length - 3 && data[idx + 3] > 128) {
        const bright = data[idx] + data[idx + 1] + data[idx + 2];
        if (bright > maxBright) {
          maxBright = bright;
          bgR = data[idx];
          bgG = data[idx + 1];
          bgB = data[idx + 2];
        }
      }
    }

    const isBgWhite = bgR > 235 && bgG > 235 && bgB > 235;
    const bgColor = isBgWhite
      ? "#ffffff"
      : `#${bgR.toString(16).padStart(2, "0")}${bgG
          .toString(16)
          .padStart(2, "0")}${bgB.toString(16).padStart(2, "0")}`;

    // 2. Collect high-contrast text ink pixels
    type Candidate = { r: number; g: number; b: number; dist: number };
    const candidates: Candidate[] = [];

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const dist = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
      if (dist > 40) {
        candidates.push({ r, g, b, dist });
      }
    }

    if (candidates.length === 0) {
      return { textColor: "#000000", bgColor };
    }

    // Sort by contrast distance descending (core ink pixels with highest contrast first)
    candidates.sort((a, b) => b.dist - a.dist);

    // Take the top 10% highest-contrast core pixels (minimum 1, maximum 50)
    const sampleCount = Math.max(
      1,
      Math.min(50, Math.ceil(candidates.length * 0.1))
    );
    let sumR = 0,
      sumG = 0,
      sumB = 0;
    for (let i = 0; i < sampleCount; i++) {
      sumR += candidates[i].r;
      sumG += candidates[i].g;
      sumB += candidates[i].b;
    }

    const inkR = Math.round(sumR / sampleCount);
    const inkG = Math.round(sumG / sampleCount);
    const inkB = Math.round(sumB / sampleCount);

    // If dark ink (luminance < 110 or individual components < 95), snap to solid black #000000
    const luminance = 0.299 * inkR + 0.587 * inkG + 0.114 * inkB;
    if (luminance < 110 || (inkR < 95 && inkG < 95 && inkB < 95)) {
      return { textColor: "#000000", bgColor };
    }

    return {
      textColor: `#${inkR.toString(16).padStart(2, "0")}${inkG
        .toString(16)
        .padStart(2, "0")}${inkB.toString(16).padStart(2, "0")}`,
      bgColor,
    };
  } catch (err) {
    console.warn("Could not sample colors from canvas:", err);
    return { textColor: "#000000", bgColor: "#ffffff" };
  }
}

export type CanvasHandle = {
  exportDocument: () => Promise<void>;
};

type CanvasProps = {
  pageNumber: number;
  pdfUrl?: string;
  pdfFile?: File;
  onLoadSuccess?: (numPages: number) => void;
  onPageRenderingChange?: (rendering: boolean) => void;
};

export const Canvas = forwardRef<CanvasHandle, CanvasProps>(function Canvas(
  { pageNumber, pdfUrl, pdfFile, onLoadSuccess, onPageRenderingChange },
  ref
) {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onLoadSuccessRef = useRef(onLoadSuccess);
  onLoadSuccessRef.current = onLoadSuccess;

  const onPageRenderingChangeRef = useRef(onPageRenderingChange);
  onPageRenderingChangeRef.current = onPageRenderingChange;

  const [scale, setScale] = useState(1.5);
  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricInstanceRef = useRef<FabricCanvas | null>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  // Extracted original document text blocks (with detailed typography)
  const [extractedPages, setExtractedPages] = useState<{
    pageNumber: number;
    width: number;
    height: number;
    blocks: DetailedTextBlock[];
  }[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showDetectedBlocks, setShowDetectedBlocks] = useState(false);

  // MS Word-style text edits (persisted per page)
  const [pageEdits, setPageEdits] = useState<Record<number, TextEdit[]>>({});
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const activeInputRef = useRef<HTMLInputElement | null>(null);



  // Painter / Freehand Drawing state & Eraser
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isEraserMode, setIsEraserMode] = useState(false);
  const [brushColor, setBrushColor] = useState("#ef4444");
  const [brushWidth, setBrushWidth] = useState(4);
  const [isHighlighter, setIsHighlighter] = useState(false);

  // Page rendering spinner state
  const [isPageRendering, setIsPageRendering] = useState(false);

  const handleToggleBold = (editId: string) => {
    setPageEdits((prev) => ({
      ...prev,
      [pageNumber]: (prev[pageNumber] || []).map((item) => {
        if (item.id !== editId) return item;
        const currentlyBold = isBoldWeight(item.fontWeight);
        return {
          ...item,
          fontWeight: currentlyBold ? "normal" : "bold",
        };
      }),
    }));
  };

  const handleToggleItalic = (editId: string) => {
    setPageEdits((prev) => ({
      ...prev,
      [pageNumber]: (prev[pageNumber] || []).map((item) => {
        if (item.id !== editId) return item;
        const currentlyItalic = isItalicStyle(item.fontStyle);
        return {
          ...item,
          fontStyle: currentlyItalic ? "normal" : "italic",
        };
      }),
    }));
  };

  const handleUpdateActiveEdit = (updates: {
    fontWeight?: string;
    fontStyle?: string;
    fontSize?: number;
    color?: string;
  }) => {
    if (!activeEditId) return;
    setPageEdits((prev) => ({
      ...prev,
      [pageNumber]: (prev[pageNumber] || []).map((item) => {
        if (item.id !== activeEditId) return item;
        const newFontSize = updates.fontSize ?? item.fontSize;
        const newHeight = updates.fontSize
          ? Math.max(16, (item.ascent + Math.abs(item.descent)) * newFontSize)
          : item.height;
        const newWidth = updates.fontSize
          ? Math.max(item.width, item.text.length * (newFontSize * 0.58))
          : item.width;
        return {
          ...item,
          ...updates,
          height: newHeight,
          width: newWidth,
        };
      }),
    }));
  };

  const updateFabricBrush = (
    fCanvas: FabricCanvas,
    color: string,
    width: number,
    highlighter: boolean
  ) => {
    if (!fCanvas.freeDrawingBrush) {
      fCanvas.freeDrawingBrush = new PencilBrush(fCanvas);
    }
    fCanvas.freeDrawingBrush.width = width;
    if (highlighter) {
      fCanvas.freeDrawingBrush.color =
        color.startsWith("#") && color.length === 7
          ? `${color}66`
          : "rgba(250, 204, 21, 0.45)";
    } else {
      fCanvas.freeDrawingBrush.color = color;
    }
  };

  const toggleDrawingMode = () => {
    const nextMode = !isDrawingMode;
    setIsDrawingMode(nextMode);
    setIsEraserMode(false);

    const fCanvas = fabricInstanceRef.current;
    if (fCanvas) {
      fCanvas.isDrawingMode = nextMode;
      fCanvas.defaultCursor = "default";
      if (nextMode) {
        setActiveEditId(null);
        fCanvas.discardActiveObject();
        updateFabricBrush(fCanvas, brushColor, brushWidth, isHighlighter);
      } else {
        // Save current page annotations when exiting painter mode so drawings are permanently kept
        pageAnnotationsRef.current[pageNumber] = fCanvas.toJSON();
      }
      fCanvas.renderAll();
    }
  };

  const toggleEraserMode = () => {
    const nextEraser = !isEraserMode;
    setIsEraserMode(nextEraser);

    const fCanvas = fabricInstanceRef.current;
    if (fCanvas) {
      if (nextEraser) {
        fCanvas.isDrawingMode = false;
        fCanvas.discardActiveObject();
        fCanvas.defaultCursor = "crosshair";
      } else {
        fCanvas.isDrawingMode = true;
        fCanvas.defaultCursor = "default";
        updateFabricBrush(fCanvas, brushColor, brushWidth, isHighlighter);
      }
      fCanvas.renderAll();
    }
  };

  const handleClearCurrentPageStrokes = () => {
    const fCanvas = fabricInstanceRef.current;
    if (!fCanvas) return;
    const pathObjects = fCanvas.getObjects().filter((obj) => obj.type === "path");
    if (pathObjects.length === 0) return;
    pathObjects.forEach((obj) => fCanvas.remove(obj));
    fCanvas.discardActiveObject();
    fCanvas.renderAll();
    pageAnnotationsRef.current[pageNumberRef.current] = fCanvas.toJSON();
  };

  const setBrushColorAndApply = (color: string) => {
    setBrushColor(color);
    setIsEraserMode(false);
    const fCanvas = fabricInstanceRef.current;
    if (fCanvas) {
      fCanvas.isDrawingMode = true;
      fCanvas.defaultCursor = "default";
      updateFabricBrush(fCanvas, color, brushWidth, isHighlighter);
    }
  };

  const setBrushWidthAndApply = (width: number) => {
    setBrushWidth(width);
    setIsEraserMode(false);
    const fCanvas = fabricInstanceRef.current;
    if (fCanvas) {
      fCanvas.isDrawingMode = true;
      fCanvas.defaultCursor = "default";
      updateFabricBrush(fCanvas, brushColor, width, isHighlighter);
    }
  };

  const toggleHighlighterAndApply = () => {
    const nextHighlighter = !isHighlighter;
    setIsHighlighter(nextHighlighter);
    setIsEraserMode(false);
    const defaultWidth = nextHighlighter ? 18 : 4;
    const defaultColor = nextHighlighter ? "#facc15" : "#ef4444";
    setBrushWidth(defaultWidth);
    setBrushColor(defaultColor);

    const fCanvas = fabricInstanceRef.current;
    if (fCanvas) {
      fCanvas.isDrawingMode = true;
      fCanvas.defaultCursor = "default";
      updateFabricBrush(fCanvas, defaultColor, defaultWidth, nextHighlighter);
    }
  };

  const pageAnnotationsRef = useRef<Record<number, any>>({});
  const prevPageNumberRef = useRef<number>(pageNumber);
  const pageNumberRef = useRef<number>(pageNumber);
  pageNumberRef.current = pageNumber;

  const isDrawingModeRef = useRef(isDrawingMode);
  isDrawingModeRef.current = isDrawingMode;

  const isEraserModeRef = useRef(isEraserMode);
  isEraserModeRef.current = isEraserMode;

  const brushColorRef = useRef(brushColor);
  brushColorRef.current = brushColor;

  const brushWidthRef = useRef(brushWidth);
  brushWidthRef.current = brushWidth;

  const isHighlighterRef = useRef(isHighlighter);
  isHighlighterRef.current = isHighlighter;

  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const navigate = useNavigate();

  const handleZoomIn = () => {
    setScale((prev) => Math.min(Math.round((prev + 0.25) * 100) / 100, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(Math.round((prev - 0.25) * 100) / 100, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1.5);
  };

  // Initialize Fabric canvas strictly for vector shapes (Rectangles, Circles)
  useEffect(() => {
    if (fabricCanvasElRef.current && !fabricInstanceRef.current) {
      const initCanvas = new FabricCanvas(fabricCanvasElRef.current, {
        width: canvasSize.width || 800,
        height: canvasSize.height || 1100,
        backgroundColor: "transparent",
        selection: true,
      });
      initCanvas.setZoom(scale);

      const persistPageAnnotations = () => {
        if (fabricInstanceRef.current) {
          pageAnnotationsRef.current[pageNumberRef.current] =
            fabricInstanceRef.current.toJSON();
        }
      };

      initCanvas.on("object:added", persistPageAnnotations);
      initCanvas.on("object:modified", persistPageAnnotations);
      initCanvas.on("object:removed", persistPageAnnotations);
      initCanvas.on("path:created", persistPageAnnotations);

      let isErasingMouseDown = false;

      const eraseTarget = (target: any) => {
        if (!target) return;
        initCanvas.remove(target);
        initCanvas.discardActiveObject();
        initCanvas.renderAll();
        if (fabricInstanceRef.current) {
          pageAnnotationsRef.current[pageNumberRef.current] =
            fabricInstanceRef.current.toJSON();
        }
      };

      const handleEraserAtEvent = (opt: any) => {
        if (!isEraserModeRef.current) return;
        if (opt.target && opt.target.type === "path") {
          eraseTarget(opt.target);
          return;
        }
        const pointer =
          opt.scenePoint ||
          (initCanvas as any).getScenePoint?.(opt.e) ||
          (initCanvas as any).getViewportPoint?.(opt.e);
        if (!pointer) return;
        const objs = initCanvas.getObjects();
        for (let i = objs.length - 1; i >= 0; i--) {
          const obj = objs[i];
          if (obj.type === "path") {
            const bound = obj.getBoundingRect();
            const margin = 14;
            if (
              pointer.x >= bound.left - margin &&
              pointer.x <= bound.left + bound.width + margin &&
              pointer.y >= bound.top - margin &&
              pointer.y <= bound.top + bound.height + margin
            ) {
              eraseTarget(obj);
              break;
            }
          }
        }
      };

      initCanvas.on("mouse:down", (opt) => {
        if (isEraserModeRef.current) {
          isErasingMouseDown = true;
          handleEraserAtEvent(opt);
        }
      });

      initCanvas.on("mouse:move", (opt) => {
        if (isEraserModeRef.current && isErasingMouseDown) {
          handleEraserAtEvent(opt);
        }
      });

      initCanvas.on("mouse:up", () => {
        isErasingMouseDown = false;
      });

      fabricInstanceRef.current = initCanvas;
      setFabricCanvas(initCanvas);
    }

    return () => {
      if (fabricInstanceRef.current) {
        fabricInstanceRef.current.dispose();
        fabricInstanceRef.current = null;
        setFabricCanvas(null);
      }
    };
  }, []);

  // Backspace / Delete key listener for deleting selected shapes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Backspace" && e.key !== "Delete") return;

      // Do NOT delete canvas shapes if user is typing in an input, textarea, or contentEditable
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      const canvas = fabricInstanceRef.current;
      if (!canvas) return;

      const activeObjects = canvas.getActiveObjects();
      if (activeObjects && activeObjects.length > 0) {
        const isEditingText = activeObjects.some(
          (obj: any) => obj.isEditing === true
        );
        if (isEditingText) return;

        e.preventDefault();

        activeObjects.forEach((obj) => {
          canvas.remove(obj);
        });
        canvas.discardActiveObject();
        canvas.renderAll();
      } else if (activeEditId) {
        e.preventDefault();
        handleDeleteEdit(activeEditId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeEditId]);

  // Autofocus inline text input when an edit block is activated
  useEffect(() => {
    if (activeEditId && activeInputRef.current) {
      activeInputRef.current.focus();
      if ("select" in activeInputRef.current) {
        activeInputRef.current.select();
      }
    }
  }, [activeEditId]);

  // Extract positional text blocks from PDF with exact typography and font mapping
  useEffect(() => {
    if (!pdfDoc) {
      setExtractedPages([]);
      return;
    }

    const doc = pdfDoc;
    let isCancelled = false;
    setIsExtracting(true);

    if (pdfFile) {
      extractBlocks(pdfFile).catch((err: unknown) => {
        console.warn("Backend extract-blocks unavailable:", err);
      });
    }

    async function extractAllBlocks() {
      try {
        const pagesData: {
          pageNumber: number;
          width: number;
          height: number;
          blocks: DetailedTextBlock[];
        }[] = [];

        for (let pNum = 1; pNum <= doc.numPages; pNum++) {
          const page = await doc.getPage(pNum);
          const viewport = page.getViewport({ scale: 1 });
          const textContent = await page.getTextContent();

          // Resolve full font objects from PDF.js operator list
          try {
            await page.getOperatorList();
          } catch (err) {
            console.warn("Could not load operator list:", err);
          }

          const fontMap: Record<string, any> = {};
          await Promise.all(
            Object.keys(textContent.styles).map(
              (fontName) =>
                new Promise<void>((resolve) => {
                  try {
                    page.commonObjs.get(fontName, (font: any) => {
                      fontMap[fontName] = font;
                      resolve();
                    });
                  } catch {
                    resolve();
                  }
                })
            )
          );

          const rawItems: {
            str: string;
            x: number;
            baselineY: number;
            y: number;
            width: number;
            height: number;
            fontSize: number;
            fontFamily: string;
            fontWeight: string;
            fontStyle: string;
            pdfFontType: "serif" | "mono" | "sans";
            ascent: number;
            descent: number;
          }[] = [];

          for (const item of textContent.items) {
            if (!("str" in item) || !item.str.trim()) continue;

            const fontObj = fontMap[item.fontName];
            const rawFontName = fontObj?.name || item.fontName || "";
            const style = (textContent.styles as Record<string, any>)?.[
              item.fontName
            ];
            const typography = parsePdfFontName(rawFontName, style?.fontFamily);

            const transform = item.transform;
            const x = transform[4];
            const rawFontSize = Math.hypot(transform[0], transform[1]);
            const fontSize = Math.max(4, Math.round(rawFontSize * 100) / 100);

            const ascent =
              typeof style?.ascent === "number" ? style.ascent : 0.75;
            const descent =
              typeof style?.descent === "number" ? style.descent : -0.25;

            // Baseline in PDF viewport coordinates (top-down)
            const baselineY = viewport.height - transform[5];
            // Exact top of font em-box
            const y = baselineY - ascent * fontSize;
            const height = (ascent + Math.abs(descent)) * fontSize;
            const width =
              item.width || Math.max(16, item.str.length * fontSize * 0.52);

            rawItems.push({
              str: item.str,
              x,
              baselineY,
              y,
              width,
              height,
              fontSize,
              fontFamily: typography.fontFamily,
              fontWeight: typography.fontWeight,
              fontStyle: typography.fontStyle,
              pdfFontType: typography.pdfFontType,
              ascent,
              descent,
            });
          }

          // Sort items by vertical baseline (top-to-bottom), then by horizontal x (left-to-right)
          rawItems.sort((a, b) => {
            if (Math.abs(a.baselineY - b.baselineY) > 2.5) {
              return a.baselineY - b.baselineY;
            }
            return a.x - b.x;
          });

          // Group adjacent items on the same baseline into coherent line blocks
          // Strictly preserves font weight, size, and family boundaries!
          const blocks: DetailedTextBlock[] = [];
          for (let i = 0; i < rawItems.length; i++) {
            const item = rawItems[i];
            if (blocks.length === 0) {
              blocks.push({
                id: `b-p${pNum}-0`,
                text: item.str,
                x: item.x,
                y: item.y,
                baselineY: item.baselineY,
                width: item.width,
                height: item.height,
                fontSize: item.fontSize,
                fontFamily: item.fontFamily,
                fontWeight: item.fontWeight,
                fontStyle: item.fontStyle,
                pdfFontType: item.pdfFontType,
                ascent: item.ascent,
                descent: item.descent,
              });
              continue;
            }

            const prev = blocks[blocks.length - 1];
            const sameBaseline =
              Math.abs(item.baselineY - prev.baselineY) <=
              Math.max(2, prev.fontSize * 0.2);
            const gap = item.x - (prev.x + prev.width);
            const maxGap = Math.max(12, prev.fontSize * 1.0);
            const sameStyle =
              prev.fontFamily === item.fontFamily &&
              prev.fontWeight === item.fontWeight &&
              prev.fontStyle === item.fontStyle &&
              Math.abs(prev.fontSize - item.fontSize) <= 0.6;

            if (sameBaseline && gap >= -2 && gap <= maxGap && sameStyle) {
              const needsSpace =
                gap > 1.5 &&
                !prev.text.endsWith(" ") &&
                !item.str.startsWith(" ");
              prev.text = prev.text + (needsSpace ? " " : "") + item.str;
              prev.width = item.x + item.width - prev.x;
              prev.height = Math.max(prev.height, item.height);
            } else {
              blocks.push({
                id: `b-p${pNum}-${blocks.length}`,
                text: item.str,
                x: item.x,
                y: item.y,
                baselineY: item.baselineY,
                width: item.width,
                height: item.height,
                fontSize: item.fontSize,
                fontFamily: item.fontFamily,
                fontWeight: item.fontWeight,
                fontStyle: item.fontStyle,
                pdfFontType: item.pdfFontType,
                ascent: item.ascent,
                descent: item.descent,
              });
            }
          }

          pagesData.push({
            pageNumber: pNum,
            width: viewport.width,
            height: viewport.height,
            blocks,
          });
        }

        if (!isCancelled) {
          setExtractedPages(pagesData);
        }
      } catch (err) {
        console.warn("Client text extraction error:", err);
      } finally {
        if (!isCancelled) {
          setIsExtracting(false);
        }
      }
    }

    extractAllBlocks();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc]);

  // Load PDF document from URL
  useEffect(() => {
    if (!pdfUrl) {
      setPdfDoc(null);
      setLoading(false);
      setError(null);
      navigate("/");
      return;
    }

    let isCancelled = false;
    setLoading(true);
    setError(null);

    const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });

    loadingTask.promise
      .then((doc) => {
        if (isCancelled) return;
        setPdfDoc(doc);
        setLoading(false);
        onLoadSuccessRef.current?.(doc.numPages);
      })
      .catch((err: Error) => {
        if (isCancelled) return;
        console.error("PDF loading error:", err);
        setError(err.message || "Failed to load PDF");
        setLoading(false);
      });

    return () => {
      isCancelled = true;
      loadingTask.destroy();
    };
  }, [pdfUrl, navigate]);

  // Save & load Fabric annotations when page changes
  useEffect(() => {
    const fCanvas = fabricInstanceRef.current;
    if (!fCanvas) return;

    if (prevPageNumberRef.current && prevPageNumberRef.current !== pageNumber) {
      pageAnnotationsRef.current[prevPageNumberRef.current] = fCanvas.toJSON();
    }
    prevPageNumberRef.current = pageNumber;

    fCanvas.clear();

    const savedData = pageAnnotationsRef.current[pageNumber];
    if (savedData) {
      fCanvas.loadFromJSON(savedData).then(() => {
        fCanvas.setZoom(scale);
        if (isDrawingModeRef.current) {
          fCanvas.isDrawingMode = true;
          updateFabricBrush(
            fCanvas,
            brushColorRef.current,
            brushWidthRef.current,
            isHighlighterRef.current
          );
        }
        fCanvas.renderAll();
      });
    } else {
      if (isDrawingModeRef.current) {
        fCanvas.isDrawingMode = true;
        updateFabricBrush(
          fCanvas,
          brushColorRef.current,
          brushWidthRef.current,
          isHighlighterRef.current
        );
      }
      fCanvas.renderAll();
    }
    setActiveEditId(null);
  }, [pageNumber]);

  // High-DPI Razor-Sharp PDF Rendering
  useEffect(() => {
    if (!pdfDoc) {
      if (fabricInstanceRef.current) {
        fabricInstanceRef.current.setZoom(scale);
        fabricInstanceRef.current.renderAll();
      }
      setIsPageRendering(false);
      onPageRenderingChangeRef.current?.(false);
      return;
    }

    const targetPage = Math.max(1, Math.min(pageNumber, pdfDoc.numPages));

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    let isEffectActive = true;
    setIsPageRendering(true);
    onPageRenderingChangeRef.current?.(true);

    pdfDoc
      .getPage(targetPage)
      .then((page) => {
        if (!isEffectActive) return;

        const dpr = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale });
        const pdfCanvas = pdfCanvasRef.current;
        if (!pdfCanvas) return;

        // Render at device pixel ratio for crystal-clear vector sharpness
        pdfCanvas.width = Math.floor(viewport.width * dpr);
        pdfCanvas.height = Math.floor(viewport.height * dpr);
        pdfCanvas.style.width = `${viewport.width}px`;
        pdfCanvas.style.height = `${viewport.height}px`;

        setCanvasSize({ width: viewport.width, height: viewport.height });

        if (fabricInstanceRef.current) {
          fabricInstanceRef.current.setDimensions({
            width: viewport.width,
            height: viewport.height,
          });
          fabricInstanceRef.current.setZoom(scale);
          fabricInstanceRef.current.renderAll();
        }

        const renderContext = {
          canvas: pdfCanvas,
          canvasContext: pdfCanvas.getContext("2d")!,
          viewport,
          transform: [dpr, 0, 0, dpr, 0, 0],
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        return renderTask.promise;
      })
      .then(() => {
        if (isEffectActive) {
          renderTaskRef.current = null;
          setIsPageRendering(false);
          onPageRenderingChangeRef.current?.(false);
        }
      })
      .catch((err: Error) => {
        if (isEffectActive) {
          setIsPageRendering(false);
          onPageRenderingChangeRef.current?.(false);
        }
        if (err?.name === "RenderingCancelledException") {
          return;
        }
        console.error("Render error:", err);
      });

    return () => {
      isEffectActive = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, pageNumber, scale]);

  // Toolbar: Add Rectangle Shape
  const addRectangle = () => {
    if (fabricInstanceRef.current) {
      const rect = new Rect({
        top: 100,
        left: 100,
        width: 120,
        height: 80,
        fill: "#3b82f6",
      });
      fabricInstanceRef.current.add(rect);
      fabricInstanceRef.current.setActiveObject(rect);
      fabricInstanceRef.current.renderAll();
    }
  };

  // Toolbar: Add Circle Shape
  const addCircle = () => {
    if (fabricInstanceRef.current) {
      const circle = new FabricCircle({
        top: 100,
        left: 100,
        radius: 50,
        fill: "#ef4444",
      });
      fabricInstanceRef.current.add(circle);
      fabricInstanceRef.current.setActiveObject(circle);
      fabricInstanceRef.current.renderAll();
    }
  };

  // Toolbar: Add New In-Place Word-Style Text Block
  const addText = () => {
    const newId = `custom-text-${Date.now()}`;
    const newEdit: TextEdit = {
      id: newId,
      originalText: "",
      text: "Type text here...",
      x: 80 / scale,
      y: 80 / scale,
      baselineY: (80 + 14) / scale,
      width: 200,
      height: 20,
      fontSize: 14,
      fontFamily: "Helvetica, Arial, sans-serif",
      fontWeight: "normal",
      fontStyle: "normal",
      pdfFontType: "sans",
      ascent: 0.75,
      descent: -0.25,
      color: "#000000",
      bgColor: "#ffffff",
      isCustom: true,
    };

    setPageEdits((prev) => ({
      ...prev,
      [pageNumber]: [...(prev[pageNumber] || []), newEdit],
    }));
    setActiveEditId(newId);
  };

  // Clicking an original PDF text block activates MS Word-style inline editing
  const handleStartEditingBlock = (block: DetailedTextBlock) => {
    const existingEdits = pageEdits[pageNumber] || [];
    let edit = existingEdits.find((e) => e.id === block.id);

    if (!edit) {
      const sampled = sampleTextAndBgColor(
        pdfCanvasRef.current,
        block.x,
        block.y,
        block.width,
        block.height,
        scale
      );

      edit = {
        id: block.id,
        originalText: block.text,
        text: block.text,
        x: block.x,
        y: block.y,
        baselineY: block.baselineY,
        originalX: block.x,
        originalY: block.y,
        originalWidth: block.width,
        originalHeight: block.height,
        width: Math.max(block.width, 24),
        height: Math.max(block.height, block.fontSize || 14),
        fontSize: block.fontSize,
        fontFamily: block.fontFamily || "Arial, Helvetica, sans-serif",
        fontWeight: block.fontWeight || "normal",
        fontStyle: block.fontStyle || "normal",
        pdfFontType: block.pdfFontType || "sans",
        ascent: block.ascent || 0.75,
        descent: block.descent || -0.25,
        color: normalizeTextColor(sampled.textColor),
        bgColor: sampled.bgColor,
      };

      setPageEdits((prev) => ({
        ...prev,
        [pageNumber]: [...(prev[pageNumber] || []), edit!],
      }));
    } else if (!edit.isCustom) {
      const normalized = normalizeTextColor(edit.color);
      if (normalized !== edit.color) {
        edit = { ...edit, color: normalized };
        setPageEdits((prev) => ({
          ...prev,
          [pageNumber]: (prev[pageNumber] || []).map((e) =>
            e.id === edit!.id ? edit! : e
          ),
        }));
      }
    }

    if (edit) {
      setActiveEditId(edit.id);
    }
  };

  // Drag handler to freely move text boxes around the PDF
  const handleStartDrag = (
    e: React.PointerEvent,
    editId: string,
    currentX: number,
    currentY: number,
    currentBaselineY?: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const startPointerX = e.clientX;
    const startPointerY = e.clientY;
    const initialX = currentX;
    const initialY = currentY;
    const initialBaselineY = currentBaselineY ?? currentY + 14;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startPointerX) / scale;
      const dy = (moveEvent.clientY - startPointerY) / scale;

      setPageEdits((prev) => {
        const list = prev[pageNumber] || [];
        return {
          ...prev,
          [pageNumber]: list.map((item) => {
            if (item.id !== editId) return item;
            const newX = Math.round((initialX + dx) * 10) / 10;
            const newY = Math.round((initialY + dy) * 10) / 10;
            const newBaselineY = Math.round((initialBaselineY + dy) * 10) / 10;
            return {
              ...item,
              x: newX,
              y: newY,
              baselineY: newBaselineY,
            };
          }),
        };
      });
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const handleTextChange = (id: string, newText: string) => {
    setPageEdits((prev) => {
      const currentList = prev[pageNumber] || [];
      return {
        ...prev,
        [pageNumber]: currentList.map((e) =>
          e.id === id ? { ...e, text: newText } : e
        ),
      };
    });
  };

  const handleResetEdit = (id: string) => {
    setPageEdits((prev) => {
      const currentList = prev[pageNumber] || [];
      return {
        ...prev,
        [pageNumber]: currentList.filter((e) => e.id !== id),
      };
    });
    setActiveEditId(null);
  };

  const handleDeleteEdit = (id: string) => {
    setPageEdits((prev) => {
      const currentList = prev[pageNumber] || [];
      const target = currentList.find((e) => e.id === id);
      if (!target) return prev;

      if (target.isCustom) {
        // Custom text box: delete completely
        return {
          ...prev,
          [pageNumber]: currentList.filter((e) => e.id !== id),
        };
      } else {
        // Original PDF text: if already erased/empty, remove edit completely
        // If not empty, erase text (whiteout mode)
        if (target.text === "") {
          return {
            ...prev,
            [pageNumber]: currentList.filter((e) => e.id !== id),
          };
        } else {
          return {
            ...prev,
            [pageNumber]: currentList.map((e) =>
              e.id === id ? { ...e, text: "" } : e
            ),
          };
        }
      }
    });
    setActiveEditId(null);
  };

  const activeEdit = (pageEdits[pageNumber] || []).find(
    (e) => e.id === activeEditId
  );

  // PDF Export
  useImperativeHandle(ref, () => ({
    exportDocument: async () => {
      if (!pdfUrl) {
        throw new Error("No PDF is loaded to export.");
      }

      if (fabricInstanceRef.current) {
        pageAnnotationsRef.current[pageNumber] =
          fabricInstanceRef.current.toJSON();
      }

      const pdfBytes = await exportPdfWithAnnotations({
        pdfUrl,
        pageAnnotations: pageAnnotationsRef.current,
        currentPageNumber: pageNumber,
        currentFabricData: fabricInstanceRef.current?.toJSON(),
        pageTextEdits: pageEdits,
      });

      downloadPdfBlob(pdfBytes, "edited-document.pdf");
    },
  }));

  const currentPageData = extractedPages.find((p) => p.pageNumber === pageNumber);
  const currentBlocks = currentPageData ? currentPageData.blocks : [];

  return (
    <div
      className="flex flex-col items-center justify-center p-4 relative"
      onClick={(e) => {
        // Do not dismiss active edit if user clicked inside Settings, dialogs, or any floating toolbar
        const target = e.target as HTMLElement | null;
        if (
          target?.closest("[data-settings-panel]") ||
          target?.closest("[data-toolbar]") ||
          target?.closest("[role='dialog']")
        ) {
          return;
        }
        // Clicking outside any text block closes the active inline editor
        if (activeEditId) {
          setActiveEditId(null);
        }
      }}
    >
      {!pdfUrl && !loading && (
        <div className="p-8 text-center text-[#787774] select-none">
          <p className="font-semibold text-base text-[#37352F]">No PDF selected</p>
          <p className="text-xs text-[#787774] mt-1">Please upload a PDF file to begin.</p>
        </div>
      )}
      {loading && pdfUrl && (
        <div className="flex flex-col items-center justify-center p-12 gap-3 text-[#787774] select-none">
          <Loader2 size={24} className="animate-spin text-[#2383E2]" />
          <p className="text-xs font-medium">Opening PDF document...</p>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50/80 border border-red-200/80 rounded-lg text-red-600 text-xs">
          Failed to load PDF: {error}
        </div>
      )}

      {/* Floating Toolbar on Left */}
      {pdfDoc && !loading && !error && (
        <div
          className="flex flex-col gap-1 p-1 fixed top-1/2 -translate-y-1/2 left-5 bg-white/95 backdrop-blur-md border border-[#37352F]/15 shadow-[0_4px_16px_rgba(15,15,15,0.08),0_1px_3px_rgba(15,15,15,0.04)] rounded-xl z-40 text-[#37352F] select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={addRectangle}
            className="p-2 hover:bg-[#37352F]/5 rounded-lg transition text-[#787774] hover:text-[#37352F] cursor-pointer"
            title="Add Rectangle"
          >
            <Square size={18} />
          </button>
          <button
            onClick={addCircle}
            className="p-2 hover:bg-[#37352F]/5 rounded-lg transition text-[#787774] hover:text-[#37352F] cursor-pointer"
            title="Add Circle"
          >
            <Circle size={18} />
          </button>
          <button
            onClick={addText}
            className="p-2 hover:bg-[#37352F]/5 rounded-lg transition text-[#787774] hover:text-[#37352F] cursor-pointer"
            title="Add New Text (Word-Style)"
          >
            <Type size={18} />
          </button>
          {/* Fabric.js Painter Tool */}
          <button
            onClick={toggleDrawingMode}
            className={`p-2 rounded-lg transition cursor-pointer relative ${
              isDrawingMode
                ? "bg-[#242424] text-white shadow-2xs"
                : "hover:bg-[#37352F]/5 text-[#787774] hover:text-[#37352F]"
            }`}
            title={
              isDrawingMode
                ? "Exit Painter Mode"
                : "Fabric.js Painter / Freehand Drawing"
            }
          >
            <Paintbrush size={18} />
          </button>

          <div className="w-full h-px bg-[#37352F]/10 my-0.5" />

          {/* Toggle Detected Document Text Outlines */}
          <button
            onClick={() => setShowDetectedBlocks((prev) => !prev)}
            className={`p-2 rounded-lg transition cursor-pointer relative ${
              showDetectedBlocks
                ? "bg-[#2383E2]/10 text-[#2383E2]"
                : "hover:bg-[#37352F]/5 text-[#787774] hover:text-[#37352F]"
            }`}
            title={
              isExtracting
                ? "Extracting PDF text..."
                : showDetectedBlocks
                ? "Hide text outlines"
                : "Highlight all detected PDF text"
            }
          >
            <FileText size={18} />
            {isExtracting && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#2383E2] animate-ping" />
            )}
          </button>
        </div>
      )}

      {/* Painter Control Palette (when Drawing Mode is active) */}
      {isDrawingMode && (
        <div
          className="fixed top-16 left-20 z-40 bg-white/95 backdrop-blur-md text-[#37352F] px-3.5 py-1.5 rounded-xl shadow-[0_4px_20px_rgba(15,15,15,0.1),0_1px_3px_rgba(15,15,15,0.05)] border border-[#37352F]/15 flex items-center gap-2 text-xs select-none animate-in fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#37352F]">
            <Paintbrush size={14} className="text-[#2383E2]" />
            <span>Painter</span>
          </div>

          <div className="w-px h-3.5 bg-[#37352F]/10" />

          {/* Color Presets */}
          <div className="flex items-center gap-1">
            {[
              { color: "#ef4444", title: "Red" },
              { color: "#3b82f6", title: "Blue" },
              { color: "#22c55e", title: "Green" },
              { color: "#000000", title: "Black" },
              { color: "#facc15", title: "Yellow" },
            ].map((c) => (
              <button
                key={c.color}
                type="button"
                onClick={() => setBrushColorAndApply(c.color)}
                className={`w-4 h-4 rounded-full border transition cursor-pointer ${
                  brushColor === c.color
                    ? "border-[#37352F] scale-110 shadow-2xs ring-1 ring-[#37352F]/20"
                    : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                }`}
                style={{ backgroundColor: c.color }}
                title={c.title}
              />
            ))}
            <input
              type="color"
              value={brushColor.startsWith("#") ? brushColor.slice(0, 7) : "#ef4444"}
              onChange={(e) => setBrushColorAndApply(e.target.value)}
              className="w-4 h-4 rounded-full cursor-pointer bg-transparent border-0 p-0"
              title="Custom Color"
            />
          </div>

          <div className="w-px h-3.5 bg-[#37352F]/10" />

          {/* Stroke Width Selector */}
          <div className="flex items-center gap-0.5 text-xs">
            {[
              { width: 2, label: "Fine" },
              { width: 4, label: "Medium" },
              { width: 8, label: "Thick" },
              { width: 16, label: "Marker" },
            ].map((w) => (
              <button
                key={w.width}
                type="button"
                onClick={() => setBrushWidthAndApply(w.width)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition cursor-pointer ${
                  brushWidth === w.width
                    ? "bg-[#242424] text-white shadow-2xs font-semibold"
                    : "text-[#787774] hover:text-[#37352F] hover:bg-[#37352F]/5"
                }`}
                title={`${w.label} (${w.width}px)`}
              >
                {w.label}
              </button>
            ))}
          </div>

          <div className="w-px h-3.5 bg-[#37352F]/10" />

          {/* Highlighter Toggle */}
          <button
            type="button"
            onClick={toggleHighlighterAndApply}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition cursor-pointer ${
              isHighlighter
                ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                : "text-[#787774] hover:text-[#37352F] hover:bg-[#37352F]/5"
            }`}
            title="Toggle semi-transparent highlighter"
          >
            <Highlighter size={12} />
            <span>Highlighter</span>
          </button>

          <div className="w-px h-3.5 bg-[#37352F]/10" />

          {/* Eraser Tool */}
          <button
            type="button"
            onClick={toggleEraserMode}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition cursor-pointer ${
              isEraserMode
                ? "bg-[#242424] text-white shadow-2xs font-semibold"
                : "text-[#787774] hover:text-[#37352F] hover:bg-[#37352F]/5"
            }`}
            title="Erase drawn strokes (click or drag over strokes)"
          >
            <Eraser size={12} />
            <span>Eraser</span>
          </button>

          {/* Clear Page Strokes */}
          <button
            type="button"
            onClick={handleClearCurrentPageStrokes}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-red-600 hover:bg-red-50 transition cursor-pointer"
            title="Clear all drawings on this page"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>

          <div className="w-px h-3.5 bg-[#37352F]/10" />

          {/* Done Button */}
          <button
            type="button"
            onClick={toggleDrawingMode}
            className="flex items-center gap-1 px-2.5 py-0.5 bg-[#242424] hover:bg-[#37352F] text-white rounded-md text-xs font-medium shadow-xs transition cursor-pointer"
          >
            <Check size={12} />
            <span>Done</span>
          </button>
        </div>
      )}

      {/* Floating Properties Panel on Right for Shapes, Text, and Drawing Strokes */}
      <Settings
        canvas={fabricCanvas}
        activeEdit={activeEdit}
        onClose={() => setActiveEditId(null)}
        onDeleteText={() => activeEditId && handleDeleteEdit(activeEditId)}
        onUpdateEdit={handleUpdateActiveEdit}
      />

      {/* Fixed Zoom Controls on Bottom Right */}
      {pdfDoc && !loading && !error && (
        <div
          className="fixed bottom-6 right-6 z-40 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg shadow-[0_2px_10px_rgba(15,15,15,0.08),0_1px_3px_rgba(15,15,15,0.04)] border border-[#37352F]/15 text-[#37352F] select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="p-1 rounded text-[#787774] hover:text-[#37352F] hover:bg-[#37352F]/5 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <span
            onClick={handleResetZoom}
            className="text-xs font-medium text-[#787774] hover:text-[#37352F] min-w-[3rem] text-center cursor-pointer transition select-none px-1"
            title="Click to reset zoom"
          >
            {Math.round((scale / 1.5) * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 3.0}
            className="p-1 rounded text-[#787774] hover:text-[#37352F] hover:bg-[#37352F]/5 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1 ml-0.5 rounded text-[#9B9A97] hover:text-[#37352F] hover:bg-[#37352F]/5 transition cursor-pointer"
            title="Reset to 100%"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      )}

      {/* Detection Mode Banner */}
      {showDetectedBlocks && (
        <div className="mb-3 px-3.5 py-1.5 bg-white text-[#37352F] border border-[#37352F]/12 rounded-lg shadow-2xs flex items-center gap-2.5 text-xs z-30 animate-in fade-in select-none">
          <div className="w-1.5 h-1.5 rounded-full bg-[#2383E2] animate-pulse shrink-0" />
          <span className="text-[#37352F]">
            {currentBlocks.length > 0
              ? `Document Text Mode: Found ${currentBlocks.length} text lines on page ${pageNumber}. Click any text to edit in-place.`
              : isExtracting
              ? "Scanning document text..."
              : "No digital text detected on this page (this document might be a scanned image)."}
          </span>
          <button
            onClick={() => setShowDetectedBlocks(false)}
            className="ml-auto text-[#787774] hover:text-[#37352F] p-0.5 hover:bg-[#37352F]/5 rounded cursor-pointer transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* PDF Viewport & Layer Stack */}
      <div
        className={`relative shadow-[0_2px_12px_rgba(15,15,15,0.07),0_1px_3px_rgba(15,15,15,0.04)] border border-[#37352F]/15 rounded-sm bg-white overflow-hidden ${
          !pdfUrl || loading || error ? "hidden" : "block"
        }`}
        style={{
          width: canvasSize.width ? `${canvasSize.width}px` : undefined,
          height: canvasSize.height ? `${canvasSize.height}px` : undefined,
        }}
      >
        {/* Page Transition Spinner between every PDF page */}
        {isPageRendering && (
          <div className="absolute inset-0 z-35 bg-white/80 backdrop-blur-2xs flex flex-col items-center justify-center gap-2 select-none animate-in fade-in duration-100">
            <Loader2 size={24} className="animate-spin text-[#2383E2]" />
            <span className="text-xs font-medium text-[#787774]">
              Loading page {pageNumber}...
            </span>
          </div>
        )}

        {/* Layer 0: High-DPI Razor-Sharp PDF Canvas */}
        <canvas ref={pdfCanvasRef} className="block" />

        {/* Layer 1: Fabric Canvas for Shapes & Freehand Drawing */}
        <div
          className={`absolute top-0 left-0 ${
            isDrawingMode || isEraserMode ? "z-25 cursor-crosshair" : "z-10"
          }`}
        >
          <canvas ref={fabricCanvasElRef} />
        </div>

        {/* Layer 2: MS Word-Style Interactive DOM Text Layer */}
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{ width: "100%", height: "100%" }}
        >
          {/* A. Clickable Hitboxes for Original PDF Text */}
          {currentBlocks.map((block) => {
            const isEdited = (pageEdits[pageNumber] || []).some(
              (e) => e.id === block.id
            );
            if (isEdited) return null; // Rendered in B below

            return (
              <div
                key={block.id}
                onClick={(e) => {
                  if (isDrawingMode || isEraserMode) return;
                  e.stopPropagation();
                  handleStartEditingBlock(block);
                }}
                className={`absolute rounded-none transition-all ${
                  isDrawingMode || isEraserMode
                    ? "pointer-events-none"
                    : "pointer-events-auto cursor-text"
                } ${
                  showDetectedBlocks
                    ? "border border-dashed border-[#2383E2]/60 bg-[#2383E2]/5"
                    : "hover:bg-[#2383E2]/8 hover:outline hover:outline-1 hover:outline-[#2383E2]/40"
                }`}
                style={{
                  left: `${block.x * scale}px`,
                  top: `${block.y * scale}px`,
                  width: `${Math.max(block.width * scale, 24)}px`,
                  height: `${block.height * scale}px`,
                }}
                title={isDrawingMode ? undefined : `Click to edit: "${block.text}"`}
              />
            );
          })}

          {/* B. Render Active and Committed MS Word-Style Text Edits */}
          {(pageEdits[pageNumber] || []).map((edit) => {
            const isActive = activeEditId === edit.id;
            const editLeft = edit.x * scale;
            const editTop = edit.y * scale;
            const editWidth = Math.max(edit.width * scale, 24);
            const editHeight = edit.height * scale;

            const isMoved =
              !edit.isCustom &&
              edit.originalX !== undefined &&
              edit.originalY !== undefined &&
              (Math.abs(edit.x - edit.originalX) > 1 ||
                Math.abs(edit.y - edit.originalY) > 1);

            return (
              <div key={edit.id}>
                {/* Original Text Whiteout Mask (if moved away from original spot) */}
                {isMoved && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: `${(edit.originalX || 0) * scale}px`,
                      top: `${(edit.originalY || 0) * scale}px`,
                      width: `${Math.max(
                        (edit.originalWidth || edit.width) * scale,
                        24
                      )}px`,
                      height: `${
                        (edit.originalHeight || edit.height) * scale
                      }px`,
                      backgroundColor: edit.bgColor || "#ffffff",
                    }}
                  />
                )}

                {isActive ? (
                  <div
                    className="absolute pointer-events-auto z-30 flex flex-col items-start"
                    style={{
                      left: `${editLeft}px`,
                      top: `${editTop}px`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Floating Micro-Toolbar with Move Grip */}
                    <div
                      className="mb-1 flex items-center gap-1 bg-white text-[#37352F] px-1.5 py-0.5 rounded-lg shadow-[0_4px_16px_rgba(15,15,15,0.12),0_1px_2px_rgba(15,15,15,0.06)] border border-[#37352F]/15 text-xs whitespace-nowrap animate-in fade-in select-none"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {/* Drag Handle on Toolbar */}
                      <div
                        className="cursor-grab active:cursor-grabbing px-1.5 py-0.5 hover:bg-[#37352F]/5 rounded text-[#787774] hover:text-[#37352F] flex items-center gap-1 select-none font-medium transition"
                        onPointerDown={(e) =>
                          handleStartDrag(
                            e,
                            edit.id,
                            edit.x,
                            edit.y,
                            edit.baselineY
                          )
                        }
                        title="Click and drag to move text box"
                      >
                        <Move size={12} className="text-[#2383E2]" />
                        <span className="text-[11px]">Move</span>
                      </div>

                      <span className="text-[#37352F]/15">|</span>

                      {/* Bold Toggle Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleBold(edit.id);
                        }}
                        className={`px-1.5 py-0.5 rounded transition flex items-center justify-center cursor-pointer font-bold ${
                          isBoldWeight(edit.fontWeight)
                            ? "bg-[#242424] text-white shadow-2xs"
                            : "text-[#787774] hover:text-[#37352F] hover:bg-[#37352F]/5"
                        }`}
                        title="Toggle Bold (Ctrl+B)"
                      >
                        <Bold size={12} />
                      </button>

                      {/* Italic Toggle Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleItalic(edit.id);
                        }}
                        className={`px-1.5 py-0.5 rounded transition flex items-center justify-center cursor-pointer italic ${
                          isItalicStyle(edit.fontStyle)
                            ? "bg-[#242424] text-white shadow-2xs"
                            : "text-[#787774] hover:text-[#37352F] hover:bg-[#37352F]/5"
                        }`}
                        title="Toggle Italic (Ctrl+I)"
                      >
                        <Italic size={12} />
                      </button>
                      {!edit.isCustom && (
                        <>
                          <span className="text-[#37352F]/15">|</span>
                          <button
                            type="button"
                            onClick={() => handleResetEdit(edit.id)}
                            className="flex items-center gap-1 text-[#787774] hover:text-[#37352F] hover:bg-[#37352F]/5 px-1.5 py-0.5 rounded cursor-pointer"
                            title="Reset to original text"
                          >
                            <RotateCcw size={11} />
                            <span>Reset</span>
                          </button>
                        </>
                      )}
                      <span className="text-[#37352F]/15">|</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteEdit(edit.id)}
                        className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-1.5 py-0.5 rounded cursor-pointer transition font-medium"
                        title={
                          edit.isCustom
                            ? "Delete custom text box"
                            : "Delete text from document (whiteout)"
                        }
                      >
                        <Trash2 size={11} />
                        <span>Delete</span>
                      </button>
                      <span className="text-[#37352F]/15">|</span>
                      <button
                        type="button"
                        onClick={() => setActiveEditId(null)}
                        className="text-[#787774] hover:text-[#37352F] hover:bg-[#37352F]/5 px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer font-medium"
                        title="Finish editing"
                      >
                        <Check size={11} />
                        <span>Done</span>
                      </button>
                    </div>

                    {/* Top Drag Bar Handle */}
                    <div
                      className="w-full h-1 bg-[#2383E2]/30 hover:bg-[#2383E2] cursor-grab active:cursor-grabbing rounded-t-xs transition-colors mb-0.5 flex items-center justify-center group"
                      onPointerDown={(e) =>
                        handleStartDrag(
                          e,
                          edit.id,
                          edit.x,
                          edit.y,
                          edit.baselineY
                        )
                      }
                      title="Drag to move text box"
                    >
                      <div className="w-5 h-0.5 bg-[#2383E2] rounded-full group-hover:bg-white" />
                    </div>

                    {/* Native MS-Word Inline Input (Zero Handles, Exact Subpixel Alignment) */}
                    <input
                      ref={activeInputRef}
                      type="text"
                      value={edit.text}
                      onChange={(e) => {
                        const newText = e.target.value;
                        handleTextChange(edit.id, newText);

                        // Dynamically expand box width if user types beyond original boundary
                        const estWidth = Math.max(
                          edit.width,
                          newText.length * (edit.fontSize * 0.58)
                        );
                        if (estWidth > edit.width) {
                          setPageEdits((prev) => ({
                            ...prev,
                            [pageNumber]: (prev[pageNumber] || []).map((item) =>
                              item.id === edit.id
                                ? { ...item, width: estWidth }
                                : item
                            ),
                          }));
                        }
                      }}
                      onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
                          e.preventDefault();
                          handleToggleBold(edit.id);
                          return;
                        }
                        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
                          e.preventDefault();
                          handleToggleItalic(edit.id);
                          return;
                        }
                        if (e.key === "Enter" || e.key === "Escape") {
                          setActiveEditId(null);
                        }
                      }}
                      className="outline-none focus:outline-none focus:ring-0"
                      style={{
                        backgroundColor: edit.bgColor || "#ffffff",
                        color: edit.color || "#000000",
                        fontFamily: edit.fontFamily,
                        fontSize: `${edit.fontSize * scale}px`,
                        fontWeight: edit.fontWeight,
                        fontStyle: edit.fontStyle,
                        width: `${editWidth}px`,
                        height: `${editHeight}px`,
                        lineHeight: 1,
                        padding: 0,
                        margin: 0,
                        border: "none",
                        boxShadow: "0 0 0 1.5px #2383E2",
                        borderRadius: "1px",
                        display: "block",
                        boxSizing: "content-box",
                        WebkitFontSmoothing: "antialiased",
                        MozOsxFontSmoothing: "grayscale",
                        textRendering: "geometricPrecision",
                      }}
                    />
                  </div>
                ) : (
                  // Inactive (Committed) Text Edit with Whiteout Background & Drag-to-Move
                  <div
                    onClick={(e) => {
                      if (isDrawingMode || isEraserMode) return;
                      e.stopPropagation();
                      setActiveEditId(edit.id);
                    }}
                    onPointerDown={(e) => {
                      if (isDrawingMode || isEraserMode) return;
                      // Clicking and dragging moves the text box
                      handleStartDrag(
                        e,
                        edit.id,
                        edit.x,
                        edit.y,
                        edit.baselineY
                      );
                    }}
                    className={`absolute rounded-none transition ${
                      isDrawingMode || isEraserMode
                        ? "pointer-events-none"
                        : "pointer-events-auto cursor-move hover:outline hover:outline-1 hover:outline-[#2383E2]/50"
                    }`}
                    style={{
                      left: `${editLeft}px`,
                      top: `${editTop}px`,
                      width: `${editWidth}px`,
                      height: `${editHeight}px`,
                      backgroundColor: edit.bgColor || "#ffffff",
                      color: edit.color || "#000000",
                      fontFamily: edit.fontFamily,
                      fontSize: `${edit.fontSize * scale}px`,
                      fontWeight: edit.fontWeight,
                      fontStyle: edit.fontStyle,
                      lineHeight: 1,
                      padding: 0,
                      margin: 0,
                      whiteSpace: "nowrap",
                      overflow: "visible",
                      display: "block",
                      boxSizing: "content-box",
                      WebkitFontSmoothing: "antialiased",
                      MozOsxFontSmoothing: "grayscale",
                      textRendering: "geometricPrecision",
                    }}
                    title="Click to edit, or drag to move"
                  >
                    {edit.text || "\u00A0"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default Canvas;

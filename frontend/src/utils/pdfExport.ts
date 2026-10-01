import {
  PDFDocument,
  rgb,
  StandardFonts,
  degrees,
  type PDFPage,
  type RGB,
  type PDFFont,
} from "pdf-lib";
import type { ManagedPage } from "../types/pdf";

interface ParsedColor {
  color: RGB;
  opacity: number;
}

/**
 * Parses CSS / Fabric color representations (hex, rgb, rgba, named colors)
 * into a pdf-lib RGB color and opacity.
 */
function parseColor(colorStr?: string | null): ParsedColor | null {
  if (!colorStr || colorStr === "transparent" || colorStr === "none") {
    return null;
  }

  const c = colorStr.trim().toLowerCase();

  // Standard named colors
  const named: Record<string, [number, number, number]> = {
    black: [0, 0, 0],
    white: [1, 1, 1],
    red: [0.93, 0.27, 0.27],
    green: [0.13, 0.77, 0.36],
    blue: [0.23, 0.51, 0.96],
    gray: [0.42, 0.45, 0.5],
    grey: [0.42, 0.45, 0.5],
    yellow: [0.96, 0.76, 0.15],
    cyan: [0.06, 0.73, 0.85],
    magenta: [0.85, 0.15, 0.73],
    orange: [0.98, 0.55, 0.15],
    purple: [0.66, 0.25, 0.94],
  };

  if (named[c]) {
    const [r, g, b] = named[c];
    return { color: rgb(r, g, b), opacity: 1 };
  }

  // Hex values (#RGB, #RGBA, #RRGGBB, #RRGGBBAA)
  if (c.startsWith("#")) {
    let hex = c.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .split("")
        .map((ch) => ch + ch)
        .join("");
    }
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      return { color: rgb(r, g, b), opacity: 1 };
    }
    if (hex.length === 8) {
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      const a = parseInt(hex.substring(6, 8), 16) / 255;
      return { color: rgb(r, g, b), opacity: isNaN(a) ? 1 : a };
    }
  }

  // RGB and RGBA formats
  const rgbaMatch = c.match(
    /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/
  );
  if (rgbaMatch) {
    const r = Math.min(255, parseInt(rgbaMatch[1], 10)) / 255;
    const g = Math.min(255, parseInt(rgbaMatch[2], 10)) / 255;
    const b = Math.min(255, parseInt(rgbaMatch[3], 10)) / 255;
    const a =
      rgbaMatch[4] !== undefined ? Math.min(1, parseFloat(rgbaMatch[4])) : 1;
    return { color: rgb(r, g, b), opacity: isNaN(a) ? 1 : a };
  }

  return { color: rgb(0, 0, 0), opacity: 1 };
}

function normalizeTextColor(color?: string): string {
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
      if (isNeutral && lum < 125) {
        return "#000000";
      }
    }
  }
  return color;
}

/**
 * Replaces or removes characters that cannot be encoded by standard PDF fonts (WinAnsi).
 * Prevents export failures on emojis, non-standard quotes, dashes, etc.
 */
function sanitizePdfText(text: string, font: PDFFont): string {
  let clean = "";
  for (const char of text) {
    try {
      font.encodeText(char);
      clean += char;
    } catch {
      if (char === "\u2018" || char === "\u2019") clean += "'";
      else if (char === "\u201C" || char === "\u201D") clean += '"';
      else if (char === "\u2013" || char === "\u2014") clean += "-";
      else if (char === "\u2026") clean += "...";
      else if (char === "\u2022") clean += "*";
      // Unencodable symbols/emojis are omitted safely
    }
  }
  return clean;
}

/**
 * Word-wraps text into lines that fit within maxWidth.
 */
function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
): string[] {
  const result: string[] = [];
  const paragraphs = text.split("\n");
  for (const paragraph of paragraphs) {
    if (!paragraph) {
      result.push("");
      continue;
    }
    const words = paragraph.split(" ");
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      try {
        const width = font.widthOfTextAtSize(testLine, fontSize);
        if (width <= maxWidth || !currentLine) {
          currentLine = testLine;
        } else {
          result.push(currentLine);
          currentLine = word;
        }
      } catch {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      result.push(currentLine);
    }
  }
  return result;
}

/**
 * Draws a serialized Fabric.js object onto a pdf-lib PDFPage.
 * Supports rectangles, circles, textboxes, SVG paths, and images/signatures.
 */
async function drawFabricObjectOnPage(
  pdfDoc: PDFDocument,
  page: PDFPage,
  obj: any,
  fonts: Record<string, any>
) {
  const pageHeight = page.getHeight();
  const objOpacity = typeof obj.opacity === "number" ? obj.opacity : 1;

  const left = obj.left || 0;
  const top = obj.top || 0;
  const scaleX = obj.scaleX || 1;
  const scaleY = obj.scaleY || 1;

  const fillParsed = parseColor(obj.fill);
  const strokeParsed = parseColor(obj.stroke);
  const strokeWidth = (obj.strokeWidth || 0) * scaleX;

  const type = (obj.type || "").toLowerCase();

  if (type === "rect") {
    const width = (obj.width || 0) * scaleX;
    const height = (obj.height || 0) * scaleY;
    const pdfY = pageHeight - top - height;

    page.drawRectangle({
      x: left,
      y: pdfY,
      width,
      height,
      color: fillParsed ? fillParsed.color : undefined,
      opacity: fillParsed ? fillParsed.opacity * objOpacity : undefined,
      borderColor: strokeParsed ? strokeParsed.color : undefined,
      borderOpacity: strokeParsed ? strokeParsed.opacity * objOpacity : undefined,
      borderWidth: strokeWidth,
      rotate: obj.angle ? degrees(-obj.angle) : undefined,
    });
  } else if (type === "circle") {
    const radius = (obj.radius || 0) * scaleX;
    const isCenterOrigin =
      obj.originX === "center" && obj.originY === "center";
    const centerX = isCenterOrigin ? left : left + radius;
    const centerY = isCenterOrigin
      ? pageHeight - top
      : pageHeight - (top + radius);

    page.drawCircle({
      x: centerX,
      y: centerY,
      size: radius,
      color: fillParsed ? fillParsed.color : undefined,
      opacity: fillParsed ? fillParsed.opacity * objOpacity : undefined,
      borderColor: strokeParsed ? strokeParsed.color : undefined,
      borderOpacity: strokeParsed ? strokeParsed.opacity * objOpacity : undefined,
      borderWidth: strokeWidth,
    });
  } else if (type === "textbox" || type === "text" || type === "i-text") {
    const rawText = obj.text || "";
    if (!rawText.trim()) return;

    const fontSize = (obj.fontSize || 16) * scaleY;
    const font = selectPdfFont(
      fonts,
      obj.fontFamily,
      obj.fontWeight,
      obj.fontStyle
    );

    const bgParsed = parseColor(obj.backgroundColor);
    const pad = (obj.padding || 0) * scaleX;
    const strokeWidth = (obj.strokeWidth || 0) * scaleX;
    const strokeParsed = parseColor(obj.stroke);

    const text = sanitizePdfText(rawText, font);
    if (!text.trim()) return;

    const targetWidth = Math.max((obj.width || 0) * scaleX, 40);
    const lines = wrapText(text, font, fontSize, targetWidth);
    const lineHeight = (obj.lineHeight || 1.3) * fontSize;
    const totalTextHeight = lines.length * lineHeight;

    if (bgParsed) {
      const boxWidth = Math.max(targetWidth + pad * 2, 20);
      const boxHeight = Math.max((obj.height || 0) * scaleY + pad * 2, totalTextHeight + pad * 2);
      const boxLeft = left - pad;
      const boxTop = top - pad;
      const pdfY = pageHeight - boxTop - boxHeight;

      page.drawRectangle({
        x: boxLeft,
        y: pdfY,
        width: boxWidth,
        height: boxHeight,
        color: bgParsed.color,
        opacity: bgParsed.opacity * objOpacity,
        borderColor: strokeParsed ? strokeParsed.color : undefined,
        borderWidth: strokeWidth,
        borderOpacity: strokeParsed ? strokeParsed.opacity * objOpacity : undefined,
      });
    }

    const ascent = fontSize * 0.8;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const lineY = pageHeight - top - ascent - i * lineHeight;
      page.drawText(line, {
        x: left,
        y: lineY,
        size: fontSize,
        font,
        lineHeight,
        color: fillParsed ? fillParsed.color : rgb(0, 0, 0),
        opacity: fillParsed ? fillParsed.opacity * objOpacity : objOpacity,
      });
    }
  } else if (type === "path") {
    try {
      let svgPathStr = "";
      if (typeof obj.path === "string") {
        svgPathStr = obj.path;
      } else if (Array.isArray(obj.path)) {
        svgPathStr = obj.path
          .map((seg: any) => (Array.isArray(seg) ? seg.join(" ") : String(seg)))
          .join(" ");
      }

      if (svgPathStr) {
        const scale = obj.scaleX || 1;
        const pathOffsetX = (obj.pathOffset?.x || 0) * scale;
        const pathOffsetY = (obj.pathOffset?.y || 0) * scale;
        const dx = (obj.left || 0) - pathOffsetX;
        const dy = (obj.top || 0) - pathOffsetY;

        const strokeParsed = parseColor(obj.stroke || "#000000");
        const fillParsed = parseColor(obj.fill);
        const strokeWidth = (obj.strokeWidth || 1) * scale;

        page.drawSvgPath(svgPathStr, {
          x: dx,
          y: pageHeight - dy,
          scale: scale !== 1 ? scale : undefined,
          rotate: obj.angle ? degrees(-obj.angle) : undefined,
          color: fillParsed ? fillParsed.color : undefined,
          opacity: fillParsed ? fillParsed.opacity * objOpacity : undefined,
          borderColor: strokeParsed ? strokeParsed.color : undefined,
          borderOpacity: strokeParsed ? strokeParsed.opacity * objOpacity : undefined,
          borderWidth: strokeWidth,
        });
      }
    } catch (pathErr) {
      console.warn("Could not export fabric path to PDF:", pathErr);
    }
  } else if (type === "image") {
    // Digital signatures, stamps, and placed images
    try {
      const src = obj.src;
      if (!src) return;

      let imageBytes: Uint8Array;
      if (src.startsWith("data:")) {
        const base64Data = src.split(",")[1];
        const binaryString = atob(base64Data);
        imageBytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          imageBytes[i] = binaryString.charCodeAt(i);
        }
      } else {
        const res = await fetch(src);
        imageBytes = new Uint8Array(await res.arrayBuffer());
      }

      let embeddedImage;
      try {
        if (src.includes("image/jpeg") || src.includes("image/jpg")) {
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        } else {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        }
      } catch {
        try {
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        } catch {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        }
      }

      const width = (obj.width || 0) * scaleX;
      const height = (obj.height || 0) * scaleY;
      const pdfY = pageHeight - top - height;

      page.drawImage(embeddedImage, {
        x: left,
        y: pdfY,
        width,
        height,
        opacity: objOpacity,
        rotate: obj.angle ? degrees(-obj.angle) : undefined,
      });
    } catch (imgErr) {
      console.warn("Could not export fabric image object to PDF:", imgErr);
    }
  }
}

function selectPdfFont(
  fonts: Record<string, any>,
  fontFamily?: string,
  fontWeight?: string | number,
  fontStyle?: string
) {
  const family = (fontFamily || "").toLowerCase();
  const isBold =
    fontWeight === "bold" ||
    fontWeight === 700 ||
    fontWeight === "700" ||
    family.includes("bold");
  const isItalic =
    fontStyle === "italic" ||
    fontStyle === "oblique" ||
    family.includes("italic") ||
    family.includes("oblique");

  const isSerif =
    family.includes("times") ||
    family.includes("roman") ||
    family.includes("georgia") ||
    (family.includes("serif") && !family.includes("sans"));

  const isMono =
    family.includes("courier") ||
    family.includes("mono") ||
    family.includes("console");

  if (isSerif) {
    if (isBold && isItalic) return fonts.timesRomanBoldItalic;
    if (isBold) return fonts.timesRomanBold;
    if (isItalic) return fonts.timesRomanItalic;
    return fonts.timesRoman;
  }

  if (isMono) {
    if (isBold && isItalic) return fonts.courierBoldOblique;
    if (isBold) return fonts.courierBold;
    if (isItalic) return fonts.courierOblique;
    return fonts.courier;
  }

  if (isBold && isItalic) return fonts.helveticaBoldOblique;
  if (isBold) return fonts.helveticaBold;
  if (isItalic) return fonts.helveticaOblique;
  return fonts.helvetica;
}

export interface TextEditExport {
  id?: string;
  originalText?: string;
  text: string;
  x: number;
  y: number;
  baselineY?: number;
  originalX?: number;
  originalY?: number;
  originalWidth?: number;
  originalHeight?: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  color?: string;
  bgColor?: string;
}

export interface ExportPdfParams {
  pdfUrl: string;
  pageAnnotations: Record<string | number, any>;
  currentPageNumber: number;
  currentFabricData?: any;
  pageTextEdits?: Record<string | number, TextEditExport[]>;
  pagesConfig?: ManagedPage[];
  currentPageId?: string;
}

/**
 * Helper to burn DOM text edits (whiteout + replacement vector text) onto a PDF page.
 */
function burnTextEditsOnPage(
  page: PDFPage,
  textEdits: TextEditExport[],
  fonts: Record<string, any>
) {
  const pageHeight = page.getHeight();

  for (const edit of textEdits) {
    const fontSize = edit.fontSize || 14;
    const font = selectPdfFont(
      fonts,
      edit.fontFamily,
      edit.fontWeight,
      edit.fontStyle
    );

    const padX = 2;
    const padY = 2;

    // 1. Mask original text location (so original text is hidden)
    const maskX = edit.originalX !== undefined ? edit.originalX : edit.x;
    const maskY = edit.originalY !== undefined ? edit.originalY : edit.y;
    const maskWidth =
      edit.originalWidth !== undefined ? edit.originalWidth : edit.width;
    const maskHeight =
      edit.originalHeight !== undefined ? edit.originalHeight : edit.height;

    const boxWidth = Math.max(maskWidth + padX * 2, 20);
    const boxHeight = Math.max(maskHeight + padY * 2, fontSize * 1.25);
    const pdfY = pageHeight - maskY - boxHeight;

    const bgParsed = parseColor(edit.bgColor || "#ffffff");
    page.drawRectangle({
      x: maskX - padX,
      y: pdfY,
      width: boxWidth,
      height: boxHeight,
      color: bgParsed ? bgParsed.color : rgb(1, 1, 1),
      opacity: 1,
      borderWidth: 0,
    });

    // 2. If moved, also white out the background under the new text position
    const isMoved =
      edit.originalX !== undefined &&
      (Math.abs(edit.x - edit.originalX) > 1 ||
        Math.abs(edit.y - (edit.originalY || edit.y)) > 1);

    if (isMoved) {
      const newBoxWidth = Math.max(edit.width + padX * 2, 20);
      const newBoxHeight = Math.max(edit.height + padY * 2, fontSize * 1.25);
      const newPdfY = pageHeight - edit.y - newBoxHeight;
      page.drawRectangle({
        x: edit.x - padX,
        y: newPdfY,
        width: newBoxWidth,
        height: newBoxHeight,
        color: bgParsed ? bgParsed.color : rgb(1, 1, 1),
        opacity: 1,
        borderWidth: 0,
      });
    }

    // 3. Draw replacement text at its current (edit.x, edit.y) position
    const cleanText = sanitizePdfText(edit.text || "", font);
    if (cleanText && cleanText.trim()) {
      const textY =
        edit.baselineY !== undefined
          ? pageHeight - edit.baselineY
          : pageHeight - edit.y - fontSize * 0.8;
      const colorParsed = parseColor(normalizeTextColor(edit.color));

      page.drawText(cleanText, {
        x: edit.x,
        y: textY,
        size: fontSize,
        font,
        lineHeight: 1.15 * fontSize,
        color: colorParsed ? colorParsed.color : rgb(0, 0, 0),
      });
    }
  }
}

/**
 * Loads the original PDF and burns all Fabric.js vector annotations, image stamps,
 * and DOM text edits from each page into the document, honoring custom page ordering,
 * rotation, duplication, and deletions.
 */
export async function exportPdfWithAnnotations(
  params: ExportPdfParams
): Promise<Uint8Array> {
  const {
    pdfUrl,
    pageAnnotations,
    currentPageNumber,
    currentFabricData,
    pageTextEdits,
    pagesConfig,
    currentPageId,
  } = params;

  // 1. Fetch raw PDF bytes from url (blob: or network)
  const response = await fetch(pdfUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch original PDF: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();

  // 2. Load original PDF document with pdf-lib
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // 3. Merge active page's live annotations
  const mergedAnnotations: Record<string | number, any> = { ...pageAnnotations };
  if (currentFabricData) {
    if (currentPageId) {
      mergedAnnotations[currentPageId] = currentFabricData;
    }
    mergedAnnotations[currentPageNumber] = currentFabricData;
  }

  // 4. If pagesConfig is provided, build final document with reordered/rotated/duplicated pages
  if (pagesConfig && pagesConfig.length > 0) {
    const outDoc = await PDFDocument.create();

    const fonts = {
      helvetica: await outDoc.embedFont(StandardFonts.Helvetica),
      helveticaBold: await outDoc.embedFont(StandardFonts.HelveticaBold),
      helveticaOblique: await outDoc.embedFont(StandardFonts.HelveticaOblique),
      helveticaBoldOblique: await outDoc.embedFont(
        StandardFonts.HelveticaBoldOblique
      ),
      timesRoman: await outDoc.embedFont(StandardFonts.TimesRoman),
      timesRomanBold: await outDoc.embedFont(StandardFonts.TimesRomanBold),
      timesRomanItalic: await outDoc.embedFont(StandardFonts.TimesRomanItalic),
      timesRomanBoldItalic: await outDoc.embedFont(
        StandardFonts.TimesRomanBoldItalic
      ),
      courier: await outDoc.embedFont(StandardFonts.Courier),
      courierBold: await outDoc.embedFont(StandardFonts.CourierBold),
      courierOblique: await outDoc.embedFont(StandardFonts.CourierOblique),
      courierBoldOblique: await outDoc.embedFont(
        StandardFonts.CourierBoldOblique
      ),
    };

    for (let i = 0; i < pagesConfig.length; i++) {
      const cfg = pagesConfig[i];
      const [copiedPage] = await outDoc.copyPages(pdfDoc, [cfg.originalIndex]);
      const origRot = copiedPage.getRotation().angle;
      const finalRot = (((origRot + cfg.rotation) % 360) + 360) % 360;
      copiedPage.setRotation(degrees(finalRot));
      const page = outDoc.addPage(copiedPage);

      // Burn DOM text edits for this page
      const textEdits =
        pageTextEdits?.[cfg.id] ||
        pageTextEdits?.[i + 1] ||
        pageTextEdits?.[cfg.originalIndex + 1];

      if (Array.isArray(textEdits) && textEdits.length > 0) {
        burnTextEditsOnPage(page, textEdits, fonts);
      }

      // Burn Fabric vector shapes & image stamps for this page
      const pageData =
        (cfg.id === currentPageId || i + 1 === currentPageNumber) &&
        currentFabricData
          ? currentFabricData
          : mergedAnnotations[cfg.id] ||
            mergedAnnotations[i + 1] ||
            mergedAnnotations[cfg.originalIndex + 1];

      if (
        pageData &&
        Array.isArray(pageData.objects) &&
        pageData.objects.length > 0
      ) {
        for (const obj of pageData.objects) {
          await drawFabricObjectOnPage(outDoc, page, obj, fonts);
        }
      }
    }

    return await outDoc.save();
  } else {
    // Standard sequential export
    const fonts = {
      helvetica: await pdfDoc.embedFont(StandardFonts.Helvetica),
      helveticaBold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
      helveticaOblique: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
      helveticaBoldOblique: await pdfDoc.embedFont(
        StandardFonts.HelveticaBoldOblique
      ),
      timesRoman: await pdfDoc.embedFont(StandardFonts.TimesRoman),
      timesRomanBold: await pdfDoc.embedFont(StandardFonts.TimesRomanBold),
      timesRomanItalic: await pdfDoc.embedFont(StandardFonts.TimesRomanItalic),
      timesRomanBoldItalic: await pdfDoc.embedFont(
        StandardFonts.TimesRomanBoldItalic
      ),
      courier: await pdfDoc.embedFont(StandardFonts.Courier),
      courierBold: await pdfDoc.embedFont(StandardFonts.CourierBold),
      courierOblique: await pdfDoc.embedFont(StandardFonts.CourierOblique),
      courierBoldOblique: await pdfDoc.embedFont(
        StandardFonts.CourierBoldOblique
      ),
    };

    const totalPages = pdfDoc.getPageCount();

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = pdfDoc.getPage(pageNum - 1);

      // Burn DOM text edits
      const textEdits = pageTextEdits?.[pageNum];
      if (Array.isArray(textEdits) && textEdits.length > 0) {
        burnTextEditsOnPage(page, textEdits, fonts);
      }

      // Burn Fabric vector shapes & image stamps
      const pageData = mergedAnnotations[pageNum];
      if (
        pageData &&
        Array.isArray(pageData.objects) &&
        pageData.objects.length > 0
      ) {
        for (const obj of pageData.objects) {
          await drawFabricObjectOnPage(pdfDoc, page, obj, fonts);
        }
      }
    }

    return await pdfDoc.save();
  }
}

/**
 * Triggers a browser file download of the generated PDF bytes.
 */
export function downloadPdfBlob(
  pdfBytes: Uint8Array,
  fileName: string = "edited-document.pdf"
): void {
  const blob = new Blob([pdfBytes as unknown as BlobPart], {
    type: "application/pdf",
  });
  const downloadUrl = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

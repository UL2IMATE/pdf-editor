import { PDFDocument, rgb, StandardFonts, type PDFPage, type RGB } from "pdf-lib";

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
 * Draws a serialized Fabric.js object onto a pdf-lib PDFPage.
 */
function drawFabricObjectOnPage(
  page: PDFPage,
  obj: any,
  fonts: { helvetica: any; helveticaBold: any }
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
    const text = obj.text || "";
    if (!text.trim()) return;

    const fontSize = (obj.fontSize || 16) * scaleY;
    const font = selectPdfFont(
      fonts,
      obj.fontFamily,
      obj.fontWeight,
      obj.fontStyle
    );

    // If a background color is set (e.g. #ffffff to cover the original PDF text),
    // draw a solid rectangle behind the replacement text box
    const bgParsed = parseColor(obj.backgroundColor);
    if (bgParsed) {
      const boxWidth = Math.max((obj.width || 0) * scaleX, 20);
      const boxHeight = Math.max((obj.height || 0) * scaleY, fontSize * 1.25);
      const pdfY = pageHeight - top - boxHeight;

      page.drawRectangle({
        x: left,
        y: pdfY,
        width: boxWidth,
        height: boxHeight,
        color: bgParsed.color,
        opacity: bgParsed.opacity * objOpacity,
        borderWidth: 0,
      });
    }

    const lineHeight = (obj.lineHeight || 1.2) * fontSize;
    const ascent = fontSize * 0.8;
    const textY = pageHeight - top - ascent;

    page.drawText(text, {
      x: left,
      y: textY,
      size: fontSize,
      font,
      lineHeight,
      color: fillParsed ? fillParsed.color : rgb(0, 0, 0),
      opacity: fillParsed ? fillParsed.opacity * objOpacity : objOpacity,
    });
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
  pageAnnotations: Record<number, any>;
  currentPageNumber: number;
  currentFabricData?: any;
  pageTextEdits?: Record<number, TextEditExport[]>;
}

/**
 * Loads the original PDF and burns all Fabric.js vector annotations and DOM text edits from each page into the document.
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
  } = params;

  // 1. Fetch raw PDF bytes from url (blob: or network)
  const response = await fetch(pdfUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch original PDF: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();

  // 2. Load with pdf-lib and embed standard typography font families
  const pdfDoc = await PDFDocument.load(arrayBuffer);
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

  // 3. Merge active page's live annotations
  const mergedAnnotations: Record<number, any> = { ...pageAnnotations };
  if (currentFabricData) {
    mergedAnnotations[currentPageNumber] = currentFabricData;
  }

  const totalPages = pdfDoc.getPageCount();

  // 4. Burn text edits and annotations onto respective pages
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = pdfDoc.getPage(pageNum - 1);
    const pageHeight = page.getHeight();

    // 4a. Burn DOM text edits (whiteout + replacement vector text)
    const textEdits = pageTextEdits?.[pageNum];
    if (Array.isArray(textEdits) && textEdits.length > 0) {
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
        if (edit.text && edit.text.trim()) {
          const textY =
            edit.baselineY !== undefined
              ? pageHeight - edit.baselineY
              : pageHeight - edit.y - fontSize * 0.8;
          const colorParsed = parseColor(normalizeTextColor(edit.color));

          page.drawText(edit.text, {
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

    // 4b. Burn Fabric vector shapes
    const pageData = mergedAnnotations[pageNum];
    if (
      pageData &&
      Array.isArray(pageData.objects) &&
      pageData.objects.length > 0
    ) {
      for (const obj of pageData.objects) {
        drawFabricObjectOnPage(page, obj, fonts);
      }
    }
  }


  // 5. Output PDF bytes
  return await pdfDoc.save();
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

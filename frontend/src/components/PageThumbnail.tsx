import { useEffect, useRef } from "react";

interface PageThumbnailProps {
  pdfDoc: any;
  originalIndex: number;
  rotation?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function PageThumbnail({
  pdfDoc,
  originalIndex,
  rotation = 0,
  maxWidth = 110,
  maxHeight = 145,
}: PageThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!pdfDoc) return;
    let cancel = false;
    let renderTask: any = null;

    pdfDoc
      .getPage(originalIndex + 1)
      .then((page: any) => {
        if (cancel) return;
        const totalRotation =
          (((page.rotate || 0) + (rotation || 0)) % 360 + 360) % 360;
        const unscaledViewport = page.getViewport({
          scale: 1,
          rotation: totalRotation,
        });

        // Compute thumbnail scale to fit within maxWidth x maxHeight
        const scale = Math.min(
          maxWidth / unscaledViewport.width,
          maxHeight / unscaledViewport.height
        );
        const viewport = page.getViewport({ scale, rotation: totalRotation });

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        renderTask = page.render({
          canvasContext: ctx,
          viewport,
        });

        return renderTask.promise;
      })
      .catch((err: any) => {
        if (err?.name !== "RenderingCancelledException") {
          console.warn("Thumbnail render error:", err);
        }
      });

    return () => {
      cancel = true;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, originalIndex, rotation, maxWidth, maxHeight]);

  return (
    <div
      style={{ width: `${maxWidth}px`, height: `${maxHeight}px` }}
      className="flex items-center justify-center bg-[#F7F6F3] rounded border border-[#37352F]/10 overflow-hidden shadow-2xs"
    >
      <canvas ref={canvasRef} className="block shadow-xs" />
    </div>
  );
}

export default PageThumbnail;

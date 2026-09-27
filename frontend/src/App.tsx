import { Controls } from "./components/controls";
import { useState, useRef, useCallback } from "react";
import { Canvas, type CanvasHandle } from "./components/canvas";
import { MainPage } from "./components/mainPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export function App() {
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const canvasRef = useRef<CanvasHandle | null>(null);

  const handlePrevPage = useCallback(() => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPageNumber((prev) =>
      totalPages > 0 ? Math.min(totalPages, prev + 1) : prev + 1,
    );
  }, [totalPages]);

  const handleUrl = useCallback((fileUrl: string) => {
    setUrl(fileUrl);
  }, []);

  const handleFile = useCallback((file: File) => {
    setPdfFile(file);
  }, []);

  const handleLoadSuccess = useCallback((num: number) => {
    setTotalPages(num);
  }, []);

  const handlePageRenderingChange = useCallback((loading: boolean) => {
    setIsPageLoading(loading);
  }, []);

  const handleExport = async () => {
    if (!canvasRef.current) return;
    try {
      setIsExporting(true);
      await canvasRef.current.exportDocument();
    } catch (err: unknown) {
      console.error("Export failed:", err);
      alert(err instanceof Error ? err.message : "Failed to export PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <MainPage handleUrl={handleUrl} handleFile={handleFile} />
          }
        />
        <Route
          path="/Editing"
          element={
            <div className="min-h-screen bg-[#F7F6F3] flex flex-col items-center">
              <header className="sticky top-0 z-30 w-full">
                <Controls
                  pageNumber={pageNumber}
                  totalPages={totalPages}
                  handlePrevPage={handlePrevPage}
                  handleNextPage={handleNextPage}
                  handleExport={handleExport}
                  isExporting={isExporting}
                  isPageLoading={isPageLoading}
                />
              </header>
              <main className="w-full flex-1 flex justify-center items-start p-6 overflow-auto">
                <Canvas
                  ref={canvasRef}
                  pageNumber={pageNumber}
                  pdfUrl={url || undefined}
                  pdfFile={pdfFile || undefined}
                  onLoadSuccess={handleLoadSuccess}
                  onPageRenderingChange={handlePageRenderingChange}
                />
              </main>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}



export default App;

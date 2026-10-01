import { Controls } from "./components/controls";
import { useState, useRef, useCallback, useEffect } from "react";
import { Canvas, type CanvasHandle } from "./components/canvas";
import { MainPage } from "./components/mainPage";
import { PageManagerModal } from "./components/PageManagerModal";
import { ThumbnailSidebar } from "./components/ThumbnailSidebar";
import { ShortcutsModal } from "./components/ShortcutsModal";
import type { ManagedPage } from "./types/pdf";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export function App() {
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pages, setPages] = useState<ManagedPage[]>([]);
  const [pdfDocProxy, setPdfDocProxy] = useState<any>(null);
  const [isPageManagerModalOpen, setIsPageManagerModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

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
      totalPages > 0 ? Math.min(totalPages, prev + 1) : prev + 1
    );
  }, [totalPages]);

  const handleUrl = useCallback((fileUrl: string) => {
    setUrl(fileUrl);
  }, []);

  const handleFile = useCallback((file: File) => {
    setPdfFile(file);
  }, []);

  const handleLoadSuccess = useCallback(
    (num: number, docProxy?: any) => {
      setTotalPages(num);
      if (docProxy) {
        setPdfDocProxy(docProxy);
      }
      // Initialize managed pages
      const initialPages: ManagedPage[] = Array.from({ length: num }, (_, i) => ({
        id: `page_${i + 1}_${Math.random().toString(36).slice(2, 8)}`,
        originalIndex: i,
        rotation: 0,
      }));
      setPages(initialPages);
    },
    []
  );

  const handlePageRenderingChange = useCallback((loading: boolean) => {
    setIsPageLoading(loading);
  }, []);

  // Page Management Handlers
  const handleRotatePage = useCallback(
    (index: number) => {
      setPages((prev) => {
        if (prev.length === 0 && totalPages > 0) {
          return Array.from({ length: totalPages }, (_, i) => ({
            id: `page_${i + 1}_${Math.random().toString(36).slice(2, 8)}`,
            originalIndex: i,
            rotation: i === index ? 90 : 0,
          }));
        }
        return prev.map((p, idx) =>
          idx === index
            ? { ...p, rotation: (((p.rotation + 90) % 360) + 360) % 360 }
            : p
        );
      });
    },
    [totalPages]
  );

  const handleMovePage = useCallback(
    (fromIndex: number, toIndex: number) => {
      setPages((prev) => {
        if (
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= prev.length ||
          toIndex >= prev.length
        ) {
          return prev;
        }
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      });

      // Synchronize active page view with the moved page
      if (pageNumber === fromIndex + 1) {
        setPageNumber(toIndex + 1);
      } else if (fromIndex < pageNumber - 1 && toIndex >= pageNumber - 1) {
        setPageNumber((p) => p - 1);
      } else if (fromIndex > pageNumber - 1 && toIndex <= pageNumber - 1) {
        setPageNumber((p) => p + 1);
      }
    },
    [pageNumber]
  );

  const handleDuplicatePage = useCallback((index: number) => {
    setPages((prev) => {
      const target = prev[index];
      if (!target) return prev;
      const duplicated: ManagedPage = {
        id: `page_dup_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        originalIndex: target.originalIndex,
        rotation: target.rotation,
      };
      const next = [...prev];
      next.splice(index + 1, 0, duplicated);
      return next;
    });
    setTotalPages((prev) => prev + 1);
  }, []);

  const handleDeletePage = useCallback((index: number) => {
    setPages((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, idx) => idx !== index);
    });
    setTotalPages((prev) => Math.max(1, prev - 1));
    setPageNumber((prev) => {
      if (prev > pages.length - 1) return Math.max(1, pages.length - 1);
      if (prev === index + 1) return Math.max(1, index);
      return prev;
    });
  }, [pages.length]);

  const handleSelectPage = useCallback((displayPageNum: number) => {
    setPageNumber(displayPageNum);
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

  // Global Keyboard Shortcuts (when not typing in an input/textarea)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping =
        activeEl?.tagName === "INPUT" ||
        activeEl?.tagName === "TEXTAREA" ||
        (activeEl as HTMLElement)?.isContentEditable;
      if (isTyping) return;

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === "[") {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      } else if (
        e.key === "ArrowLeft" &&
        !isPageManagerModalOpen &&
        !isShortcutsOpen
      ) {
        e.preventDefault();
        handlePrevPage();
      } else if (
        e.key === "ArrowRight" &&
        !isPageManagerModalOpen &&
        !isShortcutsOpen
      ) {
        e.preventDefault();
        handleNextPage();
      } else if (
        (e.key === "r" || e.key === "R") &&
        !e.ctrlKey &&
        !e.metaKey &&
        !isPageManagerModalOpen &&
        !isShortcutsOpen
      ) {
        e.preventDefault();
        handleRotatePage(pageNumber - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isPageManagerModalOpen,
    isShortcutsOpen,
    handlePrevPage,
    handleNextPage,
    handleRotatePage,
    pageNumber,
  ]);

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
            <div className="h-screen w-screen bg-[#F7F6F3] flex flex-col overflow-hidden">
              <header className="sticky top-0 z-30 w-full shrink-0">
                <Controls
                  pageNumber={pageNumber}
                  totalPages={totalPages}
                  handlePrevPage={handlePrevPage}
                  handleNextPage={handleNextPage}
                  handleExport={handleExport}
                  isExporting={isExporting}
                  isPageLoading={isPageLoading}
                  onOpenSignatureModal={() =>
                    canvasRef.current?.openSignatureModal()
                  }
                  onOpenPageManagerModal={() => setIsPageManagerModalOpen(true)}
                  isSidebarOpen={isSidebarOpen}
                  onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
                  onOpenShortcuts={() => setIsShortcutsOpen(true)}
                />
              </header>

              {/* Main Workspace Area with Collapsible Sidebar & Canvas */}
              <div className="flex-1 w-full flex overflow-hidden relative">
                <ThumbnailSidebar
                  isOpen={isSidebarOpen}
                  onClose={() => setIsSidebarOpen(false)}
                  pdfDoc={pdfDocProxy}
                  pages={pages}
                  currentPageNumber={pageNumber}
                  onSelectPage={handleSelectPage}
                  onRotatePage={handleRotatePage}
                />

                <main className="flex-1 h-full flex justify-center items-start p-6 overflow-auto relative">
                  <Canvas
                    ref={canvasRef}
                    pageNumber={pageNumber}
                    pdfUrl={url || undefined}
                    pdfFile={pdfFile || undefined}
                    managedPages={pages}
                    onLoadSuccess={handleLoadSuccess}
                    onPageRenderingChange={handlePageRenderingChange}
                    onRotateCurrentPage={() => handleRotatePage(pageNumber - 1)}
                    isSidebarOpen={isSidebarOpen}
                  />
                </main>
              </div>

              {/* Page Manager Modal */}
              <PageManagerModal
                isOpen={isPageManagerModalOpen}
                onClose={() => setIsPageManagerModalOpen(false)}
                pdfDoc={pdfDocProxy}
                pages={pages}
                currentPageNumber={pageNumber}
                onSelectPage={handleSelectPage}
                onRotatePage={handleRotatePage}
                onMovePage={handleMovePage}
                onDuplicatePage={handleDuplicatePage}
                onDeletePage={handleDeletePage}
              />

              {/* Keyboard Shortcuts Modal */}
              <ShortcutsModal
                isOpen={isShortcutsOpen}
                onClose={() => setIsShortcutsOpen(false)}
              />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

import { useEffect } from "react";
import { X, Keyboard, Command, MousePointer, Edit3 } from "lucide-react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutSection {
  title: string;
  icon: any;
  items: ShortcutItem[];
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sections: ShortcutSection[] = [
    {
      title: "Navigation & View",
      icon: MousePointer,
      items: [
        { keys: ["H"], description: "Hand / Pan Tool" },
        { keys: ["V"], description: "Select / Pointer Tool" },
        { keys: ["Space", "Drag"], description: "Pan smoothly around canvas" },
        { keys: ["["], description: "Toggle Page Thumbnails sidebar" },
        { keys: ["←", "→"], description: "Previous / Next Page" },
        { keys: ["R"], description: "Rotate current page 90° clockwise" },
        { keys: ["Ctrl", "+ / -"], description: "Zoom in / Zoom out" },
        { keys: ["Click 100%"], description: "Reset zoom to 100%" },
      ],
    },
    {
      title: "Editing & Formatting",
      icon: Edit3,
      items: [
        { keys: ["Click Text"], description: "Edit original PDF text in-place" },
        { keys: ["Ctrl", "B"], description: "Toggle bold on text or note" },
        { keys: ["Ctrl", "I"], description: "Toggle italic on text or note" },
        { keys: ["Enter / Esc"], description: "Finish / Exit inline text editing" },
      ],
    },
    {
      title: "Objects & Shapes",
      icon: Command,
      items: [
        { keys: ["Backspace / Del"], description: "Delete selected shape, note, or text" },
        { keys: ["Click Object"], description: "Open properties panel on the right" },
        { keys: ["?"], description: "Toggle this keyboard shortcuts guide" },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-[0_12px_40px_rgba(15,15,15,0.15),0_1px_3px_rgba(15,15,15,0.06)] border border-[#37352F]/15 w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col text-[#37352F]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#37352F]/10 bg-[#FBFBFA]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#2383E2]/10 text-[#2383E2] rounded-md">
              <Keyboard size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#37352F]">
                Keyboard Shortcuts
              </h2>
              <p className="text-[11px] text-[#787774]">
                Quick keys to speed up your document editing workflow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9B9A97] hover:text-[#37352F] hover:bg-[#37352F]/5 p-1 rounded-md transition cursor-pointer"
            title="Close (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#787774]">
                  <Icon size={12} className="text-[#2383E2]" />
                  <span>{section.title}</span>
                </div>
                <div className="divide-y divide-[#37352F]/6 bg-[#FBFBFA] rounded-lg border border-[#37352F]/10 overflow-hidden">
                  {section.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-2 text-xs"
                    >
                      <span className="text-[#37352F]">{item.description}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {item.keys.map((k, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="px-1.5 py-0.5 text-[11px] font-mono font-medium text-[#37352F] bg-white border border-[#37352F]/15 rounded shadow-2xs"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#37352F]/10 bg-[#FBFBFA] flex items-center justify-between text-xs">
          <span className="text-[#787774] text-[11px]">
            Tip: Press <kbd className="px-1 py-0.2 bg-white border border-[#37352F]/15 rounded text-[#37352F] font-mono">?</kbd> anytime to open this dialog
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#242424] hover:bg-[#37352F] text-white rounded-md text-xs font-medium transition cursor-pointer shadow-2xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShortcutsModal;

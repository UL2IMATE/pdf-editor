import { Link } from "react-router-dom";

interface PdfLogoProps {
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  clickable?: boolean;
  className?: string;
}

export function PdfLogoMark({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <div
      className={`relative shrink-0 flex items-center justify-center bg-[#242424] text-white rounded-[7px] shadow-xs border border-[#191919] select-none ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[65%] h-[65%]"
      >
        {/* Document sheet */}
        <path
          d="M6 3.5C5.17157 3.5 4.5 4.17157 4.5 5V19C4.5 19.8284 5.17157 20.5 6 20.5H18C18.8284 20.5 19.5 19.8284 19.5 19V9L14 3.5H6Z"
          fill="#37352F"
          stroke="#E9E9E7"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        {/* Corner fold */}
        <path
          d="M14 3.5V8C14 8.55228 14.4477 9 15 9H19.5"
          stroke="#E9E9E7"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        {/* Minimal document text lines */}
        <path
          d="M8 12.5H13"
          stroke="#9B9A97"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          d="M8 15.5H16"
          stroke="#9B9A97"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        {/* Subtle edit indicator */}
        <circle cx="16" cy="12.5" r="1" fill="#2383E2" />
      </svg>
    </div>
  );
}

export function PdfLogo({
  size = "md",
  showBadge = false,
  clickable = true,
  className = "",
}: PdfLogoProps) {
  const sizeStyles = {
    sm: {
      mark: "w-5 h-5",
      title: "text-xs",
      badge: "text-[9px] px-1 py-0.2",
    },
    md: {
      mark: "w-6 h-6",
      title: "text-sm",
      badge: "text-[10px] px-1.5 py-0.5",
    },
    lg: {
      mark: "w-8 h-8",
      title: "text-lg",
      badge: "text-xs px-2 py-0.5",
    },
  }[size];

  const content = (
    <div
      className={`inline-flex items-center gap-2 group select-none transition-opacity hover:opacity-85 ${className}`}
      title="PDF Editor"
    >
      <PdfLogoMark className={sizeStyles.mark} />

      <div className="flex items-center gap-1.5 leading-none">
        <span
          className={`font-semibold tracking-tight text-[#37352F] ${sizeStyles.title}`}
        >
          PDF
        </span>
        <span
          className={`font-normal tracking-tight text-[#787774] ${sizeStyles.title}`}
        >
          Editor
        </span>

        {showBadge && (
          <span
            className={`ml-1 font-medium rounded text-[#787774] bg-[#37352F]/5 border border-[#37352F]/10 ${sizeStyles.badge}`}
          >
            Studio
          </span>
        )}
      </div>
    </div>
  );

  if (clickable) {
    return (
      <Link to="/" className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}

export default PdfLogo;

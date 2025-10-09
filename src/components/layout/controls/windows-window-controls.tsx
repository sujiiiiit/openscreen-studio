import type { WindowControlsProps } from "@/types";

export function WindowsWindowControls({
  isMaximized,
  onMinimize,
  onMaximize,
  onClose,
}: WindowControlsProps) {
  return (
    <div
      className="grow-0 h-full text-center inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none"
      style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
    >
      <button
        className="w-[46px] h-full flex justify-center items-center hover:bg-hover"
        id="minimize"
        onClick={onMinimize}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M14 8v1H3V8h11z" />
        </svg>
      </button>
      <button
        className="w-[46px] h-full flex justify-center items-center hover:bg-hover"
        id="maximize"
        onClick={onMaximize}
      >
        {isMaximized ? (
          // Restore icon (when window is maximized)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M3 5v9h9V5H3zm8 8H4V6h7v7z" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5 5h1V4h7v7h-1v1h2V3H5v2z"
            />
          </svg>
        ) : (
          // Maximize icon (when window is not maximized)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M3 3v10h10V3H3zm9 9H4V4h8v8z" />
          </svg>
        )}
      </button>
      <button
        className="w-[46px] h-full flex justify-center items-center hover:bg-[var(--titlebar-close-hover)] hover:text-white"
        id="close"
        onClick={onClose}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.116 8l-4.558 4.558.884.884L8 8.884l4.558 4.558.884-.884L8.884 8l4.558-4.558-.884-.884L8 7.116 3.442 2.558l-.884.884L7.116 8z"
          />
        </svg>
      </button>
    </div>
  );
}

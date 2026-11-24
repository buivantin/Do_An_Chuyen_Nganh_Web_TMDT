import React, { useEffect } from "react";

export default function AdminModal({
  open = false,
  onClose,
  title,
  subtitle,
  maxWidth = "max-w-2xl",
  children,
  footer,
}) {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white border border-stone-200 rounded-t-3xl sm:rounded-2xl w-full ${maxWidth} max-h-[92vh] flex flex-col shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-5 sm:px-6 py-4 border-b border-stone-200/80 flex items-start justify-between gap-3 bg-[#FAF8F5] shrink-0">
          <div>
            {subtitle && (
              <span className="block text-[10px] font-bold uppercase tracking-widest text-[#9A5B13] mb-0.5">
                {subtitle}
              </span>
            )}
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A]">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="w-8 h-8 rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-100 flex items-center justify-center text-lg leading-none transition cursor-pointer shrink-0"
          >
            &times;
          </button>
        </div>

        {/* Nội dung Modal */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {children}
        </div>

        {/* Footer Modal */}
        {footer && (
          <div className="px-5 sm:px-6 py-3.5 border-t border-stone-200/80 bg-[#FAF8F5] flex flex-wrap items-center justify-end gap-2.5 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
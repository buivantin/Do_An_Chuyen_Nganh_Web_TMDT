import React, { useEffect } from "react";

const VARIANT_STYLES = {
  warning: {
    iconBg: "bg-amber-50 border-amber-200 text-[#9A5B13]",
    confirmBtn: "bg-[#141414] hover:bg-stone-800 text-white",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <path
          d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  danger: {
    iconBg: "bg-red-50 border-red-200 text-red-600",
    confirmBtn: "bg-red-600 hover:bg-red-700 text-white",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <path
          d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  info: {
    iconBg: "bg-[#F5EDE2] border-[#E5D5BE] text-[#9A5B13]",
    confirmBtn: "bg-[#9A5B13] hover:bg-[#7D480D] text-white",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <circle cx="12" cy="12" r="9" />
        <path
          d="m9 12 2 2 4-4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
};

export default function AdminConfirmModal({
  open = false,
  variant = "warning",
  title = "Xác nhận thao tác",
  message = "Bạn có chắc chắn muốn thực hiện thao tác này?",
  detailText = "",
  detailsList = [],
  confirmText = "Xác nhận",
  cancelText = "Quay lại",
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) {
        onCancel?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  const style = VARIANT_STYLES[variant] || VARIANT_STYLES.warning;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-2xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => !loading && onCancel?.()}
    >
      <div
        className="bg-white border border-stone-200 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${style.iconBg}`}
          >
            {style.icon}
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-[#9A5B13]">
              Thông báo xác nhận
            </span>
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A] mt-0.5">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {detailText && (
          <div className="px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200/80 text-xs font-semibold text-stone-800 break-words">
            {detailText}
          </div>
        )}

        {Array.isArray(detailsList) && detailsList.length > 0 && (
          <div className="px-3.5 py-3 rounded-xl bg-[#FAF8F5] border border-stone-200/80 space-y-1.5 text-xs">
            {detailsList.map((row, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-3 border-b last:border-b-0 border-stone-200/60 pb-1.5 last:pb-0"
              >
                <span className="text-stone-500 shrink-0">{row.label}:</span>
                <span className="font-semibold text-stone-900 text-right">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer disabled:opacity-60 shadow-2xs ${style.confirmBtn}`}
          >
            {loading ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
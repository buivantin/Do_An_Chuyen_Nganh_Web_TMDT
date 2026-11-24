import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const VARIANT_STYLES = {
  danger: {
    iconWrap: "bg-red-50 border-red-200 text-red-600",
    confirmBtn: "bg-red-600 hover:bg-red-700 text-white",
    defaultIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  warning: {
    iconWrap: "bg-amber-50 border-amber-200 text-[#9A5B13]",
    confirmBtn: "bg-[#9A5B13] hover:bg-[#7D480D] text-white",
    defaultIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
  },
  primary: {
    iconWrap: "bg-[#FAF6F0] border-[#E5D5BE] text-[#9A5B13]",
    confirmBtn: "bg-[#141414] hover:bg-stone-800 text-white",
    defaultIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

/**
 * DUMB COMPONENT: Hiển thị giao diện Popup xác nhận hành động
 */
export function ConfirmModalView({
  open = false,
  variant = "primary",
  title = "Xác nhận thao tác",
  message = "Bạn có chắc chắn muốn thực hiện hành động này không?",
  detailText = "",
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  loading = false,
  icon = null,
  children = null,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const theme = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-2xs flex items-center justify-center p-4"
      onClick={() => !loading && onCancel?.()}
    >
      <div
        className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 relative animate-[fadeIn_0.18s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng góc trên */}
        <button
          type="button"
          disabled={loading}
          onClick={onCancel}
          aria-label="Đóng hộp thoại"
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 disabled:opacity-40 flex items-center justify-center transition cursor-pointer"
        >
          &times;
        </button>

        {/* Icon + Nội dung */}
        <div className="flex flex-col items-center text-center space-y-3 pt-1">
          <div
            className={`w-12 h-12 rounded-full border flex items-center justify-center ${theme.iconWrap}`}
          >
            {icon || theme.defaultIcon}
          </div>

          <div className="space-y-1.5">
            <h3
              id="confirm-modal-title"
              className="font-serif text-lg sm:text-xl font-bold text-stone-900"
            >
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {message}
            </p>
          </div>

          {detailText && (
            <div className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-stone-200/80 text-xs font-semibold text-stone-800">
              {detailText}
            </div>
          )}

          {children}
        </div>

        {/* Hàng nút hành động */}
        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#FAF8F5] hover:bg-stone-100 border border-stone-200 disabled:opacity-50 text-xs sm:text-sm font-semibold text-stone-700 transition cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 rounded-xl disabled:opacity-60 text-xs sm:text-sm font-bold tracking-wide transition cursor-pointer shadow-2xs ${theme.confirmBtn}`}
          >
            {loading ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * SMART COMPONENT: Xử lý phím Esc, khóa cuộn nền & hỗ trợ hàm onConfirm bất đồng bộ (Promise)
 */
export default function ConfirmModal({
  open = false,
  loading: externalLoading,
  onConfirm,
  onCancel,
  ...rest
}) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading =
    typeof externalLoading === "boolean" ? externalLoading : internalLoading;

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isLoading) {
        onCancel?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, isLoading, onCancel]);

  const handleConfirmClick = async () => {
    if (isLoading || typeof onConfirm !== "function") return;
    try {
      const result = onConfirm();
      if (result && typeof result.then === "function") {
        setInternalLoading(true);
        await result;
      }
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <ConfirmModalView
      open={open}
      loading={isLoading}
      onConfirm={handleConfirmClick}
      onCancel={onCancel}
      {...rest}
    />
  );
}
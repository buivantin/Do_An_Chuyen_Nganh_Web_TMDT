import React from "react";
import { createPortal } from "react-dom";

export default function LoginRequiredModal({
  open = false,
  onClose,
  onLoginClick,
}) {
  if (!open) return null;

  const handleOpenLogin = () => {
    onClose?.();
    if (typeof onLoginClick === "function") {
      onLoginClick();
    }
    window.dispatchEvent(
      new CustomEvent("open-auth-modal", { detail: { mode: "login" } })
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border border-stone-200 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF6F0] border border-[#E5D5BE] text-[#9A5B13] flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="w-6 h-6"
          >
            <rect x="4" y="11" width="16" height="9" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-serif text-xl font-bold text-stone-900">
            Yêu cầu đăng nhập
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
            Vui lòng đăng nhập tài khoản độc giả để thực hiện thao tác này.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#FAF8F5] hover:bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-700 transition cursor-pointer"
          >
            Để sau
          </button>
          <button
            type="button"
            onClick={handleOpenLogin}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#141414] hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginRequiredModal({
  isOpen,
  open,
  onClose,
  onLogin,
  onRegister,
  title = "Yêu cầu đăng nhập",
  message = "Vui lòng đăng nhập tài khoản độc giả Mọt Sách BookHouse để tiếp tục thao tác này.",
  actionLabel = "Đăng nhập ngay",
}) {
  const { openLoginModal, openRegisterModal } = useAuth();
  const visible = Boolean(isOpen ?? open);

  useEffect(() => {
    if (!visible) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [visible, onClose]);

  if (!visible) return null;

  const handleTriggerLogin = () => {
    onClose?.();
    onLogin?.();
    openLoginModal();
  };

  const handleTriggerRegister = () => {
    onClose?.();
    onRegister?.();
    openRegisterModal();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-2xs flex items-center justify-center p-4"
      onClick={() => onClose?.()}
    >
      <div
        className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FAF8F5] border border-[#E5D5BE] text-[#9A5B13] flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                className="w-5 h-5"
              >
                <rect x="4" y="11" width="16" height="9" rx="2" />
                <path
                  d="M8 11V7a4 4 0 0 1 8 0v4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#9A5B13]">
                Mọt Sách BookHouse
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A] leading-snug">
                {title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onClose?.()}
            aria-label="Đóng"
            className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 flex items-center justify-center transition cursor-pointer"
          >
            &times;
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-stone-200/80 text-xs sm:text-sm text-stone-600 leading-relaxed">
          {message}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => onClose?.()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-700 transition cursor-pointer"
          >
            Để sau
          </button>

          <button
            type="button"
            onClick={handleTriggerRegister}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#9A5B13]/40 bg-[#FAF8F5] hover:bg-[#F5EDE2] text-xs font-bold text-[#9A5B13] transition cursor-pointer"
          >
            Tạo tài khoản mới
          </button>

          <button
            type="button"
            onClick={handleTriggerLogin}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#141414] hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
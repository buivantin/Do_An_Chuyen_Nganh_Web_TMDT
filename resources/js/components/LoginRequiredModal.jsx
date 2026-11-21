import React from "react";

export default function LoginRequiredModal({ open, onClose, onLogin }) {
    if (!open) return null;

    const handleLoginClick = () => {
        onClose?.();
        if (typeof onLogin === "function") {
            onLogin();
        }
        window.dispatchEvent(new CustomEvent("open-login-modal"));
    };

    return (
        <div
            onClick={onClose}
            style={{
                backgroundColor: "rgba(0, 0, 0, 0.45)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
            }}
            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "320px",
                    height: "320px",
                    maxWidth: "calc(100vw - 32px)",
                }}
                className="bg-white border border-stone-200 rounded-2xl shadow-2xl p-5 flex flex-col justify-between text-center"
            >
                {/* Hàng trên: Nút đóng góc phải */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Đóng"
                        className="w-7 h-7 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 flex items-center justify-center text-lg leading-none transition cursor-pointer"
                    >
                        &times;
                    </button>
                </div>

                {/* Phần giữa: Icon + Thông báo */}
                <div className="flex-1 flex flex-col items-center justify-center px-2 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-stone-200 text-[#9A5B13] flex items-center justify-center">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="w-5 h-5"
                        >
                            <rect x="4" y="11" width="16" height="9" rx="2" />
                            <path d="M8 11V7a4 4 0 118 0v4" />
                        </svg>
                    </div>

                    <div className="space-y-1.5">
                        <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
                            Yêu cầu đăng nhập
                        </h3>
                        <p className="text-xs text-stone-500 leading-relaxed">
                            Vui lòng đăng nhập để thêm sách vào giỏ và tiến hành đặt hàng.
                        </p>
                    </div>
                </div>

                {/* Hàng dưới: 2 nút thao tác */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="py-2.5 px-3 rounded-xl bg-[#FAF8F5] hover:bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-700 transition cursor-pointer"
                    >
                        Để sau
                    </button>
                    <button
                        type="button"
                        onClick={handleLoginClick}
                        className="py-2.5 px-3 rounded-xl bg-[#141414] hover:bg-stone-800 text-xs font-semibold text-white transition cursor-pointer"
                    >
                        Đăng nhập
                    </button>
                </div>
            </div>
        </div>
    );
}
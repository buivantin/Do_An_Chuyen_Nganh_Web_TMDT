import React, { useState } from "react";
import { createPortal } from "react-dom";
import LoginRequiredModal from "./LoginRequiredModal";
import ProductService from "../services/ProductService";

export default function ProductCard({ book, onAddToCart }) {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [adding, setAdding] = useState(false);
    const [feedback, setFeedback] = useState("");

    const cleanTitle = (book.title || book.name || "").normalize("NFC");

    const handleAddClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Bước ii (UC-C1): Kiểm tra token trong localStorage
        const token = localStorage.getItem("token");
        if (!token) {
            setShowLoginModal(true);
            return;
        }

        if (adding) return;
        setAdding(true);

        try {
            if (typeof onAddToCart === "function") {
                await onAddToCart(book);
            } else {
                await ProductService.addToCart(book.id, 1);
            }
            setFeedback("Đã thêm vào giỏ!");
            window.dispatchEvent(new CustomEvent("cart-updated"));
            setTimeout(() => setFeedback(""), 2000);
        } catch (err) {
            const msg = err.response?.data?.message || "Số lượng vượt quá tồn kho";
            setFeedback(msg);
            setTimeout(() => setFeedback(""), 2500);
        } finally {
            setAdding(false);
        }
    };

    return (
        <>
            <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-stone-100 shadow-sm hover:shadow-md transition flex flex-col justify-between min-w-0">
                <a href={`/products/${book.id}`} className="block group">
                    <div className="bg-[#EAEAEA] rounded-xl p-3 sm:p-4 flex items-center justify-center aspect-[4/4.4]">
                        <img
                            src={book.image}
                            alt={cleanTitle}
                            className="h-full object-contain shadow-md group-hover:scale-[1.02] transition"
                        />
                    </div>

                    <div className="pt-2.5 sm:pt-3">
                        <div className="text-[10px] sm:text-[11px] font-bold text-[#9A5B13] uppercase truncate">
                            {book.category?.normalize("NFC")}
                        </div>

                        <h3
                            title={cleanTitle}
                            className="font-serif text-sm sm:text-lg font-bold text-gray-900 mt-1 line-clamp-2 min-h-[2.5rem] sm:min-h-[3.5rem] group-hover:text-[#9A5B13] transition-colors"
                        >
                            {cleanTitle}
                        </h3>

                        <p className="text-[11px] sm:text-xs text-gray-500 truncate mt-1">
                            {book.author?.normalize("NFC")}
                        </p>
                    </div>
                </a>

                <div className="pt-2.5 sm:pt-3">
                    <div className="text-sm sm:text-lg font-bold text-gray-900">
                        {Number(book.price || 0).toLocaleString("vi-VN")} ₫
                    </div>

                    <button
                        type="button"
                        disabled={adding}
                        onClick={handleAddClick}
                        className="mt-2.5 sm:mt-3 w-full bg-[#F5F3EF] hover:bg-[#141414] text-gray-800 hover:text-white disabled:opacity-60 font-semibold text-xs sm:text-sm py-2 sm:py-2.5 px-2 rounded-lg flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap transition cursor-pointer"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
                        >
                            <path d="M6 6h15l-1.5 9h-12zM6 6L5 3H2m7 18a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z" />
                        </svg>
                        <span>{adding ? "Đang thêm..." : feedback || "Thêm vào giỏ"}</span>
                    </button>
                </div>
            </div>

            {showLoginModal &&
                createPortal(
                    <LoginRequiredModal
                        open={showLoginModal}
                        onClose={() => setShowLoginModal(false)}
                    />,
                    document.body
                )}
        </>
    );
}
import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import LoginRequiredModal from "./LoginRequiredModal";
import ProductService from "../services/ProductService";
import { enrichBookWithSampleMeta } from "../data/homeMockData";

export function resolveBookImageUrl(path) {
  if (!path) return "https://placehold.co/320x460/F5EFE6/9A5B13?text=BookHouse";
  const raw = String(path).trim();
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:") || raw.startsWith("blob:")) {
    return raw;
  }
  const clean = raw.replace(/^\/+/, "");
  if (clean.startsWith("public/")) return `/storage/${clean.slice(7)}`;
  if (
    clean.startsWith("imgs/") ||
    clean.startsWith("storage/") ||
    clean.startsWith("images/") ||
    clean.startsWith("uploads/")
  ) {
    return `/${clean}`;
  }
  return `/imgs/${clean}`;
}

function formatSoldCount(count) {
  const num = Number(count || 0);
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return num.toLocaleString("vi-VN");
}

/**
 * DUMB COMPONENT: Hiển thị thẻ sách dọc (Responsive riêng cho Mobile & PC)
 */
export function ProductCardView({
  book,
  adding = false,
  feedback = "",
  onAddClick,
}) {
  const cleanTitle = (book.title || book.name || "").normalize("NFC");
  const authorName = (book.author || "Đang cập nhật").normalize("NFC");
  const categoryName =
    typeof book.category === "object" && book.category !== null
      ? book.category.name
      : book.category || "";

  const hasDiscount =
    Number(book.discount_percent) > 0 &&
    Number(book.original_price) > Number(book.price);

  const soldCount = Number(book.sold_count || 0);

  return (
    <article className="group bg-white rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between overflow-hidden min-w-0 h-full">
      <a href={`/products/${book.id}`} className="block">
        {/* Khung bìa sách hình chữ nhật dọc */}
        <div className="relative bg-gradient-to-b from-[#F5EFE6] to-[#EBE3D6] p-3 sm:p-4 flex items-center justify-center aspect-[3/4] overflow-hidden">
          {/* Nhóm Tag góc trên trái */}
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 flex flex-col items-start gap-1">
            {hasDiscount && (
              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-md bg-red-600 text-white text-[9px] sm:text-[11px] font-extrabold tracking-wide shadow-xs">
                -{book.discount_percent}%
              </span>
            )}
            {book.is_bestseller && (
              <span className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-600 text-white text-[9px] sm:text-[10px] font-bold tracking-wide shadow-xs">
                🔥 Bán chạy
              </span>
            )}
            {book.is_new && (
              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-700 text-white text-[9px] sm:text-[10px] font-bold tracking-wide shadow-xs">
                Mới
              </span>
            )}
          </div>

          {/* Điểm đánh giá sao góc trên phải */}
          {Number(book.rating) > 0 && (
            <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 px-1.5 sm:px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-2xs border border-stone-200/80 text-[10px] font-bold text-stone-800 flex items-center gap-0.5 shadow-2xs">
              <span className="text-amber-500">★</span>
              <span>{Number(book.rating).toFixed(1)}</span>
            </div>
          )}

          {/* Huy hiệu lượt bán nổi góc dưới phải trên ảnh bìa (Mobile & PC) */}
          <div className="absolute bottom-2 right-2 z-10 px-2 py-0.5 rounded-md bg-stone-900/75 backdrop-blur-2xs text-white text-[9px] sm:text-[10px] font-semibold">
            Đã bán {formatSoldCount(soldCount)}
          </div>

          <img
            src={resolveBookImageUrl(book.image)}
            alt={cleanTitle}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "https://placehold.co/320x460/F5EFE6/9A5B13?text=BookHouse";
            }}
            className="h-full w-auto object-contain rounded-sm shadow-md group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Nội dung thông tin sách */}
        <div className="p-2.5 sm:p-3.5 pb-1.5 space-y-1 sm:space-y-1.5">
          {categoryName && (
            <div className="text-[9px] sm:text-[10px] font-bold text-[#9A5B13] uppercase tracking-wider truncate">
              {categoryName.normalize("NFC")}
            </div>
          )}

          <h3
            title={cleanTitle}
            className="font-serif text-xs sm:text-base font-bold text-stone-900 line-clamp-2 min-h-[2.25rem] sm:min-h-[2.75rem] group-hover:text-[#9A5B13] transition-colors leading-snug"
          >
            {cleanTitle}
          </h3>

          <p className="text-[11px] sm:text-xs text-stone-500 truncate">
            {authorName}
          </p>

          {/* Lượt bán + Thông tin xuất bản (Tối ưu gọn trên Mobile, đầy đủ trên PC) */}
          <div className="pt-1.5 mt-1 border-t border-stone-100 space-y-1 text-[10px] sm:text-[11px] text-stone-500">
            <div className="flex items-center justify-between gap-1.5">
              <span className="inline-flex items-center gap-1 text-stone-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Đã bán <strong className="text-stone-800">{formatSoldCount(soldCount)}</strong>
              </span>
              <span>
                <strong className="text-stone-700">{book.pages}</strong> trang
              </span>
            </div>

            {/* PC hiển thị thêm NXB & Năm XB rõ ràng */}
            <div className="hidden sm:flex items-center justify-between gap-2 text-[11px] text-stone-500">
              <span className="truncate" title={book.publisher}>
                {book.publisher}
              </span>
              <span className="shrink-0 font-semibold text-stone-700">
                {book.publish_year}
              </span>
            </div>
          </div>
        </div>
      </a>

      {/* Giá bán & Nút thêm giỏ hàng */}
      <div className="p-2.5 sm:p-3.5 pt-1.5 sm:pt-2">
        <div className="flex flex-wrap items-baseline gap-x-1.5 sm:gap-x-2 gap-y-0.5 min-h-[2rem] sm:min-h-[2.25rem]">
          <span className="text-sm sm:text-lg font-extrabold text-[#B91C1C]">
            {Number(book.price || 0).toLocaleString("vi-VN")} ₫
          </span>
          {hasDiscount && (
            <span className="text-[10px] sm:text-xs text-stone-400 line-through">
              {Number(book.original_price).toLocaleString("vi-VN")} ₫
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={adding}
          onClick={onAddClick}
          className="mt-2 w-full bg-[#FAF6F0] hover:bg-[#141414] border border-[#E5D5BE] hover:border-[#141414] text-[#9A5B13] hover:text-white disabled:opacity-60 font-bold text-[11px] sm:text-xs py-2 sm:py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 whitespace-nowrap transition cursor-pointer"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-3.5 h-3.5 shrink-0"
          >
            <path d="M6 6h15l-1.5 9h-12zM6 6L5 3H2m7 18a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
          <span>{adding ? "Đang thêm..." : feedback || "Thêm vào giỏ"}</span>
        </button>
      </div>
    </article>
  );
}

/**
 * SMART COMPONENT: Xử lý xác thực, gọi API thêm vào giỏ & làm giàu dữ liệu mẫu
 */
export default function ProductCard({ book, onAddToCart }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState("");

  const enrichedBook = useMemo(() => enrichBookWithSampleMeta(book), [book]);

  const handleAddClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    if (adding) return;
    setAdding(true);

    try {
      if (typeof onAddToCart === "function") {
        await onAddToCart(enrichedBook);
      } else {
        await ProductService.addToCart(enrichedBook.id, 1);
      }
      setFeedback("Đã thêm!");
      window.dispatchEvent(new CustomEvent("cart-updated"));
      setTimeout(() => setFeedback(""), 2200);
    } catch (err) {
      const msg = err.response?.data?.message || "Vượt quá tồn kho";
      setFeedback(msg);
      setTimeout(() => setFeedback(""), 2200);
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <ProductCardView
        book={enrichedBook}
        adding={adding}
        feedback={feedback}
        onAddClick={handleAddClick}
      />

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
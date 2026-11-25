import React, { useState, memo } from "react";

export function resolveBookImageUrl(rawPath) {
  if (!rawPath) {
    return "https://placehold.co/320x440/F5EFE6/9A5B13?text=BookHouse";
  }
  const clean = String(rawPath).trim();
  if (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("data:") ||
    clean.startsWith("blob:")
  ) {
    return clean;
  }
  if (clean.startsWith("/")) {
    return clean;
  }
  if (clean.startsWith("imgs/") || clean.startsWith("storage/")) {
    return `/${clean}`;
  }
  return `/imgs/${clean}`;
}

function ProductCard({ book, onAddToCart }) {
  const [adding, setAdding] = useState(false);

  if (!book) return null;

  const title = book.name || book.title || "Ấn phẩm đang cập nhật";
  const author =
    book.author && String(book.author).trim() !== ""
      ? book.author
      : "Đang cập nhật";
  const categoryName =
    typeof book.category === "object" ? book.category?.name : book.category;

  const basePrice = Number(book.price || 0);
  const discountPercent = Math.min(Math.max(Number(book.discount || 0), 0), 100);
  const finalPrice =
    discountPercent > 0
      ? Math.round(basePrice * (1 - discountPercent / 100))
      : basePrice;

  const stock = Number(book.stock ?? 0);
  const isOutOfStock = stock <= 0;

  const soldCount = Number(book.sold_count ?? 0);
  const rating = Number(book.rating ?? book.avg_rating ?? 0);
  const reviewsCount = Number(book.reviews_count ?? 0);

  const imageUrl = resolveBookImageUrl(book.image_path || book.image);

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || adding) return;

    setAdding(true);
    try {
      if (onAddToCart) {
        await onAddToCart(book);
      } else {
        window.dispatchEvent(
          new CustomEvent("bookhouse:add-to-cart", {
            detail: { product: book, quantity: 1 },
          })
        );
      }
    } finally {
      setTimeout(() => setAdding(false), 350);
    }
  };

  return (
    <article className="group bg-white rounded-2xl border border-stone-200/80 hover:border-[#D9B88F] hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
      <a
        href={`/products/${book.id}`}
        className="relative block bg-[#F7F3EC] aspect-[3/4] p-3 sm:p-4 overflow-hidden"
      >
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              "https://placehold.co/320x440/F5EFE6/9A5B13?text=BookHouse";
          }}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badge góc trái: Giảm giá thật hoặc Hết hàng */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-lg bg-red-600 text-white text-[10px] sm:text-[11px] font-bold shadow-2xs">
              -{discountPercent}%
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-0.5 rounded-lg bg-stone-800/90 text-white text-[10px] sm:text-[11px] font-semibold">
              Hết hàng
            </span>
          )}
        </div>

        {/* Badge góc phải: Số sao đánh giá thật từ DB */}
        <div className="absolute top-2.5 right-2.5">
          {rating > 0 ? (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-white/95 border border-stone-200/80 text-stone-800 text-[10px] sm:text-[11px] font-bold shadow-2xs">
              <span className="text-amber-500">★</span>
              <span>{rating.toFixed(1)}</span>
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-white/90 border border-stone-200/80 text-stone-400 text-[10px] font-medium">
              Chưa đánh giá
            </span>
          )}
        </div>
      </a>

      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div className="space-y-1">
          {categoryName && (
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#9A5B13] truncate">
              {categoryName}
            </span>
          )}

          <a href={`/products/${book.id}`}>
            <h3
              title={title}
              className="font-serif text-sm sm:text-[15px] font-bold text-[#1A1A1A] line-clamp-2 group-hover:text-[#9A5B13] transition-colors leading-snug"
            >
              {title}
            </h3>
          </a>

          <p className="text-[11px] sm:text-xs text-stone-500 truncate">
            {author}
          </p>

          {(book.publisher || book.published_year) && (
            <p className="text-[10px] sm:text-[11px] text-stone-400 truncate">
              {[book.publisher, book.published_year].filter(Boolean).join(" • ")}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-stone-100 space-y-2.5">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-extrabold text-[#9A5B13] leading-none">
                {finalPrice.toLocaleString("vi-VN")}đ
              </div>
              {discountPercent > 0 && (
                <div className="text-[11px] text-stone-400 line-through mt-0.5">
                  {basePrice.toLocaleString("vi-VN")}đ
                </div>
              )}
            </div>

            <div className="text-[10px] sm:text-[11px] text-stone-500 text-right shrink-0">
              {soldCount > 0 ? (
                <span>Đã bán {soldCount.toLocaleString("vi-VN")}</span>
              ) : (
                <span>Còn {stock.toLocaleString("vi-VN")} cuốn</span>
              )}
              {reviewsCount > 0 && (
                <span className="block text-[10px] text-stone-400">
                  ({reviewsCount} đánh giá)
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={isOutOfStock || adding}
            onClick={handleAdd}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              isOutOfStock
                ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                : adding
                ? "bg-emerald-600 text-white"
                : "bg-[#141414] hover:bg-[#9A5B13] text-white"
            }`}
          >
            {isOutOfStock
              ? "Tạm hết hàng"
              : adding
              ? "Đã thêm vào giỏ ✓"
              : "Thêm vào giỏ"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
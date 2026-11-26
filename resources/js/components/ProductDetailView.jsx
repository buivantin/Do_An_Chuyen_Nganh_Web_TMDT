import React from "react";
import { createPortal } from "react-dom";
import ProductCard from "./ProductCard";
import ProductReviews from "./ProductReviews";

function StarRatingDisplay({ rating = 0 }) {
  const numericRating = Number(rating || 0);
  const fullStars = Math.round(numericRating);
  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center text-amber-500 text-xs sm:text-sm leading-none">
        {Array.from({ length: 5 }).map((_, idx) => (
          <span
            key={idx}
            className={idx < fullStars ? "text-amber-500" : "text-stone-300"}
          >
            ★
          </span>
        ))}
      </div>
      <span className="text-xs sm:text-sm font-bold text-stone-900">
        {numericRating > 0 ? numericRating.toFixed(1) : "0.0"}
      </span>
    </div>
  );
}

export default function ProductDetailView({
  book,
  relatedBooks = [],
  quantity = 1,
  loading = false,
  error = "",
  cartNotice = { type: "", text: "" },
  submitting = false,
  descExpanded = false,
  zoomOpen = false,
  imageUrl = "",
  formattedPrice = "",
  formattedOriginalPrice = "",
  discountPercent = 0,
  specRows = [],
  onDecreaseQty,
  onIncreaseQty,
  onAddToCart,
  onBuyNow,
  onToggleDesc,
  onToggleZoom,
  onScrollToReviews,
  onAddRelatedToCart,
  onReviewStatsLoaded,
}) {
  if (loading) {
    return (
      <div className="bg-[#FCFBF9] min-h-screen">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 animate-pulse">
          <div className="lg:col-span-5 bg-stone-200/80 rounded-2xl aspect-[4/4.2] max-h-[340px] lg:max-h-none mx-auto w-full" />
          <div className="lg:col-span-7 space-y-4">
            <div className="h-5 w-28 bg-stone-200 rounded-md" />
            <div className="h-9 w-4/5 bg-stone-200 rounded-lg" />
            <div className="h-4 w-1/2 bg-stone-200 rounded" />
            <div className="h-24 w-full bg-stone-200/80 rounded-2xl" />
            <div className="h-40 w-full bg-stone-200/70 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="bg-[#FCFBF9] min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-8 sm:p-10">
            <p className="font-serif text-lg sm:text-xl font-bold text-stone-800">
              {error || "Không tìm thấy thông tin sách."}
            </p>
            <a
              href="/products"
              className="inline-block mt-4 bg-[#141414] text-white text-xs font-semibold px-5 py-2.5 rounded-xl"
            >
              Quay lại danh sách sách
            </a>
          </div>
        </div>
      </div>
    );
  }

  const displayTitle = book.name || book.title || "Ấn phẩm đang cập nhật";
  const categoryName =
    typeof book.category === "object" ? book.category?.name : book.category;
  const inStock = Number(book.stock || 0) > 0;

  return (
    <div className="bg-[#FCFBF9] min-h-screen pb-24 lg:pb-12">
      {/* BREADCRUMB */}
      <div className="bg-[#FAF8F5] border-b border-stone-200/70">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-xs text-stone-500 flex items-center gap-1.5 sm:gap-2 overflow-hidden">
          <a href="/" className="hover:text-[#9A5B13] shrink-0">
            Trang chủ
          </a>
          <span className="shrink-0">&rsaquo;</span>
          <a
            href="/products"
            className="hover:text-[#9A5B13] shrink-0 hidden sm:inline"
          >
            Danh sách sản phẩm
          </a>
          <span className="shrink-0 hidden sm:inline">&rsaquo;</span>
          {categoryName && (
            <>
              <a
                href={`/products?category_id=${book.category_id || ""}`}
                className="hover:text-[#9A5B13] shrink-0 max-w-[110px] sm:max-w-none truncate"
              >
                {categoryName}
              </a>
              <span className="shrink-0">&rsaquo;</span>
            </>
          )}
          <span className="text-stone-800 font-medium truncate">
            {displayTitle}
          </span>
        </div>
      </div>

      {/* NỘI DUNG CHÍNH */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-4 sm:pt-8 space-y-8 sm:space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
          {/* CỘT TRÁI: Khung ảnh bìa */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div
              onClick={() => onToggleZoom?.(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onToggleZoom?.(true)}
              aria-label="Phóng to ảnh bìa sách"
              className="group relative bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-4 sm:p-8 flex items-center justify-center h-[290px] sm:h-[390px] lg:h-[460px] cursor-zoom-in overflow-hidden"
            >
              {discountPercent > 0 && (
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex flex-wrap items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] sm:text-[11px] font-bold">
                    -{discountPercent}%
                  </span>
                </div>
              )}

              <img
                src={imageUrl}
                alt={displayTitle}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://placehold.co/320x440/F5EFE6/9A5B13?text=BookHouse";
                }}
                className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg shadow-md transition-transform duration-300 group-hover:scale-[1.03]"
              />

              <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-white/90 border border-stone-200/80 text-[10px] sm:text-[11px] font-semibold text-stone-600 shadow-2xs flex items-center gap-1">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-3.5 h-3.5 text-[#9A5B13]"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path
                    d="M21 21l-4.35-4.35M11 8v6M8 11h6"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Phóng to</span>
              </span>
            </div>
          </div>

          {/* CỘT PHẢI: Thông tin sách, NXB, Giá & Đặt mua */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              {categoryName && (
                <a
                  href={`/products?category_id=${book.category_id || ""}`}
                  className="inline-block bg-[#EFECE6] hover:bg-[#E5DFD3] text-[#9A5B13] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-md transition"
                >
                  {categoryName}
                </a>
              )}
              {book.publish_year && (
                <span className="inline-block bg-stone-100 text-stone-600 text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-md">
                  XB năm {book.publish_year}
                </span>
              )}
              {book.cover_type && (
                <span className="inline-block bg-stone-100 text-stone-600 text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-md">
                  {book.cover_type}
                </span>
              )}
            </div>

            <div>
              <h1 className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-[#1A1A1A] leading-snug">
                {displayTitle}
              </h1>

              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-stone-600">
                <div>
                  Tác giả:{" "}
                  {book.author ? (
                    <a
                      href={`/products?author=${encodeURIComponent(book.author)}`}
                      className="font-bold text-stone-900 hover:text-[#9A5B13] underline decoration-stone-300 underline-offset-2 transition"
                    >
                      {book.author}
                    </a>
                  ) : (
                    <span className="font-bold text-stone-900">
                      Đang cập nhật
                    </span>
                  )}
                </div>

                <span className="text-stone-300 hidden sm:inline">|</span>

                <div>
                  Nhà xuất bản:{" "}
                  {book.publisher ? (
                    <a
                      href={`/products?publisher=${encodeURIComponent(
                        book.publisher
                      )}`}
                      className="font-bold text-[#9A5B13] hover:underline"
                    >
                      {book.publisher}
                    </a>
                  ) : (
                    <span className="font-bold text-stone-700">
                      Đang cập nhật
                    </span>
                  )}
                </div>
              </div>

              {/* Đánh giá sao & Lượt đã bán thật từ DB */}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                <button
                  type="button"
                  onClick={onScrollToReviews}
                  className="inline-flex items-center gap-1.5 hover:text-[#9A5B13] transition cursor-pointer"
                >
                  {Number(book.rating || 0) > 0 ? (
                    <>
                      <StarRatingDisplay rating={book.rating} />
                      <span className="underline decoration-stone-300">
                        ({Number(book.reviews_count || 0)} đánh giá)
                      </span>
                    </>
                  ) : (
                    <span className="text-stone-500">Chưa có đánh giá</span>
                  )}
                </button>

                <span className="text-stone-300">|</span>

                <span>
                  Đã bán:{" "}
                  <strong className="text-stone-800">
                    {Number(book.sold_count || 0).toLocaleString("vi-VN")}
                  </strong>{" "}
                  cuốn
                </span>
              </div>
            </div>

            {/* Box Giá bán & Tình trạng kho */}
            <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
              <div>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                  {discountPercent > 0 ? "Giá bán ưu đãi" : "Giá bán"}
                </div>
                <div className="flex items-baseline gap-2.5 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-bold text-[#9A5B13]">
                    {formattedPrice}
                  </span>
                  {formattedOriginalPrice && (
                    <span className="text-xs sm:text-sm text-stone-400 line-through">
                      {formattedOriginalPrice}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                  Tình trạng kho
                </div>
                {inStock ? (
                  <div className="text-xs font-bold text-emerald-700 mt-1 flex items-center sm:justify-end gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>Còn {book.stock} cuốn trong kho</span>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-red-600 mt-1 flex items-center sm:justify-end gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    <span>Tạm hết hàng</span>
                  </div>
                )}
              </div>
            </div>

            {/* BẢNG THÔNG TIN XUẤT BẢN CHI TIẾT */}
            <div className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-[#9A5B13]" />
                <span>Thông tin xuất bản</span>
              </h2>

              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-xs">
                {specRows.map((row) => (
                  <div
                    key={row.label}
                    className="bg-[#FAF8F5] rounded-xl px-3 py-2 border border-stone-100"
                  >
                    <dt className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                      {row.label}
                    </dt>
                    <dd
                      className="font-bold text-stone-800 mt-0.5 truncate"
                      title={String(row.value)}
                    >
                      {row.href ? (
                        <a
                          href={row.href}
                          className="text-[#9A5B13] hover:underline"
                        >
                          {row.value}
                        </a>
                      ) : (
                        row.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* BỘ CHỌN SỐ LƯỢNG & NÚT MUA HÀNG TRÊN PC / TABLET */}
            <div className="hidden lg:flex flex-wrap items-center gap-3 pt-1">
              <div className="inline-flex items-center bg-white border border-stone-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  disabled={!inStock || quantity <= 1}
                  onClick={onDecreaseQty}
                  aria-label="Giảm số lượng"
                  className="w-11 h-12 text-stone-700 hover:bg-stone-100 disabled:opacity-40 font-bold cursor-pointer"
                >
                  &minus;
                </button>
                <span className="w-12 text-center text-sm font-bold text-stone-900">
                  {inStock ? quantity : 0}
                </span>
                <button
                  type="button"
                  disabled={!inStock || quantity >= book.stock}
                  onClick={onIncreaseQty}
                  aria-label="Tăng số lượng"
                  className="w-11 h-12 text-stone-700 hover:bg-stone-100 disabled:opacity-40 font-bold cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                disabled={!inStock || submitting}
                onClick={onAddToCart}
                className="flex-1 min-w-[190px] h-12 bg-white hover:bg-[#FAF8F5] border-2 border-[#141414] disabled:border-stone-300 text-[#141414] disabled:text-stone-400 text-sm font-bold px-5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <path d="M6 6h15l-1.5 9h-12zM6 6L5 3H2m7 18a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
                <span>{submitting ? "Đang thêm..." : "Thêm vào giỏ hàng"}</span>
              </button>

              <button
                type="button"
                disabled={!inStock || submitting}
                onClick={onBuyNow}
                className="flex-1 min-w-[170px] h-12 bg-[#141414] hover:bg-stone-800 disabled:bg-stone-300 text-white text-sm font-bold px-5 rounded-xl flex items-center justify-center transition cursor-pointer disabled:cursor-not-allowed"
              >
                Mua ngay
              </button>
            </div>

            {cartNotice.text && (
              <div
                className={`p-3 rounded-xl text-xs font-medium border ${
                  cartNotice.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : cartNotice.type === "warning"
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {cartNotice.text}
              </div>
            )}

            <div className="pt-3 sm:pt-4 border-t border-stone-200/80 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-[11px] sm:text-xs text-stone-600">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Sách bản quyền chính hãng 100%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Đổi trả miễn phí trong 15 ngày</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Kiểm tra sách trước khi thanh toán</span>
              </div>
            </div>
          </div>
        </div>

        {/* MÔ TẢ NỘI DUNG SÁCH */}
        <section className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-4 sm:p-8">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A] pb-3 border-b border-stone-200/80">
            Giới thiệu tác phẩm
          </h2>
          <p
            className={`mt-3.5 sm:mt-4 text-xs sm:text-sm leading-relaxed text-stone-700 whitespace-pre-line ${
              descExpanded ? "" : "line-clamp-5 sm:line-clamp-none"
            }`}
          >
            {book.description ||
              "Đang cập nhật nội dung giới thiệu chi tiết cho tác phẩm này."}
          </p>
          {book.description && book.description.length > 220 && (
            <button
              type="button"
              onClick={onToggleDesc}
              className="sm:hidden mt-3 text-xs font-bold text-[#9A5B13] hover:underline cursor-pointer"
            >
              {descExpanded ? "Thu gọn nội dung ↑" : "Đọc tiếp nội dung ↓"}
            </button>
          )}
        </section>

        {/* ĐÁNH GIÁ & NHẬN XÉT */}
        <div id="product-reviews">
          <ProductReviews
            productId={book.id}
            onStatsLoaded={onReviewStatsLoaded}
          />
        </div>

        {/* SÁCH CÙNG DANH MỤC */}
        {relatedBooks.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-end justify-between border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#9A5B13]">
                  Gợi ý dành cho bạn
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A] mt-0.5">
                  Sách cùng danh mục
                </h2>
              </div>
              <a
                href={`/products?category_id=${book.category_id || ""}`}
                className="text-xs font-semibold text-[#9A5B13] hover:underline shrink-0"
              >
                Xem tất cả &rarr;
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {relatedBooks.map((item) => (
                <ProductCard
                  key={item.id}
                  book={item}
                  onAddToCart={onAddRelatedToCart}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* THANH ĐẶT MUA CỐ ĐỊNH Ở ĐÁY MÀN HÌNH RIÊNG CHO ĐIỆN THOẠI */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center bg-[#FAF8F5] border border-stone-200 rounded-xl overflow-hidden shrink-0">
            <button
              type="button"
              disabled={!inStock || quantity <= 1}
              onClick={onDecreaseQty}
              aria-label="Giảm số lượng"
              className="w-8 h-10 text-stone-700 disabled:opacity-40 font-bold text-sm"
            >
              &minus;
            </button>
            <span className="w-7 text-center text-xs font-bold text-stone-900">
              {inStock ? quantity : 0}
            </span>
            <button
              type="button"
              disabled={!inStock || quantity >= book.stock}
              onClick={onIncreaseQty}
              aria-label="Tăng số lượng"
              className="w-8 h-10 text-stone-700 disabled:opacity-40 font-bold text-sm"
            >
              +
            </button>
          </div>

          <button
            type="button"
            disabled={!inStock || submitting}
            onClick={onAddToCart}
            className="flex-1 h-10 bg-white border border-[#141414] disabled:border-stone-300 text-[#141414] disabled:text-stone-400 text-xs font-bold px-2.5 rounded-xl flex items-center justify-center gap-1.5"
          >
            <span>{submitting ? "Đang thêm..." : "Thêm giỏ"}</span>
          </button>

          <button
            type="button"
            disabled={!inStock || submitting}
            onClick={onBuyNow}
            className="flex-[1.2] h-10 bg-[#141414] disabled:bg-stone-300 text-white text-xs font-bold px-3 rounded-xl flex items-center justify-center"
          >
            {inStock ? `Mua ngay • ${formattedPrice}` : "Hết hàng"}
          </button>
        </div>
      </div>

      {/* MODAL PHÓNG TO ẢNH BÌA SÁCH */}
      {zoomOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => onToggleZoom?.(false)}
          >
            <div
              className="relative max-w-2xl w-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => onToggleZoom?.(false)}
                aria-label="Đóng xem ảnh lớn"
                className="self-end mb-3 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white text-xl flex items-center justify-center cursor-pointer"
              >
                &times;
              </button>
              <img
                src={imageUrl}
                alt={displayTitle}
                className="max-h-[78vh] w-auto object-contain rounded-xl shadow-2xl bg-white p-2"
              />
              <p className="text-white/90 text-xs sm:text-sm font-serif font-semibold mt-3 text-center">
                {[displayTitle, book.publisher].filter(Boolean).join(" — ")}
              </p>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
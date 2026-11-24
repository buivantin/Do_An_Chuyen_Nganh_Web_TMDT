import React from "react";
import CheckoutStepper from "./CheckoutStepper";

function CartBookThumbnail({ item, alt }) {
  const initialSrc = item.resolvedImage;
  const fallbackSrc = item.fallbackImage;

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {initialSrc ? (
        <img
          src={initialSrc}
          alt={alt}
          onError={(e) => {
            const img = e.currentTarget;
            if (!img.dataset.retried && fallbackSrc && fallbackSrc !== img.src) {
              img.dataset.retried = "1";
              img.src = fallbackSrc;
              return;
            }
            img.style.display = "none";
            if (img.nextElementSibling) {
              img.nextElementSibling.style.display = "flex";
            }
          }}
          className="max-h-full max-w-full object-contain rounded shadow-2xs"
        />
      ) : null}

      <div
        style={{ display: initialSrc ? "none" : "flex" }}
        className="w-full h-full flex-col items-center justify-center text-stone-400 text-[10px] font-bold uppercase tracking-wider select-none"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="w-6 h-6 mb-1 text-[#9A5B13]/70"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <span>Sách</span>
      </div>
    </div>
  );
}

/**
 * DUMB COMPONENT: Hiển thị toàn bộ giao diện Giỏ hàng (Responsive tối ưu Mobile & PC)
 */
export default function CartView({
  items = [],
  totalBooks = 0,
  subtotal = 0,
  loading = false,
  updatingId = null,
  errorMsg = "",
  noticeMsg = "",
  onUpdateQuantity,
  onRequestRemove,
}) {
  return (
    <div className="bg-[#FCFBF9] min-h-screen pb-24 lg:pb-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8 space-y-5 sm:space-y-8">
        {/* Breadcrumb */}
        <nav className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <a href="/" className="hover:text-[#9A5B13] transition">
            Trang chủ
          </a>
          <span>&rsaquo;</span>
          <a href="/products" className="hover:text-[#9A5B13] transition">
            Sản phẩm
          </a>
          <span>&rsaquo;</span>
          <span className="text-[#9A5B13]">Giỏ ấn phẩm</span>
        </nav>

        {/* Tiêu đề & Thanh tiến trình */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-stone-200/80 pb-4 sm:pb-5">
          <div>
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#9A5B13]">
              Quy trình hoàn tất bản đặt
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1A1A1A] mt-1 tracking-tight">
              Giỏ Ấn Phẩm Của Bạn
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Hiện có <strong className="text-stone-800">{items.length}</strong>{" "}
              đầu sách (<strong className="text-stone-800">{totalBooks}</strong>{" "}
              cuốn) trong giỏ
            </p>
          </div>

          <CheckoutStepper
            currentStep={1}
            canProceedCheckout={items.length > 0}
          />
        </div>

        {/* Thông báo lỗi / thành công */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {noticeMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 font-medium">
            {noticeMsg}
          </div>
        )}

        {/* Trạng thái Loading / Giỏ trống / Danh sách sản phẩm */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
            <div className="lg:col-span-7 space-y-3.5">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-stone-200/80 rounded-2xl p-4 flex gap-4"
                >
                  <div className="w-20 sm:w-24 aspect-[3/4] bg-stone-200 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2.5 py-1">
                    <div className="h-4 w-24 bg-stone-200 rounded" />
                    <div className="h-5 w-3/4 bg-stone-200 rounded" />
                    <div className="h-3.5 w-1/2 bg-stone-200 rounded" />
                    <div className="h-8 w-32 bg-stone-200 rounded-lg mt-2" />
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-5 bg-white border border-stone-200/80 rounded-2xl p-6 h-64" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-stone-200/80 rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 shadow-2xs">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF8F5] border border-stone-200 flex items-center justify-center text-[#9A5B13]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="w-6 h-6"
              >
                <path d="M6 7h12l1 13H5L6 7Z" strokeLinejoin="round" />
                <path d="M9 7V5a3 3 0 0 1 6 0v2" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Giỏ hàng của bạn đang trống
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Hãy khám phá thêm các đầu sách hay và thêm vào giỏ nhé.
            </p>
            <div className="pt-2">
              <a
                href="/products"
                className="inline-block bg-[#141414] hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition"
              >
                Tiếp tục mua sắm
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
            {/* CỘT TRÁI: Danh sách thẻ sản phẩm đầy đủ thông tin */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-3.5">
              {items.map((item) => {
                const isBusy = updatingId === item.id;
                const detailHref = item.productId
                  ? `/products/${item.productId}`
                  : undefined;
                const unitPrice = Number(item.price || 0);
                const originalPrice = Number(item.originalPrice || 0);
                const hasDiscount = originalPrice > unitPrice;
                const lineSubtotal = unitPrice * Number(item.quantity || 1);

                return (
                  <article
                    key={item.id}
                    className="bg-white border border-stone-200/80 rounded-2xl p-3 sm:p-4 shadow-2xs transition hover:border-stone-300/90"
                  >
                    {/* TẦNG 1: Ảnh bìa + Toàn bộ thông tin xuất bản */}
                    <div className="flex gap-3 sm:gap-4 items-start">
                      <a
                        href={detailHref}
                        className="w-20 sm:w-28 aspect-[3/4] bg-[#F5F2EE] border border-stone-200/60 rounded-xl p-2 flex items-center justify-center shrink-0 overflow-hidden group"
                      >
                        <CartBookThumbnail item={item} alt={item.title} />
                      </a>

                      <div className="flex-1 min-w-0">
                        {/* Hàng nhãn trên cùng: Thể loại + Sao đánh giá + Tình trạng kho */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {item.categoryName && (
                              <a
                                href={
                                  item.categoryId
                                    ? `/products?category_id=${item.categoryId}`
                                    : "/products"
                                }
                                className="inline-block bg-[#EFECE6] hover:bg-[#E5DFD3] text-[#9A5B13] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded transition"
                              >
                                {item.categoryName}
                              </a>
                            )}

                            {item.rating > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-stone-700 bg-amber-50 border border-amber-200/70 px-1.5 py-0.5 rounded">
                                <span className="text-amber-500">★</span>
                                <span>{Number(item.rating).toFixed(1)}</span>
                              </span>
                            )}
                          </div>

                          {/* Nút xóa nhanh góc trên bên phải trên PC */}
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => onRequestRemove?.(item)}
                            title="Xóa sản phẩm khỏi giỏ"
                            aria-label={`Xóa ${item.title} khỏi giỏ`}
                            className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-stone-400 hover:text-red-600 disabled:opacity-40 transition cursor-pointer"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
                            <span>Xóa</span>
                          </button>
                        </div>

                        {/* Tên sách */}
                        <a
                          href={detailHref}
                          className="font-serif text-sm sm:text-lg font-bold text-stone-900 hover:text-[#9A5B13] line-clamp-2 leading-snug block transition"
                        >
                          {item.title}
                        </a>

                        {/* Tác giả & Nhà xuất bản */}
                        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] sm:text-xs text-stone-600">
                          <span>
                            Tác giả:{" "}
                            <strong className="font-semibold text-stone-800">
                              {item.author}
                            </strong>
                          </span>
                          <span className="text-stone-300">•</span>
                          <span>
                            NXB:{" "}
                            <strong className="font-semibold text-stone-800">
                              {item.publisher}
                            </strong>
                          </span>
                        </div>

                        {/* Thông số xuất bản phụ: Năm XB, Hình thức bìa, Số trang, Kho */}
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] text-stone-500">
                          {item.publishYear && (
                            <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-stone-200/70">
                              Năm XB: {item.publishYear}
                            </span>
                          )}
                          {item.coverType && (
                            <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-stone-200/70">
                              {item.coverType}
                            </span>
                          )}
                          {item.pages && (
                            <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-stone-200/70 hidden min-[420px]:inline-block">
                              {item.pages} trang
                            </span>
                          )}
                          {item.stock > 0 && (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                              Còn {item.stock} cuốn
                            </span>
                          )}
                        </div>

                        {/* Đơn giá */}
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-sm sm:text-base font-bold text-[#9A5B13]">
                            {unitPrice.toLocaleString("vi-VN")} ₫
                          </span>
                          {hasDiscount && (
                            <span className="text-[11px] sm:text-xs text-stone-400 line-through">
                              {originalPrice.toLocaleString("vi-VN")} ₫
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* TẦNG 2: Bộ chọn số lượng + Thành tiền + Nút xóa Mobile */}
                    <div className="mt-3 pt-2.5 border-t border-dashed border-stone-200/90 flex items-center justify-between gap-2">
                      {/* Bộ tăng giảm số lượng */}
                      <div className="inline-flex items-center border border-stone-200 rounded-xl bg-[#FAF8F5]">
                        <button
                          type="button"
                          disabled={isBusy || item.quantity <= 1}
                          onClick={() =>
                            onUpdateQuantity?.(item, item.quantity - 1)
                          }
                          aria-label="Giảm số lượng"
                          className="w-8 h-8 text-sm font-bold text-stone-700 hover:bg-stone-200/60 disabled:opacity-40 rounded-l-xl cursor-pointer"
                        >
                          &minus;
                        </button>
                        <span className="w-9 text-center text-xs sm:text-sm font-bold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            onUpdateQuantity?.(item, item.quantity + 1)
                          }
                          aria-label="Tăng số lượng"
                          className="w-8 h-8 text-sm font-bold text-stone-700 hover:bg-stone-200/60 disabled:opacity-40 rounded-r-xl cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* Thành tiền + Nút xóa trên Mobile */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-stone-400 block sm:inline sm:mr-1.5">
                            Thành tiền:
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-stone-900">
                            {lineSubtotal.toLocaleString("vi-VN")} ₫
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => onRequestRemove?.(item)}
                          aria-label={`Xóa ${item.title} khỏi giỏ`}
                          className="sm:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold disabled:opacity-40"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-3.5 h-3.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* CỘT PHẢI PC & TABLET: Tóm tắt đơn hàng */}
            <aside className="lg:col-span-5 xl:col-span-4 bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-6 space-y-4 shadow-2xs lg:sticky lg:top-32">
              <div className="border-b border-stone-100 pb-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#9A5B13]">
                  Tuyển thư ký gửi
                </div>
                <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mt-0.5">
                  Tóm Tắt Đơn Hàng
                </h2>
              </div>

              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Tạm tính ấn phẩm ({totalBooks} cuốn)</span>
                  <span className="font-bold text-stone-900">
                    {subtotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Phí vận chuyển tiêu chuẩn</span>
                  <span className="font-bold text-[#9A5B13]">
                    Miễn phí (0đ)
                  </span>
                </div>
              </div>

              <div className="bg-[#F3EFEA] border border-stone-200/70 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-800">
                    Tổng thanh toán
                    <br />
                    tạm tính
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    (Đã bao gồm thuế GTGT)
                  </div>
                </div>

                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight text-right">
                  {subtotal.toLocaleString("vi-VN")}
                  <span className="text-base sm:text-lg font-sans font-bold ml-0.5">
                    đ
                  </span>
                </div>
              </div>

              <a
                href="/checkout"
                className="w-full bg-[#141414] hover:bg-stone-800 text-white text-xs sm:text-sm font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
              >
                <span>Tiến hành giao nhận &amp; thanh toán</span>
                <span>&rarr;</span>
              </a>

              <a
                href="/products"
                className="w-full text-center block text-xs font-semibold text-stone-500 hover:text-[#9A5B13] transition pt-1"
              >
                &larr; Tiếp tục chọn thêm sách
              </a>
            </aside>
          </div>
        )}
      </div>

      {/* THANH THANH TOÁN CỐ ĐỊNH Ở ĐÁY RIÊNG CHO ĐIỆN THOẠI (< lg) */}
      {!loading && items.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] text-stone-500 font-medium">
                Tổng tạm tính ({totalBooks} cuốn)
              </div>
              <div className="font-serif text-lg font-bold text-[#9A5B13] leading-tight truncate">
                {subtotal.toLocaleString("vi-VN")} ₫
              </div>
            </div>

            <a
              href="/checkout"
              className="px-4 py-2.5 rounded-xl bg-[#141414] text-white text-xs font-bold uppercase tracking-wider shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <span>Thanh toán</span>
              <span>&rarr;</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
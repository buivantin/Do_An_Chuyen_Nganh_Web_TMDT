import React from "react";
import ProductCard from "./ProductCard";
import ProductFilterSidebar from "./ProductFilterSidebar";

export const SORT_OPTIONS = [
  { value: "bestseller", label: "Bán chạy nhất" },
  { value: "newest", label: "Mới nhất" },
  { value: "title_asc", label: "Tên sách: A → Z" },
  { value: "title_desc", label: "Tên sách: Z → A" },
  { value: "publish_year_asc", label: "Năm xuất bản: Thấp đến Cao" },
  { value: "publish_year_desc", label: "Năm xuất bản: Cao đến Thấp" },
  { value: "price_asc", label: "Giá: Thấp đến Cao" },
  { value: "price_desc", label: "Giá: Cao đến Thấp" },
  { value: "rating_desc", label: "Đánh giá: Cao đến Thấp" },
];

/**
 * DUMB COMPONENT: Giao diện ProductList (Sticky Sort Bar + Responsive Mobile & PC)
 */
export default function ProductListView({
  books = [],
  categories = [],
  totalAuthorCount = 0,
  filteredAuthors = [],
  totalPublisherCount = 0,
  filteredPublishers = [],
  filters,
  priceRange,
  yearRange,
  authorSearch = "",
  publisherSearch = "",
  openSections = {},
  mobileFilterOpen = false,
  activeFilterCount = 0,
  activeChips = [],
  pagination = { currentPage: 1, lastPage: 1, total: 0 },
  pageNumbers = [],
  loading = false,
  error = "",
  sortBarRef,
  sortBarTop = 0,
  sidebarStickyTop = 168,
  onSortChange,
  onToggleMobileFilter,
  onResetAll,
  onToggleSection,
  onToggleCategory,
  onSelectRating,
  onToggleAuthor,
  onAuthorSearchChange,
  onTogglePublisher,
  onPublisherSearchChange,
  onYearRangeChange,
  onApplyYearRange,
  onSelectYearPreset,
  onPriceRangeChange,
  onApplyPriceRange,
  onSelectPricePreset,
  onPageChange,
  onAddToCart,
}) {
  const sidebarProps = {
    categories,
    totalAuthorCount,
    filteredAuthors,
    totalPublisherCount,
    filteredPublishers,
    filters,
    priceRange,
    yearRange,
    authorSearch,
    publisherSearch,
    openSections,
    onToggleSection,
    onToggleCategory,
    onSelectRating,
    onToggleAuthor,
    onAuthorSearchChange,
    onTogglePublisher,
    onPublisherSearchChange,
    onYearRangeChange,
    onApplyYearRange,
    onSelectYearPreset,
    onPriceRangeChange,
    onApplyPriceRange,
    onSelectPricePreset,
  };

  return (
    <div className="bg-[#FCFBF9] min-h-screen">
      {/* THANH SẮP XẾP & BỘ LỌC GHIM CỐ ĐỊNH (STICKY) NGAY DƯỚI NAVBAR */}
      <div
        ref={sortBarRef}
        style={{ top: `${sortBarTop}px` }}
        className="sticky z-20 border-b border-stone-200/80 bg-[#FAF8F5] shadow-2xs transform-gpu"
      >
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          {/* BÊN TRÁI: Dropdown Sắp xếp + Nút mở Bộ lọc trên Mobile/Tablet */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="text-xs text-stone-500 whitespace-nowrap hidden md:inline">
                Sắp xếp:
              </span>
              <select
                value={filters.sort}
                onChange={(e) => onSortChange?.(e.target.value)}
                aria-label="Sắp xếp sản phẩm"
                className="bg-white border border-stone-200 rounded-xl px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#9A5B13] cursor-pointer max-w-[145px] min-[380px]:max-w-[175px] sm:max-w-none truncate"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Nút mở Ngăn kéo bộ lọc cho màn hình nhỏ (< lg) */}
            <button
              type="button"
              onClick={() => onToggleMobileFilter?.(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#141414] text-white text-[11px] sm:text-xs font-bold shadow-2xs cursor-pointer shrink-0"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-3.5 h-3.5 text-[#E5B87B]"
              >
                <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
              </svg>
              <span>Bộ lọc</span>
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#9A5B13] text-white text-[10px] font-extrabold leading-none">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* BÊN PHẢI: Thống kê số lượng sách */}
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-stone-600 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#9A5B13] hidden sm:inline-block" />
            <span className="sm:hidden">
              <strong className="text-stone-900">{books.length}</strong>/
              <strong className="text-stone-900">
                {pagination.total.toLocaleString("vi-VN")}
              </strong>{" "}
              sách
            </span>
            <span className="hidden sm:inline">
              Hiển thị <strong className="text-stone-900">{books.length}</strong>{" "}
              trong số{" "}
              <strong className="text-stone-900">
                {pagination.total.toLocaleString("vi-VN")}
              </strong>{" "}
              cuốn sách
            </span>
          </div>
        </div>
      </div>

      {/* Dải chip chọn nhanh thể loại dành riêng cho Mobile */}
      {categories.length > 0 && (
        <div className="lg:hidden border-b border-stone-200/60 bg-[#FAF8F5]/60 px-3 py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const active = filters.categoryIds.includes(String(cat.id));
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onToggleCategory?.(String(cat.id))}
                className={`px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition cursor-pointer ${
                  active
                    ? "bg-[#9A5B13] text-white font-bold"
                    : "bg-white border border-stone-200/90 text-stone-700"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* NGĂN KÉO BỘ LỌC RIÊNG CHO MOBILE (Slide-over Drawer) */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-black/55 backdrop-blur-2xs flex justify-end"
          onClick={() => onToggleMobileFilter?.(false)}
        >
          <div
            className="w-[88%] max-w-sm bg-[#FAF8F5] h-full flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3.5 bg-white border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2 font-serif font-bold text-base text-[#1A1A1A]">
                <span>Bộ lọc tìm kiếm</span>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#F3E2D2] text-[#9A5B13] text-xs font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onToggleMobileFilter?.(false)}
                aria-label="Đóng bộ lọc"
                className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2">
              <ProductFilterSidebar {...sidebarProps} />
            </div>

            <div className="p-3.5 bg-white border-t border-stone-200 flex items-center gap-2.5">
              <button
                type="button"
                onClick={onResetAll}
                className="flex-1 py-2.5 rounded-xl bg-[#FAF8F5] border border-stone-300 text-xs font-bold text-stone-700"
              >
                Thiết lập lại
              </button>
              <button
                type="button"
                onClick={() => onToggleMobileFilter?.(false)}
                className="flex-[1.5] py-2.5 rounded-xl bg-[#141414] text-white text-xs font-bold"
              >
                Xem {pagination.total.toLocaleString("vi-VN")} kết quả
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NỘI DUNG CHÍNH PC & MOBILE */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI PC: Bộ lọc tìm kiếm */}
        <aside className="hidden lg:block lg:col-span-3">
          <div
            style={{
              top: `${sidebarStickyTop}px`,
              maxHeight: `calc(100vh - ${sidebarStickyTop + 20}px)`,
            }}
            className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-5 sticky overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-200/80">
              <div className="flex items-center gap-2 font-serif font-bold text-base text-[#1A1A1A]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4 text-[#9A5B13]"
                >
                  <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
                </svg>
                <span>Bộ lọc tìm kiếm</span>
              </div>
              <button
                type="button"
                onClick={onResetAll}
                className="text-[11px] font-bold tracking-wider uppercase text-[#9A5B13] hover:underline cursor-pointer"
              >
                Thiết lập lại
              </button>
            </div>

            <ProductFilterSidebar {...sidebarProps} />
          </div>
        </aside>

        {/* CỘT PHẢI: Thẻ đang áp dụng + Lưới sản phẩm + Phân trang */}
        <section className="lg:col-span-9">
          {activeChips.length > 0 && (
            <div className="mb-4 sm:mb-5 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mr-1">
                Đang áp dụng:
              </span>
              {activeChips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1.5 bg-white border border-stone-200 text-stone-700 text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full shadow-2xs"
                >
                  <span>{chip.label}</span>
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    aria-label={`Xóa lọc ${chip.label}`}
                    className="text-stone-400 hover:text-stone-900 font-bold cursor-pointer"
                  >
                    &times;
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={onResetAll}
                className="text-xs font-semibold text-[#9A5B13] hover:underline ml-1 cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-3 border border-stone-100 animate-pulse"
                >
                  <div className="bg-stone-200 rounded-xl aspect-[3/4]" />
                  <div className="h-3 bg-stone-200 rounded w-1/2 mt-3" />
                  <div className="h-4 bg-stone-200 rounded w-3/4 mt-2" />
                  <div className="h-9 bg-stone-200 rounded-lg mt-4" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          ) : books.length === 0 ? (
            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-8 sm:p-12 text-center">
              <p className="font-serif text-base sm:text-lg font-bold text-stone-800">
                Không tìm thấy sản phẩm nào phù hợp
              </p>
              <p className="text-xs text-stone-500 mt-1.5">
                Hãy thử bớt điều kiện lọc hoặc thiết lập lại bộ lọc tìm kiếm.
              </p>
              <button
                type="button"
                onClick={onResetAll}
                className="mt-4 bg-[#141414] text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Thiết lập lại bộ lọc
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {books.map((book) => (
                  <ProductCard
                    key={book.id}
                    book={book}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>

              {pagination.lastPage > 1 && (
                <div className="mt-7 sm:mt-8 pt-5 sm:pt-6 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={pagination.currentPage <= 1}
                    onClick={() => onPageChange?.(pagination.currentPage - 1)}
                    className="px-3 sm:px-4 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-[#F3EFEA] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
                  >
                    &lt; Trước
                  </button>

                  <div className="flex items-center gap-1 sm:gap-1.5">
                    {pageNumbers.map((item, idx) =>
                      item === "..." ? (
                        <span
                          key={`dots-${idx}`}
                          className="px-1.5 text-xs text-stone-400"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          onClick={() => onPageChange?.(item)}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-bold transition cursor-pointer ${
                            pagination.currentPage === item
                              ? "bg-[#141414] text-white"
                              : "bg-white border border-stone-200 text-stone-700 hover:bg-[#F3EFEA]"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={pagination.currentPage >= pagination.lastPage}
                    onClick={() => onPageChange?.(pagination.currentPage + 1)}
                    className="px-3 sm:px-4 py-2 rounded-xl bg-[#141414] hover:bg-stone-800 text-white text-xs font-semibold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
                  >
                    Sau &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
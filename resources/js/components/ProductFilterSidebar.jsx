import React from "react";

export const PRICE_PRESETS = [
  { label: "Dưới 100.000đ", min: "0", max: "100000" },
  { label: "100k - 250.000đ", min: "100000", max: "250000" },
  { label: "250k - 500.000đ", min: "250000", max: "500000" },
  { label: "Trên 500.000đ", min: "500000", max: "" },
];

export const RATING_OPTIONS = [
  { value: "5", label: "5 sao tuyệt đối", stars: 5 },
  { value: "4", label: "Từ 4 sao trở lên", stars: 4 },
  { value: "3", label: "Từ 3 sao trở lên", stars: 3 },
  { value: "2", label: "Từ 2 sao trở lên", stars: 2 },
  { value: "1", label: "Từ 1 sao trở lên", stars: 1 },
];

export const YEAR_PRESETS = [
  { label: "2024 - 2026", min: "2024", max: "2026" },
  { label: "2020 - 2023", min: "2020", max: "2023" },
  { label: "2015 - 2019", min: "2015", max: "2019" },
  { label: "Trước 2015", min: "", max: "2014" },
];

function StarRow({ count }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500 text-xs">
      {Array.from({ length: 5 }).map((_, idx) => (
        <span
          key={idx}
          className={idx < count ? "text-amber-500" : "text-stone-300"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

/**
 * DUMB COMPONENT: Hiển thị thuần UI các nhóm bộ lọc (100% nhận dữ liệu qua props)
 */
export default function ProductFilterSidebar({
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
}) {
  const renderSectionHeader = (key, title, selectedCount = 0) => (
    <button
      type="button"
      onClick={() => onToggleSection?.(key)}
      className="w-full flex items-center justify-between text-left py-1 cursor-pointer group"
    >
      <span className="flex items-center gap-2 text-xs font-bold text-stone-900 group-hover:text-[#9A5B13] transition-colors">
        <span>{title}</span>
        {selectedCount > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-[#9A5B13] text-white text-[10px] font-bold leading-none">
            {selectedCount}
          </span>
        )}
      </span>
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${
          openSections[key] ? "rotate-180" : ""
        }`}
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );

  return (
    <div className="divide-y divide-stone-200/80">
      {/* 1. THỂ LOẠI & ĐỀ TÀI (Chọn nhiều) */}
      <div className="py-3.5">
        {renderSectionHeader(
          "categories",
          "Thể loại & Đề tài",
          filters.categoryIds.length
        )}

        {openSections.categories && (
          <div className="mt-3">
            {categories.length === 0 ? (
              <p className="text-xs text-stone-400">Chưa có danh mục.</p>
            ) : (
              <ul className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const checked = filters.categoryIds.includes(String(cat.id));
                  return (
                    <li key={cat.id}>
                      <button
                        type="button"
                        onClick={() => onToggleCategory?.(String(cat.id))}
                        className="w-full flex items-center justify-between text-left group cursor-pointer py-0.5"
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-4 h-4 rounded shrink-0 flex items-center justify-center border transition ${
                              checked
                                ? "bg-[#9A5B13] border-[#9A5B13] text-white"
                                : "bg-white border-stone-300 group-hover:border-[#9A5B13]"
                            }`}
                          >
                            {checked && (
                              <svg
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                className="w-3 h-3"
                              >
                                <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                              </svg>
                            )}
                          </span>
                          <span
                            className={`text-xs truncate transition ${
                              checked
                                ? "font-bold text-stone-900"
                                : "text-stone-600 group-hover:text-stone-900"
                            }`}
                          >
                            {cat.name}
                          </span>
                        </span>
                        {cat.products_count !== undefined && (
                          <span className="text-[10px] bg-white border border-stone-200/80 text-stone-500 px-1.5 py-0.5 rounded shrink-0 ml-2">
                            {cat.products_count}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* 2. SỐ SAO ĐÁNH GIÁ */}
      <div className="py-3.5">
        {renderSectionHeader(
          "rating",
          "Đánh giá sao",
          filters.minRating ? 1 : 0
        )}

        {openSections.rating && (
          <ul className="mt-3 space-y-1.5">
            {RATING_OPTIONS.map((opt) => {
              const active = filters.minRating === opt.value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => onSelectRating?.(active ? "" : opt.value)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer ${
                      active
                        ? "bg-[#F3E2D2] text-[#9A5B13] font-bold border border-[#9A5B13]/30"
                        : "bg-white hover:bg-[#F3EFEA] border border-stone-200/70 text-stone-700"
                    }`}
                  >
                    <StarRow count={opt.stars} />
                    <span className="text-[11px]">{opt.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 3. TÁC GIẢ (Chọn nhiều) */}
      <div className="py-3.5">
        {renderSectionHeader("authors", "Tác giả", filters.authors.length)}

        {openSections.authors && (
          <div className="mt-3 space-y-2.5">
            {totalAuthorCount > 5 && (
              <input
                type="text"
                value={authorSearch}
                onChange={(e) => onAuthorSearchChange?.(e.target.value)}
                placeholder="Tìm nhanh tác giả..."
                className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#9A5B13]"
              />
            )}

            {filteredAuthors.length === 0 ? (
              <p className="text-xs text-stone-400">Không tìm thấy tác giả.</p>
            ) : (
              <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {filteredAuthors.map((author) => {
                  const checked = filters.authors.includes(author.name);
                  return (
                    <li key={author.name}>
                      <button
                        type="button"
                        onClick={() => onToggleAuthor?.(author.name)}
                        className="w-full flex items-center justify-between text-left group cursor-pointer py-0.5"
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-4 h-4 rounded shrink-0 flex items-center justify-center border transition ${
                              checked
                                ? "bg-[#9A5B13] border-[#9A5B13] text-white"
                                : "bg-white border-stone-300 group-hover:border-[#9A5B13]"
                            }`}
                          >
                            {checked && (
                              <svg
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                className="w-3 h-3"
                              >
                                <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                              </svg>
                            )}
                          </span>
                          <span
                            className={`text-xs truncate transition ${
                              checked
                                ? "font-bold text-stone-900"
                                : "text-stone-600 group-hover:text-stone-900"
                            }`}
                            title={author.name}
                          >
                            {author.name}
                          </span>
                        </span>
                        <span className="text-[10px] bg-white border border-stone-200/80 text-stone-500 px-1.5 py-0.5 rounded shrink-0 ml-2">
                          {author.count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* 4. NHÀ XUẤT BẢN (Chọn nhiều) */}
      <div className="py-3.5">
        {renderSectionHeader(
          "publishers",
          "Nhà xuất bản",
          filters.publishers.length
        )}

        {openSections.publishers && (
          <div className="mt-3 space-y-2.5">
            {totalPublisherCount > 5 && (
              <input
                type="text"
                value={publisherSearch}
                onChange={(e) => onPublisherSearchChange?.(e.target.value)}
                placeholder="Tìm nhanh nhà xuất bản..."
                className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#9A5B13]"
              />
            )}

            {filteredPublishers.length === 0 ? (
              <p className="text-xs text-stone-400">
                Không tìm thấy nhà xuất bản.
              </p>
            ) : (
              <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {filteredPublishers.map((pub) => {
                  const checked = filters.publishers.includes(pub.name);
                  return (
                    <li key={pub.name}>
                      <button
                        type="button"
                        onClick={() => onTogglePublisher?.(pub.name)}
                        className="w-full flex items-center justify-between text-left group cursor-pointer py-0.5"
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-4 h-4 rounded shrink-0 flex items-center justify-center border transition ${
                              checked
                                ? "bg-[#9A5B13] border-[#9A5B13] text-white"
                                : "bg-white border-stone-300 group-hover:border-[#9A5B13]"
                            }`}
                          >
                            {checked && (
                              <svg
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                className="w-3 h-3"
                              >
                                <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                              </svg>
                            )}
                          </span>
                          <span
                            className={`text-xs truncate transition ${
                              checked
                                ? "font-bold text-stone-900"
                                : "text-stone-600 group-hover:text-stone-900"
                            }`}
                            title={pub.name}
                          >
                            {pub.name}
                          </span>
                        </span>
                        <span className="text-[10px] bg-white border border-stone-200/80 text-stone-500 px-1.5 py-0.5 rounded shrink-0 ml-2">
                          {pub.count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* 5. NĂM XUẤT BẢN */}
      <div className="py-3.5">
        {renderSectionHeader(
          "publishYear",
          "Năm xuất bản",
          filters.minYear !== "" || filters.maxYear !== "" ? 1 : 0
        )}

        {openSections.publishYear && (
          <div className="mt-3 space-y-2.5">
            <div className="grid grid-cols-2 gap-1.5">
              {YEAR_PRESETS.map((preset) => {
                const isSelected =
                  filters.minYear === preset.min &&
                  filters.maxYear === preset.max;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => onSelectYearPreset?.(preset)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-medium text-center transition cursor-pointer ${
                      isSelected
                        ? "bg-[#F3E2D2] text-[#9A5B13] font-bold border border-[#9A5B13]/30"
                        : "bg-white border border-stone-200/80 text-stone-600 hover:bg-[#F3EFEA]"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onApplyYearRange?.();
              }}
              className="space-y-2"
            >
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1900"
                  max="2099"
                  placeholder="Từ năm"
                  value={yearRange.min}
                  onChange={(e) =>
                    onYearRangeChange?.({ ...yearRange, min: e.target.value })
                  }
                  className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#9A5B13]"
                />
                <span className="text-stone-400 text-xs">-</span>
                <input
                  type="number"
                  min="1900"
                  max="2099"
                  placeholder="Đến năm"
                  value={yearRange.max}
                  onChange={(e) =>
                    onYearRangeChange?.({ ...yearRange, max: e.target.value })
                  }
                  className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#9A5B13]"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-white hover:bg-[#141414] border border-stone-300 hover:border-[#141414] text-stone-800 hover:text-white text-xs font-semibold py-1.5 rounded-lg transition cursor-pointer"
              >
                Áp dụng năm XB
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 6. KHOẢNG GIÁ */}
      <div className="pt-3.5">
        {renderSectionHeader(
          "price",
          "Khoảng giá (VNĐ)",
          filters.minPrice !== "" || filters.maxPrice !== "" ? 1 : 0
        )}

        {openSections.price && (
          <div className="mt-3">
            <input
              type="range"
              min="0"
              max="1000000"
              step="50000"
              value={priceRange.max || 1000000}
              onChange={(e) => {
                const val = e.target.value === "1000000" ? "" : e.target.value;
                onPriceRangeChange?.({ ...priceRange, max: val }, true);
              }}
              className="w-full accent-[#9A5B13] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mb-3">
              <span>0đ</span>
              <span>500.000đ</span>
              <span>1.000.000đ</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {PRICE_PRESETS.map((preset) => {
                const isSelected =
                  filters.minPrice === preset.min &&
                  filters.maxPrice === preset.max;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => onSelectPricePreset?.(preset)}
                    className={`px-2 py-2 rounded-lg text-[11px] font-medium text-center transition cursor-pointer ${
                      isSelected
                        ? "bg-[#F3E2D2] text-[#9A5B13] font-bold border border-[#9A5B13]/30"
                        : "bg-white border border-stone-200/80 text-stone-600 hover:bg-[#F3EFEA]"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onApplyPriceRange?.();
              }}
              className="space-y-2"
            >
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  placeholder="Từ (đ)"
                  value={priceRange.min}
                  onChange={(e) =>
                    onPriceRangeChange?.({ ...priceRange, min: e.target.value })
                  }
                  className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#9A5B13]"
                />
                <span className="text-stone-400 text-xs">-</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Đến (đ)"
                  value={priceRange.max}
                  onChange={(e) =>
                    onPriceRangeChange?.({ ...priceRange, max: e.target.value })
                  }
                  className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#9A5B13]"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#141414] hover:bg-stone-800 text-white text-xs font-semibold py-2 rounded-lg transition cursor-pointer"
              >
                Áp dụng khoảng giá
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
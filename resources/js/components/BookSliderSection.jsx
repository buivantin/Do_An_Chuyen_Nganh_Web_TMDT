import React, { useRef } from "react";
import ProductCard from "./ProductCard";

export default function BookSliderSection({
  id,
  subtitle,
  title,
  badgeText,
  books = [],
  viewAllHref,
  onAddToCart,
}) {
  const sliderRef = useRef(null);

  if (!Array.isArray(books) || books.length === 0) {
    return null;
  }

  const scrollByAmount = (direction) => {
    if (!sliderRef.current) return;
    const width = sliderRef.current.clientWidth || 600;
    sliderRef.current.scrollBy({
      left: direction * Math.max(280, width * 0.75),
      behavior: "smooth",
    });
  };

  return (
    <section id={id} className="space-y-4">
      {/* Header kệ sách */}
      <div className="flex items-end justify-between gap-3 border-b border-stone-200/80 pb-3">
        <div>
          {subtitle && (
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#9A5B13]">
              {subtitle}
            </span>
          )}
          <div className="flex items-center gap-2.5 mt-0.5">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A]">
              {title}
            </h2>
            {badgeText && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#F5EDE2] border border-[#E5D5BE] text-[#9A5B13] text-[10px] sm:text-xs font-bold">
                {badgeText}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollByAmount(-1)}
              aria-label="Cuộn trái"
              className="w-8 h-8 rounded-full bg-white border border-stone-200 hover:border-[#9A5B13] text-stone-700 hover:text-[#9A5B13] flex items-center justify-center transition cursor-pointer"
            >
              &lsaquo;
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount(1)}
              aria-label="Cuộn phải"
              className="w-8 h-8 rounded-full bg-white border border-stone-200 hover:border-[#9A5B13] text-stone-700 hover:text-[#9A5B13] flex items-center justify-center transition cursor-pointer"
            >
              &rsaquo;
            </button>
          </div>

          {viewAllHref && (
            <a
              href={viewAllHref}
              className="text-xs font-semibold text-[#9A5B13] hover:underline ml-1"
            >
              Xem tất cả &rarr;
            </a>
          )}
        </div>
      </div>

      {/* Danh sách sách dạng slider ngang */}
      <div
        ref={sliderRef}
        className="grid grid-flow-col auto-cols-[calc(50%-6px)] sm:auto-cols-[calc(33.333%-11px)] lg:auto-cols-[calc(25%-12px)] gap-3 sm:gap-4 overflow-x-auto scroll-smooth pb-2 no-scrollbar"
      >
        {books.map((book) => (
          <div key={book.id} className="min-w-0">
            <ProductCard book={book} onAddToCart={onAddToCart} />
          </div>
        ))}
      </div>
    </section>
  );
}
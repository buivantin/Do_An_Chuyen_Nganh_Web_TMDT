import React, { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "./ProductCard";

/**
 * DUMB COMPONENT: Hiển thị dải slider trượt ngang chậm & mượt mà (1000ms)
 */
export function BookSliderView({
  id,
  subtitle,
  title,
  badgeText = "",
  pages = [],
  currentSlide = 0,
  totalSlides = 1,
  viewAllHref = "/products",
  onPrev,
  onNext,
  onSelectSlide,
  onPauseChange,
  onTouchStart,
  onTouchEnd,
}) {
  return (
    <section
      id={id}
      onMouseEnter={() => onPauseChange?.(true)}
      onMouseLeave={() => onPauseChange?.(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="space-y-4 sm:space-y-5 scroll-mt-32"
    >
      {/* Header khu vực */}
      <div className="flex flex-wrap items-end justify-between gap-2.5 border-b border-stone-200/80 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#9A5B13]">
              {subtitle}
            </span>
            {badgeText && (
              <span className="px-2 py-0.5 rounded-full bg-[#F5EDE2] text-[#9A5B13] text-[10px] font-bold">
                {badgeText}
              </span>
            )}
          </div>
          <h2 className="font-serif text-lg sm:text-2xl font-bold text-stone-900 mt-0.5">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {totalSlides > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onPrev}
                aria-label="Slide trước"
                className="w-8 h-8 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-[#F3EFEA] hover:border-[#9A5B13]/40 flex items-center justify-center transition cursor-pointer"
              >
                &lsaquo;
              </button>
              <button
                type="button"
                onClick={onNext}
                aria-label="Slide tiếp theo"
                className="w-8 h-8 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-[#F3EFEA] hover:border-[#9A5B13]/40 flex items-center justify-center transition cursor-pointer"
              >
                &rsaquo;
              </button>
            </div>
          )}

          <a
            href={viewAllHref}
            className="text-xs font-bold text-[#9A5B13] hover:underline whitespace-nowrap"
          >
            Xem tất cả &rarr;
          </a>
        </div>
      </div>

      {/* Khung trượt ngang mượt mà (duration-1000 cubic-bezier) */}
      {pages.length === 0 ? (
        <p className="text-sm text-stone-500">Chưa có ấn phẩm trong mục này.</p>
      ) : (
        <>
          <div className="overflow-hidden -mx-1 px-1 py-1">
            <div
              className="flex transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
              style={{
                transform: `translate3d(-${currentSlide * 100}%, 0, 0)`,
              }}
            >
              {pages.map((pageBooks, pageIdx) => (
                <div
                  key={pageIdx}
                  className="w-full shrink-0 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 px-0.5"
                >
                  {pageBooks.map((book) => (
                    <ProductCard key={book.id} book={book} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Thanh chấm chỉ báo tiến trình slide */}
          {totalSlides > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectSlide?.(idx)}
                  aria-label={`Trang slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                    currentSlide === idx
                      ? "w-7 bg-[#9A5B13]"
                      : "w-2 bg-stone-300 hover:bg-stone-400"
                  }`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

/**
 * SMART COMPONENT: Tự động lướt slide, tạm dừng khi hover/touch, hỗ trợ vuốt ngang trên Mobile
 */
export default function BookSliderSection({
  id,
  subtitle,
  title,
  badgeText,
  books = [],
  viewAllHref,
  autoPlayInterval = 5500,
}) {
  const [perSlide, setPerSlide] = useState(() =>
    typeof window !== "undefined" && window.innerWidth >= 768 ? 4 : 2
  );
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setPerSlide(window.innerWidth >= 768 ? 4 : 2);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pages = useMemo(() => {
    if (!Array.isArray(books) || books.length === 0) return [];
    const chunks = [];
    for (let i = 0; i < books.length; i += perSlide) {
      chunks.push(books.slice(i, i + perSlide));
    }
    return chunks;
  }, [books, perSlide]);

  const totalSlides = pages.length;

  useEffect(() => {
    if (currentSlide >= totalSlides) {
      setCurrentSlide(0);
    }
  }, [currentSlide, totalSlides]);

  // Tự động lướt cho tất cả các slider
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [totalSlides, isPaused, autoPlayInterval]);

  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches?.[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e) => {
    const startX = touchStartXRef.current;
    const endX = e.changedTouches?.[0]?.clientX ?? null;
    if (startX !== null && endX !== null) {
      const diff = startX - endX;
      if (Math.abs(diff) > 45 && totalSlides > 1) {
        if (diff > 0) {
          setCurrentSlide((prev) => (prev + 1) % totalSlides);
        } else {
          setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
        }
      }
    }
    touchStartXRef.current = null;
    setTimeout(() => setIsPaused(false), 1800);
  };

  return (
    <BookSliderView
      id={id}
      subtitle={subtitle}
      title={title}
      badgeText={badgeText}
      pages={pages}
      currentSlide={currentSlide}
      totalSlides={totalSlides}
      viewAllHref={viewAllHref}
      onPrev={() =>
        setCurrentSlide((prev) => (prev <= 0 ? totalSlides - 1 : prev - 1))
      }
      onNext={() =>
        setCurrentSlide((prev) => (prev >= totalSlides - 1 ? 0 : prev + 1))
      }
      onSelectSlide={setCurrentSlide}
      onPauseChange={setIsPaused}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    />
  );
}
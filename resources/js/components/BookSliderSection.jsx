import React, { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "./ProductCard";

export default function BookSliderSection({
  id,
  subtitle,
  title,
  badgeText,
  books = [],
  viewAllHref = "/products",
  onAddToCart,
  autoPlayInterval = 4200, // Tự động lướt mỗi 4.2 giây
}) {
  const list = Array.isArray(books) ? books : [];
  const [visibleCount, setVisibleCount] = useState(4);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const lockRef = useRef(false);

  // Responsive: 4 sách trên desktop, 3 trên tablet, 2 trên mobile
  useEffect(() => {
    const updateResponsiveCount = () => {
      const w = window.innerWidth;
      if (w < 640) setVisibleCount(2);
      else if (w < 1024) setVisibleCount(3);
      else setVisibleCount(4);
    };
    updateResponsiveCount();
    window.addEventListener("resize", updateResponsiveCount);
    return () => window.removeEventListener("resize", updateResponsiveCount);
  }, []);

  const canLoop = list.length > visibleCount;

  // Nhân bản thêm visibleCount phần tử đầu vào cuối để lướt vòng tròn vô tận mượt mà
  const slides = useMemo(() => {
    if (!canLoop) return list;
    return [...list, ...list.slice(0, visibleCount)];
  }, [list, visibleCount, canLoop]);

  useEffect(() => {
    setIsTransitioning(false);
    setCurrentIndex(0);
  }, [list.length, visibleCount]);

  const handleNext = () => {
    if (!canLoop || lockRef.current) return;
    lockRef.current = true;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (!canLoop || lockRef.current) return;
    lockRef.current = true;
    if (currentIndex === 0) {
      setIsTransitioning(false);
      setCurrentIndex(list.length);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
          setCurrentIndex(list.length - 1);
        });
      });
    } else {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleTransitionEnd = () => {
    lockRef.current = false;
    if (canLoop && currentIndex >= list.length) {
      setIsTransitioning(false);
      setCurrentIndex(0);
    }
  };

  // Tự động lướt carousel chậm rãi và tạm dừng khi rê chuột vào
  useEffect(() => {
    if (!canLoop || isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [canLoop, isPaused, autoPlayInterval, currentIndex, list.length]);

  if (list.length === 0) return null;

  const activeDot = list.length > 0 ? currentIndex % list.length : 0;
  const itemWidthPercent = 100 / visibleCount;

  return (
    <section
      id={id}
      className="space-y-4 sm:space-y-5"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Tiêu đề & Nút điều hướng Carousel */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {subtitle && (
            <div className="text-[11px] font-bold uppercase tracking-widest text-[#9A5B13]">
              {subtitle}
            </div>
          )}
          <div className="flex items-center gap-2.5 mt-0.5">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A]">
              {title}
            </h2>
            {badgeText && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#F5EDE2] border border-[#E5D5BE] text-[#9A5B13] text-[11px] font-bold">
                {badgeText}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {canLoop && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Sách trước"
                className="w-9 h-9 rounded-full bg-white hover:bg-[#FAF8F5] border border-stone-200 hover:border-[#9A5B13] text-stone-700 hover:text-[#9A5B13] flex items-center justify-center transition cursor-pointer shadow-2xs"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <path
                    d="M15 18l-6-6 6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Sách tiếp theo"
                className="w-9 h-9 rounded-full bg-white hover:bg-[#FAF8F5] border border-stone-200 hover:border-[#9A5B13] text-stone-700 hover:text-[#9A5B13] flex items-center justify-center transition cursor-pointer shadow-2xs"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <path
                    d="M9 18l6-6-6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}

          <a
            href={viewAllHref}
            className="text-xs sm:text-sm font-semibold text-[#9A5B13] hover:text-[#7A450A] transition ml-1"
          >
            Xem tất cả &rarr;
          </a>
        </div>
      </div>

      {/* Khung Carousel 4 ProductCard mỗi hàng, lướt mượt */}
      <div className="overflow-hidden -mx-2 py-1">
        <div
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `translate3d(-${currentIndex * itemWidthPercent}%, 0, 0)`,
            transition: isTransitioning
              ? "transform 850ms cubic-bezier(0.22, 1, 0.36, 1)"
              : "none",
          }}
          className="flex items-stretch will-change-transform"
        >
          {slides.map((book, idx) => (
            <div
              key={`${book.id}-${idx}`}
              style={{ width: `${itemWidthPercent}%` }}
              className="shrink-0 px-2 flex"
            >
              <div className="w-full">
                <ProductCard
                  product={book}
                  book={book}
                  onAddToCart={onAddToCart}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chỉ báo vị trí chấm tròn (Pagination dots) */}
      {canLoop && (
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {list.map((b, i) => (
            <button
              key={b.id || i}
              type="button"
              aria-label={`Chuyển đến sách ${i + 1}`}
              onClick={() => {
                setIsTransitioning(true);
                setCurrentIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeDot === i
                  ? "w-6 bg-[#9A5B13]"
                  : "w-1.5 bg-stone-300 hover:bg-stone-400"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
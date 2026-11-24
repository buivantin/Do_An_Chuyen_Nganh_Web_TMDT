import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  ADMIN_BANNERS_STORAGE_KEY,
  DEFAULT_HERO_BANNERS,
} from "../data/homeMockData";
import { resolveBookImageUrl } from "./ProductCard";

/**
 * DUMB COMPONENT: Hiển thị Hero Banner trượt ngang chậm & mượt mà, responsive riêng Mobile & PC
 */
export function HeroBannerView({
  banners = [],
  activeIndex = 0,
  onPrev,
  onNext,
  onSelectIndex,
  onPauseChange,
  onTouchStart,
  onTouchEnd,
}) {
  if (!banners.length) return null;

  return (
    <section
      onMouseEnter={() => onPauseChange?.(true)}
      onMouseLeave={() => onPauseChange?.(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-stone-200/80 bg-[#1B1714] text-white shadow-md"
    >
      {/* Dải trượt ngang các Banner */}
      <div
        className="flex transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
        style={{
          transform: `translate3d(-${activeIndex * 100}%, 0, 0)`,
        }}
      >
        {banners.map((item, idx) => {
          const linkedBookHref = item.book_id
            ? `/products/${item.book_id}`
            : "/products";

          return (
            <div
              key={item.id || idx}
              className="relative w-full shrink-0 overflow-hidden"
            >
              {/* Ảnh nền Banner */}
              <div className="absolute inset-0">
                <img
                  src={resolveBookImageUrl(item.banner_image)}
                  alt={item.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1400&q=80";
                  }}
                  className="w-full h-full object-cover opacity-35"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#16120F]/95 via-[#1C1713]/85 to-[#1C1713]/65" />
              </div>

              {/* Nội dung Banner: Mobile gọn 1 cột, PC chia 12 cột */}
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-7 sm:py-11 lg:py-14 pb-14 sm:pb-16 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-10 items-center">
                <div className="lg:col-span-8 space-y-3.5 sm:space-y-5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#9A5B13]/30 border border-[#E5B87B]/40 text-[#F3D19E] text-[10px] sm:text-[11px] font-bold uppercase tracking-widest">
                    <span>✦</span>
                    <span>{item.badge_text || "Ấn phẩm & Trích dẫn nổi bật"}</span>
                  </span>

                  <h1 className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-[#FAF8F5] leading-snug sm:leading-tight">
                    {item.title}
                  </h1>

                  {item.quote && (
                    <blockquote className="border-l-4 border-[#D99B4E] pl-3 sm:pl-4 py-1 bg-white/5 rounded-r-xl">
                      <p className="font-serif italic text-xs sm:text-lg text-[#F7E7CE] leading-relaxed">
                        {item.quote}
                      </p>
                    </blockquote>
                  )}

                  {item.description && (
                    <p className="hidden sm:block text-sm text-stone-300 max-w-2xl leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  <div className="pt-1 flex flex-wrap items-center gap-2.5 sm:gap-3">
                    <a
                      href={linkedBookHref}
                      className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-[#9A5B13] hover:bg-[#B46B17] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition shadow-sm"
                    >
                      Khám phá sách &rarr;
                    </a>
                    <a
                      href="/products"
                      className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold transition"
                    >
                      Xem tủ sách
                    </a>
                  </div>
                </div>

                {/* Thẻ sách được liên kết */}
                <div className="lg:col-span-4 flex justify-start lg:justify-end">
                  <a
                    href={linkedBookHref}
                    className="group bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-5 flex items-center gap-3.5 sm:gap-4 max-w-md lg:max-w-sm w-full transition"
                  >
                    <div className="w-16 sm:w-24 aspect-[3/4] rounded-xl bg-[#F5EFE6] p-1.5 shrink-0 overflow-hidden shadow-lg">
                      <img
                        src={resolveBookImageUrl(item.book_image)}
                        alt={item.book_title || item.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            "https://placehold.co/240x340/F5EFE6/9A5B13?text=Book";
                        }}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#F3D19E]">
                        Sách liên kết
                      </span>
                      <h2 className="font-serif text-sm sm:text-lg font-bold text-white line-clamp-2 group-hover:text-[#F3D19E] transition-colors">
                        {item.book_title || "Xem chi tiết ấn phẩm"}
                      </h2>
                      {item.book_author && (
                        <p className="text-[11px] sm:text-xs text-stone-300 truncate">
                          {item.book_author}
                        </p>
                      )}
                      <div className="pt-0.5 text-[11px] sm:text-xs font-bold text-[#F3D19E] group-hover:underline">
                        Xem chi tiết &rsaquo;
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Điều hướng Slide Banner */}
      {banners.length > 1 && (
        <div className="absolute bottom-3.5 sm:bottom-5 inset-x-0 z-20 px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {banners.map((item, idx) => (
              <button
                key={item.id || idx}
                type="button"
                onClick={() => onSelectIndex?.(idx)}
                aria-label={`Banner ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                  idx === activeIndex
                    ? "w-7 bg-[#E5B87B]"
                    : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              aria-label="Banner trước"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              &lsaquo;
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Banner tiếp theo"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              &rsaquo;
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/**
 * SMART COMPONENT: Tự động lướt banner chậm mượt, hỗ trợ vuốt ngang trên Mobile
 */
export default function HeroBanner({ initialBanners = null }) {
  const [banners, setBanners] = useState(() => {
    if (Array.isArray(initialBanners) && initialBanners.length > 0) {
      return initialBanners;
    }
    try {
      const saved = JSON.parse(
        localStorage.getItem(ADMIN_BANNERS_STORAGE_KEY) || "null"
      );
      if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch {
      // ignore
    }
    return DEFAULT_HERO_BANNERS;
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef(null);

  useEffect(() => {
    let active = true;
    axios
      .get("/api/banners", { headers: { Accept: "application/json" } })
      .then((res) => {
        if (!active) return;
        const list = res.data?.data || res.data?.banners || res.data;
        if (Array.isArray(list) && list.length > 0) {
          setBanners(list);
        }
      })
      .catch(() => {});

    const handleStorageUpdate = () => {
      try {
        const saved = JSON.parse(
          localStorage.getItem(ADMIN_BANNERS_STORAGE_KEY) || "null"
        );
        if (Array.isArray(saved) && saved.length > 0) {
          setBanners(saved);
          setActiveIndex(0);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener("banners-updated", handleStorageUpdate);
    return () => {
      active = false;
      window.removeEventListener("banners-updated", handleStorageUpdate);
    };
  }, []);

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 6800);
    return () => clearInterval(timer);
  }, [banners.length, isPaused]);

  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches?.[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e) => {
    const startX = touchStartXRef.current;
    const endX = e.changedTouches?.[0]?.clientX ?? null;
    if (startX !== null && endX !== null && Math.abs(startX - endX) > 45) {
      if (startX - endX > 0) {
        setActiveIndex((prev) => (prev + 1) % banners.length);
      } else {
        setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length);
      }
    }
    touchStartXRef.current = null;
    setTimeout(() => setIsPaused(false), 1800);
  };

  return (
    <HeroBannerView
      banners={banners}
      activeIndex={activeIndex}
      onPrev={() =>
        setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length)
      }
      onNext={() => setActiveIndex((prev) => (prev + 1) % banners.length)}
      onSelectIndex={setActiveIndex}
      onPauseChange={setIsPaused}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    />
  );
}
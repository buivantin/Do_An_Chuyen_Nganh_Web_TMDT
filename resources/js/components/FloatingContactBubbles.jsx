import React, { useEffect, useState } from "react";

const SOCIAL_CHANNELS = [
  {
    id: "zalo",
    label: "Chat Zalo tư vấn",
    shortLabel: "Zalo",
    href: "https://zalo.me/0900000000",
    bgClass: "bg-[#0068FF] hover:bg-[#0055D4]",
    ringClass: "bg-[#0068FF]/45",
    pulse: true,
    icon: (
      <span className="font-sans font-extrabold text-[11px] tracking-tighter text-white">
        Zalo
      </span>
    ),
  },
  {
    id: "facebook",
    label: "Fanpage Facebook",
    shortLabel: "Facebook",
    href: "https://facebook.com",
    bgClass: "bg-[#1877F2] hover:bg-[#1464CC]",
    ringClass: "bg-[#1877F2]/45",
    pulse: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
        <path d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.6c0-.9.3-1.6 1.6-1.6h1.7V4.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V22h3.4z" />
      </svg>
    ),
  },
  {
    id: "tiktok",
    label: "TikTok Review Sách",
    shortLabel: "TikTok",
    href: "https://tiktok.com",
    bgClass: "bg-[#141414] hover:bg-stone-800",
    ringClass: "bg-stone-700/35",
    pulse: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
        <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
      </svg>
    ),
  },
  {
    id: "instagram",
    label: "Instagram BookHouse",
    shortLabel: "Instagram",
    href: "https://instagram.com",
    bgClass: "bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
    ringClass: "bg-pink-500/35",
    pulse: false,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5 text-white"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: "hotline",
    label: "Hotline: 1900 6868",
    shortLabel: "Gọi ngay",
    href: "tel:19006868",
    bgClass: "bg-[#9A5B13] hover:bg-[#7D480D]",
    ringClass: "bg-[#9A5B13]/45",
    pulse: true,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-4 h-4 text-white"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
        />
      </svg>
    ),
  },
];

/**
 * DUMB COMPONENT: Bong bóng liên hệ với vòng nhấp nháy tròn chuẩn quanh từng icon
 */
export function FloatingContactBubblesView({
  channels = SOCIAL_CHANNELS,
  mobileExpanded = false,
  showBackToTop = false,
  onToggleMobile,
  onScrollTop,
}) {
  return (
    <>
      {/* 1. GIAO DIỆN PC */}
      <div className="hidden md:flex fixed right-5 bottom-6 z-40 flex-col items-center gap-3.5">
        {channels.map((item) => (
          <a
            key={item.id}
            href={item.href}
            target={item.href.startsWith("http") ? "_blank" : undefined}
            rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
            aria-label={item.label}
            className="group relative inline-flex items-center justify-center w-11 h-11 rounded-full"
          >
            {/* Tooltip tách riêng bằng absolute right-full để không làm giãn khung tròn */}
            <span className="absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-stone-900/95 text-white text-xs font-semibold whitespace-nowrap opacity-0 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shadow-md">
              {item.label}
            </span>

            {/* Vòng nhấp nháy tròn bao quanh đúng kích thước w-11 h-11 */}
            {item.pulse && (
              <span
                aria-hidden="true"
                className={`absolute inset-0 rounded-full animate-ping pointer-events-none ${item.ringClass}`}
                style={{ animationDuration: "2.2s" }}
              />
            )}

            {/* Icon tròn chính */}
            <span
              className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110 ${item.bgClass}`}
            >
              {item.icon}
            </span>
          </a>
        ))}

        {showBackToTop && (
          <button
            type="button"
            onClick={onScrollTop}
            title="Lên đầu trang"
            aria-label="Lên đầu trang"
            className="w-11 h-11 rounded-full bg-white hover:bg-[#FAF8F5] border border-stone-300 text-stone-800 shadow-md flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
          >
            &uarr;
          </button>
        )}
      </div>

      {/* 2. GIAO DIỆN MOBILE */}
      <div className="md:hidden fixed right-3.5 bottom-4 z-40 flex flex-col items-end gap-2.5">
        {mobileExpanded && (
          <div className="flex flex-col items-end gap-2 mb-1">
            {channels.map((item) => (
              <a
                key={item.id}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  item.href.startsWith("http") ? "noopener noreferrer" : undefined
                }
                className="flex items-center gap-2 bg-white/95 backdrop-blur-md border border-stone-200 rounded-full pl-3 pr-1.5 py-1 shadow-lg"
              >
                <span className="text-xs font-bold text-stone-800">
                  {item.shortLabel}
                </span>
                <span className="relative inline-flex w-9 h-9 rounded-full items-center justify-center shrink-0">
                  {item.pulse && (
                    <span
                      aria-hidden="true"
                      className={`absolute inset-0 rounded-full animate-ping pointer-events-none ${item.ringClass}`}
                      style={{ animationDuration: "2.2s" }}
                    />
                  )}
                  <span
                    className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center ${item.bgClass}`}
                  >
                    {item.icon}
                  </span>
                </span>
              </a>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          {showBackToTop && (
            <button
              type="button"
              onClick={onScrollTop}
              aria-label="Lên đầu trang"
              className="w-10 h-10 rounded-full bg-white/95 border border-stone-300 text-stone-800 shadow-md flex items-center justify-center text-sm font-bold"
            >
              &uarr;
            </button>
          )}

          <button
            type="button"
            onClick={onToggleMobile}
            aria-expanded={mobileExpanded}
            aria-label="Liên hệ mạng xã hội"
            className="relative inline-flex w-12 h-12 rounded-full bg-[#9A5B13] text-white shadow-xl items-center justify-center cursor-pointer"
          >
            {!mobileExpanded && (
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[#9A5B13]/45 animate-ping pointer-events-none"
                style={{ animationDuration: "2.2s" }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center">
              {mobileExpanded ? (
                <span className="text-xl font-bold leading-none">&times;</span>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
              )}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * SMART COMPONENT: Quản lý trạng thái mở menu mobile & vị trí cuộn trang
 */
export default function FloatingContactBubbles() {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 360);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <FloatingContactBubblesView
      channels={SOCIAL_CHANNELS}
      mobileExpanded={mobileExpanded}
      showBackToTop={showBackToTop}
      onToggleMobile={() => setMobileExpanded((v) => !v)}
      onScrollTop={handleScrollTop}
    />
  );
}
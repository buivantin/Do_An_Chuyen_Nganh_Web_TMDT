import React, { useEffect, useRef } from "react";

/**
 * Thanh hành động cố định ở đáy màn hình Mobile (< lg)
 * Tự động đẩy bong bóng liên hệ/chat fixed ở góc dưới phải lên trên thanh này để không bị đè.
 */
export default function MobileActionBar({ children, className = "" }) {
  const barRef = useRef(null);

  useEffect(() => {
    const adjustedElements = new Map();

    const restoreAll = () => {
      adjustedElements.forEach((prevBottom, el) => {
        if (!el || !el.isConnected) return;
        if (prevBottom) {
          el.style.bottom = prevBottom;
        } else {
          el.style.removeProperty("bottom");
        }
      });
      adjustedElements.clear();
    };

    const adjustFloatingBubbles = () => {
      const barEl = barRef.current;
      if (!barEl || window.innerWidth >= 1024) {
        restoreAll();
        return;
      }

      const barRect = barEl.getBoundingClientRect();
      if (barRect.height <= 0) {
        restoreAll();
        return;
      }

      const targetBottom = Math.round(barRect.height + 14);

      const candidates = document.querySelectorAll("button, a, div");
      candidates.forEach((el) => {
        if (
          el === barEl ||
          barEl.contains(el) ||
          el.closest("[data-mobile-bottom-bar]") ||
          el.getAttribute("role") === "dialog"
        ) {
          return;
        }

        const style = window.getComputedStyle(el);
        if (style.position !== "fixed") return;

        const rect = el.getBoundingClientRect();
        const isFloatingBubble =
          rect.width >= 32 &&
          rect.width <= 120 &&
          rect.height >= 32 &&
          rect.height <= 120;
        const isAtBottomRight =
          window.innerHeight - rect.bottom < targetBottom &&
          window.innerWidth - rect.right < 64;

        if (isFloatingBubble && isAtBottomRight) {
          if (!adjustedElements.has(el)) {
            adjustedElements.set(el, el.style.bottom || "");
          }
          el.style.setProperty("bottom", `${targetBottom}px`, "important");
        }
      });
    };

    adjustFloatingBubbles();
    const rafId = requestAnimationFrame(adjustFloatingBubbles);
    const timerId = setTimeout(adjustFloatingBubbles, 250);

    const observer =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(adjustFloatingBubbles)
        : null;
    observer?.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("resize", adjustFloatingBubbles);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      observer?.disconnect();
      window.removeEventListener("resize", adjustFloatingBubbles);
      restoreAll();
    };
  }, []);

  return (
    <div
      ref={barRef}
      data-mobile-bottom-bar="true"
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.07)] ${className}`}
    >
      {children}
    </div>
  );
}
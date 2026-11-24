import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

/**
 * DUMB COMPONENT: Thanh điều hướng cố định (fixed) responsive riêng Mobile & PC
 */
export function NavbarView({
  pathname = "/",
  activeCategoryId = null,
  visibleCategories = [],
  overflowCategories = [],
  dropdownOpen = false,
  onToggleDropdown,
  dropdownRef,
  navRef,
  topOffset = 0,
  spacerHeight = 45,
}) {
  const isOverflowActive = overflowCategories.some(
    (cat) =>
      pathname === "/products" && String(activeCategoryId) === String(cat.id)
  );

  return (
    <>
      <nav
        id="bookhouse-navbar"
        ref={navRef}
        style={{ top: `${topOffset}px` }}
        className="fixed left-0 right-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/80 shadow-2xs"
      >
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4">
          <ul className="flex items-center justify-between sm:justify-start gap-2 sm:gap-6 lg:gap-8 py-2.5 sm:py-3 text-[11px] sm:text-sm font-medium text-stone-700">
            <li className="shrink-0">
              <a
                href="/"
                className={`transition-colors ${
                  pathname === "/"
                    ? "text-[#9A5B13] font-bold"
                    : "hover:text-[#9A5B13]"
                }`}
              >
                Trang chủ
              </a>
            </li>

            <li className="shrink-0">
              <a
                href="/products"
                className={`transition-colors ${
                  pathname === "/products" && !activeCategoryId
                    ? "text-[#9A5B13] font-bold"
                    : "hover:text-[#9A5B13]"
                }`}
              >
                <span className="sm:hidden">Sản phẩm</span>
                <span className="hidden sm:inline">Danh sách sản phẩm</span>
              </a>
            </li>

            {visibleCategories.map((cat) => {
              const isActive =
                pathname === "/products" &&
                String(activeCategoryId) === String(cat.id);

              return (
                <li
                  key={cat.id}
                  className="min-w-0 max-w-[74px] sm:max-w-none truncate"
                >
                  <a
                    href={`/products?category_id=${cat.id}`}
                    title={cat.name}
                    className={`transition-colors ${
                      isActive
                        ? "text-[#9A5B13] font-bold"
                        : "hover:text-[#9A5B13]"
                    }`}
                  >
                    {cat.name}
                  </a>
                </li>
              );
            })}

            {overflowCategories.length > 0 && (
              <li ref={dropdownRef} className="relative shrink-0">
                <button
                  type="button"
                  onClick={onToggleDropdown}
                  aria-expanded={dropdownOpen}
                  className={`inline-flex items-center gap-0.5 sm:gap-1 transition-colors cursor-pointer ${
                    isOverflowActive || dropdownOpen
                      ? "text-[#9A5B13] font-bold"
                      : "hover:text-[#9A5B13]"
                  }`}
                >
                  <span className="hidden sm:inline">Danh mục khác</span>
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 sm:left-0 mt-2.5 w-56 rounded-2xl bg-white border border-stone-200/90 shadow-xl py-2 z-50">
                    <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                      Danh mục khác (A - Z)
                    </div>
                    <div className="max-h-72 overflow-y-auto py-1">
                      {overflowCategories.map((cat) => {
                        const isCatActive =
                          pathname === "/products" &&
                          String(activeCategoryId) === String(cat.id);
                        return (
                          <a
                            key={cat.id}
                            href={`/products?category_id=${cat.id}`}
                            className={`block px-3.5 py-2 text-xs sm:text-sm transition ${
                              isCatActive
                                ? "bg-[#FAF6F0] text-[#9A5B13] font-bold"
                                : "text-stone-700 hover:bg-[#FAF8F5] hover:text-[#9A5B13]"
                            }`}
                          >
                            {cat.name}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* Khoảng đệm giữ chỗ để nội dung bên dưới không bị Navbar fixed che khuất */}
      <div style={{ height: `${spacerHeight}px` }} aria-hidden="true" />
    </>
  );
}

/**
 * SMART COMPONENT: Tải danh mục A-Z, tự đo vị trí Header & thông báo layout cập nhật
 */
export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [topOffset, setTopOffset] = useState(0);
  const [spacerHeight, setSpacerHeight] = useState(44);

  const dropdownRef = useRef(null);
  const navRef = useRef(null);

  const pathname = window.location.pathname;
  const activeCategoryId = new URLSearchParams(window.location.search).get(
    "category_id"
  );

  useEffect(() => {
    const headerEl =
      document.getElementById("bookhouse-header") ||
      document.querySelector("header");

    const syncPositions = () => {
      let hHeight = 0;
      if (headerEl) {
        headerEl.style.position = "fixed";
        headerEl.style.top = "0px";
        headerEl.style.left = "0px";
        headerEl.style.right = "0px";
        headerEl.style.zIndex = "40";
        hHeight = Math.round(headerEl.getBoundingClientRect().height);
      }

      const nHeight = navRef.current
        ? Math.round(navRef.current.getBoundingClientRect().height)
        : 42;
      const totalBottom = hHeight + nHeight;

      setTopOffset(hHeight);
      setSpacerHeight(totalBottom);

      if (navRef.current) {
        navRef.current.dataset.bottom = String(totalBottom);
      }

      window.dispatchEvent(
        new CustomEvent("bookhouse-layout-updated", {
          detail: {
            headerHeight: hHeight,
            navHeight: nHeight,
            bottom: totalBottom,
          },
        })
      );
    };

    syncPositions();
    const rafId = requestAnimationFrame(syncPositions);

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(syncPositions)
        : null;
    if (observer) {
      if (headerEl) observer.observe(headerEl);
      if (navRef.current) observer.observe(navRef.current);
    }
    window.addEventListener("resize", syncPositions);

    return () => {
      cancelAnimationFrame(rafId);
      observer?.disconnect();
      window.removeEventListener("resize", syncPositions);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    axios
      .get("/api/categories")
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const activeCategories = raw.filter(
          (cat) => !cat.status || cat.status === "active"
        );
        setCategories(activeCategories);
      })
      .catch((err) => {
        console.error("Lỗi tải menu danh mục:", err);
      });
  }, []);

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""), "vi")
      ),
    [categories]
  );

  const limit = isDesktop ? 4 : 2;
  const visibleCategories = sortedCategories.slice(0, limit);
  const overflowCategories = sortedCategories.slice(limit);

  return (
    <NavbarView
      pathname={pathname}
      activeCategoryId={activeCategoryId}
      visibleCategories={visibleCategories}
      overflowCategories={overflowCategories}
      dropdownOpen={dropdownOpen}
      onToggleDropdown={() => setDropdownOpen((v) => !v)}
      dropdownRef={dropdownRef}
      navRef={navRef}
      topOffset={topOffset}
      spacerHeight={spacerHeight}
    />
  );
}
import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { resolveBookImageUrl } from "./ProductCard";

function resolveAssetUrl(path) {
  if (!path) return null;
  const raw = String(path).trim();
  if (!raw) return null;
  if (
    /^https?:\/\//i.test(raw) ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:")
  ) {
    return raw;
  }
  const clean = raw.replace(/^\/+/, "");
  if (clean.startsWith("public/")) return `/storage/${clean.slice(7)}`;
  if (clean.startsWith("storage/") || clean.startsWith("imgs/")) {
    return `/${clean}`;
  }
  return `/storage/${clean}`;
}

function parseCartPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return { count: 0, total: 0 };
  }

  const root =
    payload.data && !Array.isArray(payload.data) ? payload.data : payload;
  const items =
    root.items ||
    root.cart_items ||
    root.cart?.items ||
    root.cart?.cart_items ||
    (Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload)
      ? payload
      : []);

  const list = Array.isArray(items) ? items : [];

  const computedCount = list.reduce(
    (sum, item) => sum + Number(item.quantity ?? item.qty ?? 1),
    0
  );

  const computedTotal = list.reduce((sum, item) => {
    const qty = Number(item.quantity ?? item.qty ?? 1);
    if (item.subtotal !== undefined && item.subtotal !== null) {
      return sum + Number(item.subtotal);
    }
    if (item.line_total !== undefined && item.line_total !== null) {
      return sum + Number(item.line_total);
    }

    const p = item.product || {};
    const basePrice = Number(
      item.unit_price ??
        item.price ??
        p.final_price ??
        p.sale_price ??
        p.price ??
        0
    );
    const discount = Number(p.discount ?? 0);
    const effectivePrice =
      item.unit_price !== undefined ||
      item.price !== undefined ||
      p.final_price !== undefined
        ? basePrice
        : discount > 0 && discount < 100
        ? Math.round(basePrice * (1 - discount / 100))
        : basePrice;

    return sum + effectivePrice * qty;
  }, 0);

  const count = Number(
    root.total_quantity ?? root.total_items ?? root.count ?? computedCount
  );
  const total = Number(
    root.total_amount ??
      root.total_price ??
      root.subtotal ??
      root.total ??
      computedTotal
  );

  return {
    count: Number.isFinite(count) ? count : computedCount,
    total: Number.isFinite(total) ? total : computedTotal,
  };
}

export default function Header({ onOpenAuthModal, onLogout }) {
  const { user, memberTier, openLoginModal, openRegisterModal, logout } =
    useAuth();

  const [cartSummary, setCartSummary] = useState({ count: 0, total: 0 });
  const [searchTerm, setSearchTerm] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("keyword") || params.get("search") || params.get("q") || "";
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const searchBoxRef = useRef(null);

  const fetchCart = useCallback(async (event) => {
    if (event?.detail && typeof event.detail === "object") {
      if (
        event.detail.count !== undefined ||
        event.detail.total !== undefined ||
        event.detail.items !== undefined
      ) {
        setCartSummary(parseCartPayload(event.detail));
      }
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setCartSummary({ count: 0, total: 0 });
      return;
    }

    try {
      const res = await axios.get("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      setCartSummary(parseCartPayload(res.data));
    } catch {
      // Bỏ qua nếu chưa có giỏ hàng
    }
  }, []);

  useEffect(() => {
    fetchCart();

    const handleCartChange = (e) => fetchCart(e);
    window.addEventListener("cart-updated", handleCartChange);
    window.addEventListener("cartUpdated", handleCartChange);
    window.addEventListener("storage", handleCartChange);

    return () => {
      window.removeEventListener("cart-updated", handleCartChange);
      window.removeEventListener("cartUpdated", handleCartChange);
      window.removeEventListener("storage", handleCartChange);
    };
  }, [user?.id, fetchCart]);

  // Đồng bộ khi người dùng bấm "Đặt lại tất cả" hoặc xóa chip từ khóa ở ProductList
  useEffect(() => {
    const handleClearSearch = () => setSearchTerm("");
    window.addEventListener("bookhouse:search-clear", handleClearSearch);
    return () =>
      window.removeEventListener("bookhouse:search-clear", handleClearSearch);
  }, []);

  // Gợi ý tìm kiếm nhanh khi gõ từ khóa
  useEffect(() => {
    const q = searchTerm.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await axios.get("/api/products", {
          params: { search: q, keyword: q, per_page: 6 },
          headers: { Accept: "application/json" },
        });
        if (cancelled) return;

        const rawList = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data?.data?.data)
          ? res.data.data.data
          : [];

        setSuggestions(rawList.slice(0, 6));
        setShowSuggestions(true);
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const avatarSrc = resolveAssetUrl(user?.avatar || user?.image_path);
  const avatarInitial = (user?.username || user?.name || user?.email || "U")
    .charAt(0)
    .toUpperCase();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    const q = searchTerm.trim();
    const cleanPath = window.location.pathname.replace(/\/+$/, "") || "/";

    // Nếu đang ở sẵn trang /products thì lọc trực tiếp mà không reload trang
    if (cleanPath === "/products") {
      window.dispatchEvent(
        new CustomEvent("bookhouse:search", { detail: { keyword: q } })
      );
      return;
    }

    window.location.href = q
      ? `/products?keyword=${encodeURIComponent(q)}`
      : "/products";
  };

  const handleOpenAuth = (mode) => {
    if (typeof onOpenAuthModal === "function") {
      onOpenAuthModal(mode);
    } else if (mode === "register") {
      openRegisterModal();
    } else {
      openLoginModal();
    }
  };

  const handleLogoutClick = () => {
    setUserMenuOpen(false);
    if (typeof onLogout === "function") {
      onLogout();
    } else {
      logout();
    }
  };

  return (
    <header
      id="bookhouse-header"
      className="bg-white/95 backdrop-blur-md border-b border-stone-200/80 relative z-40"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-6">
          <a href="/" className="shrink-0 flex items-baseline gap-1.5">
            <span className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight">
              Mọt Sách
            </span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-[#9A5B13]">
              BookHouse
            </span>
          </a>

          {/* Thanh tìm kiếm + Dropdown gợi ý nhanh */}
          <div ref={searchBoxRef} className="relative flex-1 max-w-xl">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center bg-[#F5F2EE] border border-stone-200/80 focus-within:border-[#9A5B13] focus-within:bg-white rounded-full p-1 transition"
            >
              <input
                type="text"
                value={searchTerm}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm tựa sách, tác giả, dịch giả, mã ISBN..."
                className="flex-1 min-w-0 bg-transparent px-3 sm:px-4 py-1.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSuggestions([]);
                    setShowSuggestions(false);
                    if (
                      (window.location.pathname.replace(/\/+$/, "") || "/") ===
                      "/products"
                    ) {
                      window.dispatchEvent(
                        new CustomEvent("bookhouse:search", {
                          detail: { keyword: "" },
                        })
                      );
                    }
                  }}
                  aria-label="Xóa từ khóa"
                  className="px-2 text-stone-400 hover:text-stone-700 text-sm cursor-pointer"
                >
                  &times;
                </button>
              )}
              <button
                type="submit"
                aria-label="Tìm kiếm"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#141414] hover:bg-stone-800 text-white flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                </svg>
              </button>
            </form>

            {showSuggestions && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden z-50">
                {searching ? (
                  <div className="px-4 py-3 text-xs text-stone-500">
                    Đang tìm sách phù hợp...
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-stone-500">
                    Không tìm thấy sách khớp với "{searchTerm.trim()}".
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
                    {suggestions.map((book) => {
                      const img = resolveBookImageUrl(
                        book.image_path || book.image
                      );
                      const basePrice = Number(book.price || 0);
                      const discount = Math.min(
                        Math.max(Number(book.discount || 0), 0),
                        100
                      );
                      const finalPrice =
                        discount > 0
                          ? Math.round(basePrice * (1 - discount / 100))
                          : basePrice;

                      return (
                        <a
                          key={book.id}
                          href={`/products/${book.id}`}
                          className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-[#FAF8F5] transition"
                        >
                          <img
                            src={img}
                            alt={book.name || book.title}
                            className="w-9 h-12 object-contain rounded border border-stone-200 shrink-0 bg-[#F7F3EC] p-0.5"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                              {book.name || book.title}
                            </div>
                            <div className="text-[11px] text-stone-500 truncate">
                              {book.author || "Đang cập nhật"}
                            </div>
                          </div>
                          <div className="text-xs font-bold text-[#9A5B13] shrink-0">
                            {finalPrice.toLocaleString("vi-VN")}đ
                          </div>
                        </a>
                      );
                    })}
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="w-full py-2.5 text-center text-xs font-bold text-[#9A5B13] bg-[#FAF8F5] hover:bg-[#F5EDE2] transition cursor-pointer"
                    >
                      Xem tất cả kết quả cho "{searchTerm.trim()}" &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            {/* Nút Giỏ hàng */}
            <a
              href="/cart"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F5EDE2] border border-stone-200/80 transition"
            >
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  className="w-5 h-5 text-stone-800"
                >
                  <path d="M6 7h12l1 13H5L6 7Z" strokeLinejoin="round" />
                  <path d="M9 7V5a3 3 0 0 1 6 0v2" strokeLinecap="round" />
                </svg>
                <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[#9A5B13] text-white text-[10px] font-bold flex items-center justify-center">
                  {cartSummary.count}
                </span>
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-[10px] text-stone-500">Giỏ hàng</div>
                <div className="text-xs font-bold text-stone-900">
                  {cartSummary.total.toLocaleString("vi-VN")} đ
                </div>
              </div>
            </a>

            {/* Khu vực Tài khoản */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-[#E5D5BE] bg-[#141414] text-white font-serif font-bold text-sm cursor-pointer focus:outline-none"
                  title={user.username || user.email}
                >
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={user.username || "Avatar"}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span>{avatarInitial}</span>
                  )}
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[11px] shadow-2xs">
                    {memberTier.icon}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2.5 w-64 bg-white border border-stone-200/90 rounded-2xl shadow-xl py-3 px-4 z-50 space-y-2.5">
                    <div className="border-b border-stone-100 pb-2.5">
                      <div className="text-xs font-bold text-stone-900 truncate">
                        {user.username || user.name || "Thành viên BookHouse"}
                      </div>
                      <div className="text-[11px] text-stone-400 truncate">
                        {user.email}
                      </div>

                      <div className="mt-2">
                        <div className="text-[10px] text-stone-400 mb-1">
                          Hạng thành viên
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-xs font-bold ${memberTier.badgeClass}`}
                        >
                          <span>{memberTier.icon}</span>
                          <span>{memberTier.name}</span>
                        </span>
                        <p className="text-[11px] text-stone-400 mt-1 leading-snug">
                          {memberTier.hint}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs sm:text-sm">
                      <a
                        href="/account?tab=profile"
                        className="block px-2 py-1.5 rounded-lg text-stone-700 hover:bg-[#FAF8F5] hover:text-[#9A5B13] font-medium transition"
                      >
                        Tài khoản của tôi
                      </a>
                      <a
                        href="/account?tab=orders"
                        className="block px-2 py-1.5 rounded-lg text-stone-700 hover:bg-[#FAF8F5] hover:text-[#9A5B13] font-medium transition"
                      >
                        Đơn hàng của tôi
                      </a>
                      {user.role === "admin" && (
                        <a
                          href="/admin"
                          className="block px-2 py-1.5 rounded-lg text-[#9A5B13] hover:bg-[#FAF8F5] font-semibold transition"
                        >
                          Trang quản trị
                        </a>
                      )}
                    </div>

                    <div className="border-t border-stone-100 pt-2">
                      <button
                        type="button"
                        onClick={handleLogoutClick}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => handleOpenAuth("login")}
                  className="px-3.5 py-2 rounded-xl text-stone-700 hover:text-[#9A5B13] transition cursor-pointer"
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAuth("register")}
                  className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-stone-800 text-white transition cursor-pointer"
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
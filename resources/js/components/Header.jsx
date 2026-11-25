import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { resolveMemberTier } from "../data/homeMockData";
import AuthModal from "./AuthModal";
import ConfirmModal from "./ConfirmModal";

function resolveAvatarUrl(path) {
  if (!path) return null;
  const raw = String(path).trim();
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  const clean = raw.replace(/^\/+/, "");
  if (clean.startsWith("public/")) return `/storage/${clean.slice(7)}`;
  if (clean.startsWith("storage/") || clean.startsWith("imgs/")) return `/${clean}`;
  return `/storage/${clean}`;
}

/**
 * DUMB COMPONENT: Header Responsive riêng Mobile & PC + Avatar khung thành viên
 */
export function HeaderView({
  keyword = "",
  onKeywordChange,
  onSearchSubmit,
  mobileSearchOpen = false,
  onToggleMobileSearch,
  cartCount = 0,
  cartTotal = 0,
  user = null,
  tierInfo,
  menuOpen = false,
  onToggleMenu,
  onLogout,
  onOpenAuthModal,
  userMenuRef,
}) {
  const avatarUrl = resolveAvatarUrl(user?.image_path || user?.avatar);
  const initialChar = (user?.username || user?.name || user?.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();
  const isAdmin = user?.role === "admin";

  return (
    <header
      id="bookhouse-header"
      className="bg-white/95 backdrop-blur-md border-b border-stone-200/80 relative z-40"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3.5 flex items-center justify-between gap-2.5 sm:gap-6">
        {/* Logo thương hiệu */}
        <a
          href="/"
          className="font-serif text-base sm:text-2xl font-bold text-[#1A1A1A] tracking-tight shrink-0"
        >
          Mọt Sách <span className="text-[#9A5B13]">BookHouse</span>
        </a>

        {/* Thanh tìm kiếm PC */}
        <form
          onSubmit={onSearchSubmit}
          className="hidden md:flex flex-1 max-w-xl items-center bg-[#F5F2EE] border border-stone-200/80 focus-within:border-[#9A5B13] focus-within:bg-white rounded-full overflow-hidden transition"
        >
          <input
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange?.(e.target.value)}
            placeholder="Tìm kiếm tựa sách, tác giả, dịch giả, mã ISBN..."
            className="w-full bg-transparent px-4 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Tìm kiếm"
            className="bg-[#141414] hover:bg-stone-800 text-white px-4 py-2.5 flex items-center justify-center transition cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
            </svg>
          </button>
        </form>

        {/* Cụm hành động bên phải */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Nút bật/tắt ô tìm kiếm trên Mobile */}
          <button
            type="button"
            onClick={onToggleMobileSearch}
            aria-label="Tìm kiếm sách"
            className="md:hidden w-9 h-9 rounded-xl bg-[#FAF8F5] border border-stone-200/80 text-stone-700 flex items-center justify-center cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
            </svg>
          </button>

          {/* Giỏ hàng */}
          <a
            href="/cart"
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-2xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-stone-200/80 transition"
          >
            <div className="relative text-stone-800">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                className="w-5 h-5"
              >
                <path d="M6 7h12l1 13H5L6 7Z" strokeLinejoin="round" />
                <path d="M9 7V5a3 3 0 0 1 6 0v2" strokeLinecap="round" />
              </svg>
              <span className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 rounded-full bg-[#9A5B13] text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-[10px] text-stone-500 font-medium">
                Giỏ hàng
              </div>
              <div className="text-xs font-bold text-stone-900">
                {Number(cartTotal || 0).toLocaleString("vi-VN")} đ
              </div>
            </div>
          </a>

          {/* User: Chỉ hiển thị Avatar + Khung thành viên */}
          {user ? (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={onToggleMenu}
                aria-expanded={menuOpen}
                title={`${user.username || user.name} — ${tierInfo.label}`}
                className="relative group flex items-center justify-center rounded-full focus:outline-none cursor-pointer"
              >
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-[#141414] text-white flex items-center justify-center transition-transform group-hover:scale-105 ${tierInfo.ringClass}`}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user.username || "Avatar"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-serif text-sm sm:text-base font-bold">
                      {initialChar}
                    </span>
                  )}
                </div>

                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] border-2 border-white shadow-xs ${tierInfo.badgeBg}`}
                >
                  {tierInfo.icon}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-white border border-stone-200/90 shadow-xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-stone-100 space-y-1.5">
                    <div className="text-[11px] text-stone-500">
                      Hạng thành viên
                    </div>
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${tierInfo.pillBg}`}
                    >
                      <span>{tierInfo.icon}</span>
                      <span>{tierInfo.label}</span>
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {tierInfo.nextHint}
                    </div>
                  </div>

                  <div className="py-1.5">
                    <a
                      href="/account"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm font-medium text-stone-700 hover:bg-[#FAF8F5] hover:text-[#9A5B13] transition"
                    >
                      <span>Tài khoản của tôi</span>
                    </a>

                    <a
                      href="/account?tab=orders"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm font-medium text-stone-700 hover:bg-[#FAF8F5] hover:text-[#9A5B13] transition"
                    >
                      <span>Đơn hàng của tôi</span>
                    </a>

                    {isAdmin && (
                      <a
                        href="/admin"
                        className="flex items-center justify-between px-4 py-2 text-xs sm:text-sm font-bold text-[#9A5B13] bg-[#FAF6F0] hover:bg-[#F3E8D8] transition my-1"
                      >
                        <span>Quản lý cửa hàng</span>
                        <span>&rarr;</span>
                      </a>
                    )}
                  </div>

                  <div className="border-t border-stone-100 pt-1.5 px-2">
                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuthModal?.("login")}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#141414] hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>

      {/* Thanh tìm kiếm mở rộng riêng cho Mobile */}
      {mobileSearchOpen && (
        <form
          onSubmit={onSearchSubmit}
          className="md:hidden px-3 pb-2.5 flex items-center gap-2"
        >
          <input
            type="text"
            autoFocus
            value={keyword}
            onChange={(e) => onKeywordChange?.(e.target.value)}
            placeholder="Tìm tựa sách, tác giả..."
            className="flex-1 bg-[#F5F2EE] border border-stone-200 focus:border-[#9A5B13] focus:bg-white rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-[#141414] text-white text-xs font-bold"
          >
            Tìm
          </button>
        </form>
      )}
    </header>
  );
}

/**
 * SMART COMPONENT: Quản lý dữ liệu giỏ hàng (đồng bộ real-time nhiều tab/trình duyệt), tìm kiếm, user
 */
export default function Header({ onOpenAuthModal }) {
  const [keyword, setKeyword] = useState(
    () => new URLSearchParams(window.location.search).get("keyword") || ""
  );
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });
  const [cartSummary, setCartSummary] = useState({ count: 0, total: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [authModalState, setAuthModalState] = useState({
    open: false,
    mode: "login",
  });
  const userMenuRef = useRef(null);

  const openLoginModal = (mode = "login") => {
    if (typeof onOpenAuthModal === "function") {
      onOpenAuthModal(mode);
      return;
    }
    setAuthModalState({ open: true, mode });
  };

  const loadCartSummary = async () => {
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
      const raw =
        res.data?.data?.items ??
        res.data?.data ??
        res.data?.items ??
        res.data ??
        [];
      const list = Array.isArray(raw) ? raw : [];
      const count = list.reduce(
        (s, it) => s + Math.max(0, Number(it.quantity || 1)),
        0
      );
      const total = list.reduce(
        (s, it) =>
          s +
          Number(it.price ?? it.product?.price ?? 0) *
            Math.max(0, Number(it.quantity || 1)),
        0
      );
      setCartSummary({ count, total });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadCartSummary();

    const handleCartUpdated = () => {
      loadCartSummary();
      try {
        localStorage.setItem("bookhouse_cart_sync", String(Date.now()));
      } catch {
        // ignore
      }
    };

    const handleUserUpdated = (e) => {
      if (e.detail) {
        setUser(e.detail);
      } else {
        try {
          setUser(JSON.parse(localStorage.getItem("user") || "null"));
        } catch {
          setUser(null);
        }
      }
    };

    // Đồng bộ giỏ hàng ngay lập tức khi tab khác cập nhật localStorage
    const handleStorageChange = (e) => {
      if (e.key === "bookhouse_cart_sync") {
        loadCartSummary();
      }
    };

    // Đồng bộ ngay khi chuyển từ trình duyệt hoặc cửa sổ khác quay lại tab này
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadCartSummary();
      }
    };

    const handleOpenAuthEvent = (e) => {
      const mode = e?.detail?.mode === "register" ? "register" : "login";
      openLoginModal(mode);
    };

    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    // Đồng bộ định kỳ mỗi 8 giây cho trường hợp mở 2 trình duyệt khác nhau (Chrome & Edge)
    const syncInterval = setInterval(() => {
      if (document.visibilityState === "visible" && localStorage.getItem("token")) {
        loadCartSummary();
      }
    }, 8000);

    window.addEventListener("cart-updated", handleCartUpdated);
    window.addEventListener("user-updated", handleUserUpdated);
    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("open-auth-modal", handleOpenAuthEvent);
    window.addEventListener("open-login-modal", handleOpenAuthEvent);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener("cart-updated", handleCartUpdated);
      window.removeEventListener("user-updated", handleUserUpdated);
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("open-auth-modal", handleOpenAuthEvent);
      window.removeEventListener("open-login-modal", handleOpenAuthEvent);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = keyword.trim();
    window.location.href = q
      ? `/products?keyword=${encodeURIComponent(q)}`
      : "/products";
  };

  const handleRequestLogout = () => {
    setMenuOpen(false);
    setLogoutConfirmOpen(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setLogoutConfirmOpen(false);
    window.location.href = "/";
  };

  return (
    <>
      <HeaderView
        keyword={keyword}
        onKeywordChange={setKeyword}
        onSearchSubmit={handleSearchSubmit}
        mobileSearchOpen={mobileSearchOpen}
        onToggleMobileSearch={() => setMobileSearchOpen((v) => !v)}
        cartCount={cartSummary.count}
        cartTotal={cartSummary.total}
        user={user}
        tierInfo={resolveMemberTier(user)}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((v) => !v)}
        onLogout={handleRequestLogout}
        onOpenAuthModal={openLoginModal}
        userMenuRef={userMenuRef}
      />

      <AuthModal
        open={authModalState.open}
        initialMode={authModalState.mode}
        onClose={() => setAuthModalState((prev) => ({ ...prev, open: false }))}
        onSuccess={(loggedInUser) => {
          if (loggedInUser) setUser(loggedInUser);
        }}
      />

      <ConfirmModal
        open={logoutConfirmOpen}
        variant="danger"
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản hiện tại không?"
        detailText={user?.email || user?.username || ""}
        confirmText="Đăng xuất"
        cancelText="Ở lại"
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </>
  );
}
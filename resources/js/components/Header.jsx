import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

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

export default function Header() {
  const { user, memberTier, logout } = useAuth();

  const [cartSummary, setCartSummary] = useState({ count: 0, total: 0 });
  const [searchTerm, setSearchTerm] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("search") || "";
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Đồng bộ giỏ hàng
  useEffect(() => {
    const fetchCart = async () => {
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
        const items =
          res.data?.items ||
          res.data?.data?.items ||
          res.data?.cart?.items ||
          [];
        const list = Array.isArray(items) ? items : [];
        const count = list.reduce(
          (sum, item) => sum + Number(item.quantity || 1),
          0
        );
        const total = list.reduce((sum, item) => {
          const price = Number(item.price ?? item.product?.price ?? 0);
          return sum + price * Number(item.quantity || 1);
        }, 0);
        setCartSummary({ count, total });
      } catch {
        // Bỏ qua nếu chưa có giỏ hàng
      }
    };

    fetchCart();
    window.addEventListener("cart-updated", fetchCart);
    return () => window.removeEventListener("cart-updated", fetchCart);
  }, [user?.id]);

  // Đóng dropdown tài khoản khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
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
    const q = searchTerm.trim();
    window.location.href = q
      ? `/products?search=${encodeURIComponent(q)}`
      : "/products";
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-stone-200/80">
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

          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl items-center bg-[#F5F2EE] border border-stone-200/80 focus-within:border-[#9A5B13] focus-within:bg-white rounded-full p-1 transition"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm tựa sách, tác giả, dịch giả, mã ISBN..."
              className="flex-1 bg-transparent px-4 py-1.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Tìm kiếm"
              className="w-9 h-9 rounded-full bg-[#141414] hover:bg-stone-800 text-white flex items-center justify-center transition cursor-pointer shrink-0"
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
                        onClick={logout}
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
                <a
                  href="/login"
                  className="px-3.5 py-2 rounded-xl text-stone-700 hover:text-[#9A5B13] transition"
                >
                  Đăng nhập
                </a>
                <a
                  href="/register"
                  className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-stone-800 text-white transition"
                >
                  Đăng ký
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
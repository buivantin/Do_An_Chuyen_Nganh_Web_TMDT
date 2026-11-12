import React, { useState } from 'react';

export default function Header({ cartCount = 0, cartTotal = 0, user = null, onLogout, onOpenLogin }) {
  const [openMenu, setOpenMenu] = useState(false);

  const handleLogout = () => {
    setOpenMenu(false);
    onLogout?.();
  };

  return (
    <header className="bg-[#FAF8F5] text-stone-900">
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-2 flex flex-wrap items-center justify-between gap-4">
        {/* Tên thương hiệu */}
        <a
          href="/"
          className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A] shrink-0"
        >
          Mọt Sách BookHouse
        </a>

        {/* Thanh tìm kiếm */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="order-3 md:order-2 w-full md:flex-1 md:max-w-xl bg-white border border-stone-200/90 rounded-xl p-1.5 pl-4 flex items-center shadow-2xs"
        >
          <input
            type="text"
            placeholder="Tìm kiếm tựa sách, tác giả, dịch giả, mã ISBN..."
            className="w-full text-sm text-stone-700 placeholder-stone-400 focus:outline-none bg-transparent"
          />
          <button
            type="submit"
            aria-label="Tìm kiếm"
            className="bg-[#141414] hover:bg-stone-800 text-white p-2.5 rounded-lg shrink-0 transition cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
          </button>
        </form>

        {/* Giỏ hàng & Tài khoản */}
        <div className="order-2 md:order-3 flex items-center gap-4 sm:gap-5 shrink-0">
          {/* Giỏ hàng */}
          <a
            href="/cart"
            className="bg-[#F3EFEA] hover:bg-[#EBE5DD] rounded-xl px-3.5 py-2 flex items-center gap-3 transition"
          >
            <div className="relative text-stone-800">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                <path d="M6 7h12l1 13H5L6 7Z" strokeLinejoin="round" />
                <path d="M9 7V5a3 3 0 0 1 6 0v2" strokeLinecap="round" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#9A5B13] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="leading-tight">
              <div className="text-[11px] text-stone-500">Giỏ hàng</div>
              <div className="text-sm font-bold text-stone-900">
                {cartCount > 0 ? `${cartTotal.toLocaleString('vi-VN')} đ` : 'Trống'}
              </div>
            </div>
          </a>

          {/* Trạng thái chưa đăng nhập / Đã đăng nhập */}
          {!user ? (
            <button
            type="button"
            onClick={onOpenLogin}
            className="bg-[#141414] hover:bg-stone-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              Đăng nhập
            </button>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu(!openMenu)}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#F3EFEA] transition cursor-pointer"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-stone-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-stone-800 text-white text-sm font-bold flex items-center justify-center">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}

                <span className="hidden sm:block text-sm font-bold text-stone-900">
                  {user.name}
                </span>

                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-stone-500">
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {openMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-stone-200 rounded-xl shadow-lg py-1.5 z-50">
                  <a
                    href="/account"
                    className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100"
                  >
                    Tài khoản của tôi
                  </a>
                  <hr className="my-1 border-stone-100" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
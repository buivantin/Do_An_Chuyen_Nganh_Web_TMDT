import React from 'react';

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-stone-200 rounded-2xl p-8 text-center shadow-sm">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-red-600 font-bold text-xl mb-4">
          403
        </div>

        <div className="text-xs font-bold uppercase tracking-widest text-[#9A5B13] mb-1">
          Mọt Sách BookHouse
        </div>

        <h1 className="font-serif text-2xl font-bold text-[#1A1A1A] mb-2">
          Không có quyền truy cập
        </h1>

        <p className="text-sm text-stone-600 mb-6 leading-relaxed">
          Tài khoản khách hàng của bạn không được phép truy cập vào khu vực quản trị hệ thống. Vui lòng quay lại trang chủ hoặc đăng nhập bằng tài khoản quản trị viên.
        </p>

        <a
          href="/"
          className="inline-block w-full bg-[#141414] hover:bg-stone-800 text-white font-semibold text-sm py-3 rounded-xl transition"
        >
          Quay về trang chủ
        </a>
      </div>
    </div>
  );
}
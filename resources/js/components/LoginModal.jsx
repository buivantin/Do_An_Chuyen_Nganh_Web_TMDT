import React, { useState } from 'react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setError('');
    // Giả lập đăng nhập thành công để test giao diện (sau này nối API của TV2)
    const displayName = email.split('@')[0];
    onLoginSuccess?.({ name: displayName, email });
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#FAF8F5] border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xl"
      >
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-4 right-4 w-8 h-8 rounded-lg text-stone-500 hover:bg-[#F3EFEA] hover:text-stone-900 flex items-center justify-center transition cursor-pointer"
        >
          ✕
        </button>

        {/* Tiêu đề */}
        <div className="text-center mb-6">
          <div className="text-xs font-bold uppercase tracking-widest text-[#9A5B13] mb-1">
            Mọt Sách BookHouse
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">
            Đăng nhập tài khoản
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Đăng nhập để theo dõi đơn hàng và lưu tủ sách yêu thích
          </p>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Form đăng nhập */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nhapemail@example.com"
              className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#9A5B13]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-700">
                Mật khẩu
              </label>
              <a href="/forgot-password" className="text-xs text-[#9A5B13] hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#9A5B13]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#141414] hover:bg-stone-800 text-white font-semibold text-sm py-3 rounded-xl transition cursor-pointer mt-2"
          >
            Đăng nhập
          </button>
        </form>

        {/* Chuyển sang đăng ký */}
        <p className="text-center text-xs text-stone-600 mt-5">
          Chưa có tài khoản?{' '}
            <p className="text-center text-xs text-stone-600 mt-5">
            Chưa có tài khoản?{' '}
            <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-bold text-[#9A5B13] hover:underline cursor-pointer"
            >
            Đăng ký ngay
            </button>
            </p>
        </p>
      </div>
    </div>
  );
}
import React, { useState } from 'react';

export default function RegisterModal({ isOpen, onClose, onRegisterSuccess, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Vui lòng điền đầy đủ tất cả thông tin.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setError('');
    // Giả lập đăng ký thành công & tự đăng nhập (sau này nối API /register của TV2)
    onRegisterSuccess?.({ name: name.trim(), email: email.trim() });
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
            Tạo tài khoản mới
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Trở thành độc giả của Mọt Sách để nhận nhiều ưu đãi
          </p>
        </div>

        {/* Thông báo lỗi tiếng Việt */}
        {error && (
          <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Form đăng ký */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#9A5B13]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
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
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#9A5B13]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#9A5B13]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#141414] hover:bg-stone-800 text-white font-semibold text-sm py-3 rounded-xl transition cursor-pointer mt-2"
          >
            Đăng ký tài khoản
          </button>
        </form>

        {/* Chuyển sang đăng nhập */}
        <p className="text-center text-xs text-stone-600 mt-5">
          Đã có tài khoản?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-[#9A5B13] hover:underline cursor-pointer"
          >
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
}
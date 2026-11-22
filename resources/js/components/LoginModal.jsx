import React, { useState } from 'react';
import axios from 'axios';
import PasswordInput from "./PasswordInput";

export default function LoginModal({ isOpen, onClose, onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      // Gọi API thật xuống Laravel (routes/api.php)
      const res = await axios.post('/api/login', { email, password });
      const { token, user } = res.data;

      // Lưu token & thông tin user vào localStorage
      if (token) {
        localStorage.setItem('token', token);
      }
      localStorage.setItem('user', JSON.stringify(user));

      // Cập nhật Header và đóng modal
      onLoginSuccess?.(user);
      onClose();

      // Điều hướng theo vai trò: admin vào /admin, khách hàng ở lại trang chủ
      if (user?.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      if (err.response?.status === 422) {
        // Lỗi validation từng trường từ LoginRequest / AuthService
        setFieldErrors(err.response.data.errors || {});
        setError(err.response.data.message || 'Thông tin đăng nhập không hợp lệ.');
      } else if (err.response?.status === 429) {
        // Bị chặn do throttle:5,1 (nhập sai quá 5 lần/phút)
        setError('Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 1 phút.');
      } else {
        // Lỗi 401 (sai mật khẩu) hoặc 403 (tài khoản bị khóa)
        setError(err.response?.data?.message || 'Email hoặc mật khẩu không chính xác.');
      }
    } finally {
      setLoading(false);
    }
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

        {/* Thông báo lỗi chung */}
        {error && (
          <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Form đăng nhập */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold text-stone-700 mb-1.5"
            >
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nhapemail@example.com"
              className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#9A5B13]"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email[0]}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="text-xs font-semibold text-stone-700"
              >
                Mật khẩu
              </label>
              <a href="/forgot-password" className="text-xs text-[#9A5B13] hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            <PasswordInput
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#141414] hover:bg-stone-800 disabled:opacity-60 text-white font-semibold text-sm py-3 rounded-xl transition cursor-pointer mt-2"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Chuyển sang đăng ký (đã sửa lỗi lồng 2 thẻ <p>) */}
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
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import axios from 'axios';
import PasswordInput from "./PasswordInput";

export default function RegisterModal({ isOpen, onClose, onRegisterSuccess, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});

    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Vui lòng điền đầy đủ tất cả thông tin.');
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,50}$/.test(username.trim())) {
      setError('Tên đăng nhập 3–50 ký tự, chỉ gồm chữ không dấu, số và dấu gạch dưới (_).');
      return;
    }
    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/register', {
        username: username.trim(),
        email: email.trim(),
        password,
        password_confirmation: confirmPassword,
      });

      const { token, user } = res.data;
      setSuccess(res.data?.message || 'Đăng ký tài khoản thành công!');

      setTimeout(() => {
        if (token && user) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          // Truyền kèm name: user.username để Header hiển thị được ngay
          onRegisterSuccess?.({ ...user, name: user.name || user.username });
          onClose();
        } else {
          onSwitchToLogin?.();
        }
      }, 1000);
    } catch (err) {
      if (err.response?.status === 422) {
        setFieldErrors(err.response.data.errors || {});
        setError(err.response.data.message || 'Thông tin đăng ký chưa hợp lệ.');
      } else {
        setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
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
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-4 right-4 w-8 h-8 rounded-lg text-stone-500 hover:bg-[#F3EFEA] hover:text-stone-900 flex items-center justify-center transition cursor-pointer"
        >
          ✕
        </button>

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

        {error && (
          <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label
              htmlFor="register-username"
              className="block text-xs font-semibold text-stone-700 mb-1"
            >
              Tên đăng nhập
            </label>
            <input
              id="register-username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="nguyenvanb"
              className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#9A5B13]"
            />
            {fieldErrors.username && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.username[0]}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="block text-xs font-semibold text-stone-700 mb-1"
            >
              Email
            </label>
            <input
              id="register-email"
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
            <label
              htmlFor="register-password"
              className="block text-xs font-semibold text-stone-700 mb-1"
            >
              Mật khẩu
            </label>
            <PasswordInput
              id="register-password"
              name="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              autoComplete="new-password"
              className="!bg-white"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password[0]}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="register-password-confirmation"
              className="block text-xs font-semibold text-stone-700 mb-1"
            >
              Xác nhận mật khẩu
            </label>
            <PasswordInput
              id="register-password-confirmation"
              name="password_confirmation"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              className="!bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#141414] hover:bg-stone-800 disabled:opacity-60 text-white font-semibold text-sm py-3 rounded-xl transition cursor-pointer mt-2"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
          </button>
        </form>

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
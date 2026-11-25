import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";

function EyeToggleIcon({ visible }) {
  return visible ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

/**
 * DUMB COMPONENT: Giao diện Modal Đăng nhập / Đăng ký kèm nút ẩn/hiện mật khẩu
 */
export function AuthModalView({
  open = false,
  mode = "login",
  onSwitchMode,
  onClose,
  form,
  onChangeField,
  showPassword = false,
  onToggleShowPassword,
  showConfirmPassword = false,
  onToggleShowConfirmPassword,
  onSubmit,
  submitting = false,
  errorMsg = "",
  successMsg = "",
}) {
  if (!open) return null;

  const isLogin = mode === "login";

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-2xs flex items-center justify-center p-4"
      onClick={() => !submitting && onClose?.()}
    >
      <div
        className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-5 sm:p-7 shadow-2xl space-y-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          disabled={submitting}
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-4 right-4 w-8 h-8 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 flex items-center justify-center transition cursor-pointer"
        >
          &times;
        </button>

        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#9A5B13]">
            Mọt Sách BookHouse
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] mt-1">
            {isLogin ? "Đăng Nhập Độc Giả" : "Đăng Ký Thành Viên"}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {isLogin
              ? "Đăng nhập để quản lý tủ sách, giỏ hàng và theo dõi đơn hàng."
              : "Tạo tài khoản mới để tích điểm thăng hạng thành viên BookHouse."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F5F2EE] rounded-xl">
          <button
            type="button"
            onClick={() => onSwitchMode?.("login")}
            className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              isLogin
                ? "bg-white text-stone-900 shadow-2xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => onSwitchMode?.("register")}
            className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              !isLogin
                ? "bg-white text-stone-900 shadow-2xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Đăng ký
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3.5">
          {!isLogin && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                Họ và tên <span className="text-[#9A5B13]">*</span>
              </label>
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => onChangeField("username", e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 px-3.5 text-sm text-stone-900 focus:outline-none transition"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
              Email <span className="text-[#9A5B13]">*</span>
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => onChangeField("email", e.target.value)}
              placeholder="docgia@bookhouse.vn"
              className="w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 px-3.5 text-sm text-stone-900 focus:outline-none transition"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => onChangeField("phone", e.target.value)}
                placeholder="0909 123 456"
                className="w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 px-3.5 text-sm text-stone-900 focus:outline-none transition"
              />
            </div>
          )}

          {/* Ô Mật khẩu kèm icon mắt ẩn/hiện */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
              Mật khẩu <span className="text-[#9A5B13]">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={form.password}
                onChange={(e) => onChangeField("password", e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 pl-3.5 pr-11 text-sm text-stone-900 focus:outline-none transition"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={onToggleShowPassword}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-stone-400 hover:text-stone-700 transition cursor-pointer"
              >
                <EyeToggleIcon visible={showPassword} />
              </button>
            </div>
          </div>

          {/* Ô Xác nhận mật khẩu kèm icon mắt ẩn/hiện */}
          {!isLogin && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                Xác nhận mật khẩu <span className="text-[#9A5B13]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={form.password_confirmation}
                  onChange={(e) =>
                    onChangeField("password_confirmation", e.target.value)
                  }
                  placeholder="••••••••"
                  className="w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 pl-3.5 pr-11 text-sm text-stone-900 focus:outline-none transition"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={onToggleShowConfirmPassword}
                  aria-label={
                    showConfirmPassword
                      ? "Ẩn xác nhận mật khẩu"
                      : "Hiện xác nhận mật khẩu"
                  }
                  title={
                    showConfirmPassword
                      ? "Ẩn xác nhận mật khẩu"
                      : "Hiện xác nhận mật khẩu"
                  }
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-stone-400 hover:text-stone-700 transition cursor-pointer"
                >
                  <EyeToggleIcon visible={showConfirmPassword} />
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-[#141414] hover:bg-stone-800 disabled:opacity-60 text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition cursor-pointer mt-2"
          >
            {submitting
              ? "Đang xử lý..."
              : isLogin
              ? "Đăng nhập"
              : "Tạo tài khoản"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

/**
 * SMART COMPONENT: Xử lý gọi API /api/login & /api/register, lưu token & user
 */
export default function AuthModal({
  open = false,
  initialMode = "login",
  onClose,
  onSuccess,
}) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (open) {
      setMode(initialMode || "login");
      setErrorMsg("");
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open, initialMode]);

  const handleChangeField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (
      mode === "register" &&
      form.password !== form.password_confirmation
    ) {
      setErrorMsg("Mật khẩu xác nhận không khớp.");
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = mode === "login" ? "/api/login" : "/api/register";
      const payload =
        mode === "login"
          ? {
              email: form.email.trim(),
              password: form.password,
            }
          : {
              name: form.username.trim(),
              username: form.username.trim(),
              email: form.email.trim(),
              phone: form.phone.trim(),
              password: form.password,
              password_confirmation: form.password_confirmation,
            };

      const res = await axios.post(endpoint, payload, {
        headers: { Accept: "application/json" },
      });
      if (mode === "register") {
        setSuccessMsg("Đăng ký thành công! Vui lòng đăng nhập.");
        setForm((prev) => ({ ...prev, password: "", password_confirmation: "" }));
        setMode("login");
        return;
      }
      const token =
        res.data?.token ||
        res.data?.access_token ||
        res.data?.data?.token ||
        res.data?.data?.access_token;

      const user =
        res.data?.user ||
        res.data?.data?.user ||
        (res.data?.data?.email ? res.data.data : null);

      if (token) {
        localStorage.setItem("token", token);
      }
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      window.dispatchEvent(new CustomEvent("user-updated", { detail: user }));
      window.dispatchEvent(new CustomEvent("cart-updated"));

      onSuccess?.(user);
      onClose?.();
    } catch (err) {
      const firstErr = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat()[0]
        : null;
      setErrorMsg(
        firstErr ||
          err.response?.data?.message ||
          (mode === "login"
            ? "Email hoặc mật khẩu không chính xác."
            : "Không thể đăng ký tài khoản. Vui lòng kiểm tra lại.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthModalView
      open={open}
      mode={mode}
      onSwitchMode={(nextMode) => {
        setMode(nextMode);
        setErrorMsg("");
        setShowPassword(false);
        setShowConfirmPassword(false);
      }}
      onClose={onClose}
      form={form}
      onChangeField={handleChangeField}
      showPassword={showPassword}
      onToggleShowPassword={() => setShowPassword((v) => !v)}
      showConfirmPassword={showConfirmPassword}
      onToggleShowConfirmPassword={() => setShowConfirmPassword((v) => !v)}
      onSubmit={handleSubmit}
      submitting={submitting}
      errorMsg={errorMsg}
      successMsg={successMsg}
    />
  );
}
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";
import LoginRequiredModal from "../components/LoginRequiredModal";
import AddressPickerMap from "../components/AddressPickerMap"

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function normalizeUser(raw) {
  if (!raw || typeof raw !== "object") {
    return {
      username: "",
      email: "",
      phone: "",
      address: "",
      image_path: null,
    };
  }

  return {
    ...raw,
    username: raw.username || raw.name || "",
    email: raw.email || "",
    phone: raw.phone || "",
    address: raw.address || "",
    image_path: raw.image_path || raw.avatar || null,
  };
}

function resolveAvatarUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  return path.startsWith("/") ? path : `/${path}`;
}

export default function Account({ user: propUser = null, orders = [] }) {
  const initialUser = useMemo(
    () => normalizeUser(propUser || getStoredUser()),
    [propUser]
  );

  const [activeTab, setActiveTab] = useState(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    return ["profile", "password", "orders"].includes(tab) ? tab : "profile";
  });

  const [user, setUser] = useState(initialUser);
  const [profileForm, setProfileForm] = useState({
    username: initialUser.username,
    phone: initialUser.phone,
    address: initialUser.address,
  });
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [loading, setLoading] = useState(!propUser && !getStoredUser());
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const fileInputRef = useRef(null);

  // Đồng bộ khi prop user thay đổi từ component cha
  useEffect(() => {
    if (!propUser) return;
    const normalized = normalizeUser(propUser);
    setUser(normalized);
    setProfileForm({
      username: normalized.username,
      phone: normalized.phone,
      address: normalized.address,
    });
    setLoading(false);
  }, [propUser]);

  // Đồng bộ dữ liệu mới nhất từ API nếu không truyền propUser
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && !propUser) {
      setLoading(false);
      setShowLoginModal(true);
      return;
    }

    if (propUser || !token) return;

    let active = true;
    axios
      .get("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((res) => {
        if (!active) return;
        const rawUser = res.data?.user || res.data?.data || res.data;
        const normalized = normalizeUser(rawUser);
        setUser(normalized);
        setProfileForm({
          username: normalized.username,
          phone: normalized.phone,
          address: normalized.address,
        });
        localStorage.setItem("user", JSON.stringify(normalized));
      })
      .catch((err) => {
        if (!active) return;
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setShowLoginModal(true);
        } else {
          setMsg({
            type: "error",
            text:
              err.response?.data?.message ||
              "Không thể tải thông tin hồ sơ. Vui lòng thử lại.",
          });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [propUser]);

  const syncUserStorage = (nextUser) => {
    localStorage.setItem("user", JSON.stringify(nextUser));
    window.dispatchEvent(new CustomEvent("user-updated", { detail: nextUser }));
  };

  // Upload ảnh đại diện
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setSaving(true);
      setMsg({ type: "", text: "" });
      const res = await axios.post("/api/profile/avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      const nextPath =
        res.data?.image_path || res.data?.data?.image_path || user.image_path;
      const nextUser = { ...user, image_path: nextPath };
      setUser(nextUser);
      syncUserStorage(nextUser);
      setMsg({
        type: "success",
        text: res.data?.message || "Cập nhật ảnh đại diện thành công!",
      });
    } catch (err) {
      setMsg({
        type: "error",
        text:
          err.response?.data?.message ||
          "Lỗi tải ảnh đại diện. Vui lòng kiểm tra định dạng và dung lượng ảnh.",
      });
    } finally {
      setSaving(false);
      e.target.value = "";
    }
  };

  // Cập nhật thông tin cá nhân
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      const payload = {
        username: profileForm.username.trim(),
        name: profileForm.username.trim(),
        phone: profileForm.phone.trim(),
        address: profileForm.address.trim(),
      };

      const res = await axios.put("/api/profile", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const nextUser = { ...user, ...payload };
      setUser(nextUser);
      syncUserStorage(nextUser);
      setMsg({
        type: "success",
        text: res.data?.message || "Cập nhật thông tin cá nhân thành công!",
      });
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      const firstValidationMsg = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null;
      setMsg({
        type: "error",
        text:
          firstValidationMsg ||
          err.response?.data?.message ||
          "Không thể lưu thay đổi. Vui lòng thử lại!",
      });
    } finally {
      setSaving(false);
    }
  };

  // Đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      setMsg({
        type: "error",
        text: "Xác nhận mật khẩu mới chưa khớp.",
      });
      return;
    }

    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await axios.put("/api/profile/change-password", passwordForm, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      setMsg({
        type: "success",
        text: res.data?.message || "Đổi mật khẩu thành công!",
      });
      setPasswordForm({
        old_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      const firstValidationMsg = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null;
      setMsg({
        type: "error",
        text:
          firstValidationMsg ||
          err.response?.data?.message ||
          "Mật khẩu hiện tại không chính xác!",
      });
    } finally {
      setSaving(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setMsg({ type: "", text: "" });
  };

  const avatarSrc = resolveAvatarUrl(user.image_path);
  const avatarInitial = (user.username || user.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <MainLayout>
      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb đồng bộ Cart & Checkout */}
        <nav className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <a href="/" className="hover:text-[#9A5B13] transition">
            Trang chủ
          </a>
          <span>&rsaquo;</span>
          <span className="text-[#9A5B13]">Tài khoản độc giả</span>
        </nav>

        {/* Tiêu đề trang */}
        <div className="border-b border-stone-200/80 pb-5">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#9A5B13]">
            Hồ sơ thành viên Mọt Sách
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1A1A1A] mt-1 tracking-tight">
            Tài Khoản Của Tôi
          </h1>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-stone-500">
            Đang tải thông tin tài khoản...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* CỘT TRÁI: Ảnh đại diện & Menu điều hướng */}
            <aside className="lg:col-span-4 xl:col-span-3 bg-white border border-stone-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs lg:sticky lg:top-6 space-y-5">
              <div className="flex flex-col items-center text-center border-b border-stone-100 pb-5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer mb-3.5 rounded-full focus:outline-none"
                  title="Nhấn để đổi ảnh đại diện"
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#F5EDE2] shadow-xs bg-[#FAF8F5]">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={user.username || "Avatar"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#141414] text-white flex items-center justify-center font-serif text-3xl font-bold">
                        {avatarInitial}
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-black/45 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-[11px] font-bold uppercase tracking-wider">
                      Đổi ảnh
                    </span>
                  </div>
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                />

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F5EDE2] border border-[#E5D5BE] text-[10px] font-bold uppercase tracking-wider text-[#9A5B13] mb-2">
                  Độc giả Thành viên
                </span>

                <h2 className="font-serif text-lg font-bold text-[#1A1A1A] line-clamp-1 max-w-full">
                  {user.username || "Thành viên BookHouse"}
                </h2>
                <p className="text-xs text-stone-500 truncate max-w-full mt-0.5">
                  {user.email}
                </p>
              </div>

              {/* Menu Tabs */}
              <nav className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => switchTab("profile")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    activeTab === "profile"
                      ? "bg-[#141414] text-white shadow-xs"
                      : "text-stone-600 hover:bg-[#FAF8F5] hover:text-stone-900"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="w-4 h-4 shrink-0"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M5 20a7 7 0 0 1 14 0" />
                  </svg>
                  <span>Thông tin cá nhân</span>
                </button>

                <button
                  type="button"
                  onClick={() => switchTab("password")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    activeTab === "password"
                      ? "bg-[#141414] text-white shadow-xs"
                      : "text-stone-600 hover:bg-[#FAF8F5] hover:text-stone-900"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="w-4 h-4 shrink-0"
                  >
                    <rect x="4" y="11" width="16" height="9" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                  <span>Đổi mật khẩu</span>
                </button>

                <button
                  type="button"
                  onClick={() => switchTab("orders")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    activeTab === "orders"
                      ? "bg-[#141414] text-white shadow-xs"
                      : "text-stone-600 hover:bg-[#FAF8F5] hover:text-stone-900"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="w-4 h-4 shrink-0"
                  >
                    <path d="M6 7h12l1 13H5L6 7Z" strokeLinejoin="round" />
                    <path d="M9 7V5a3 3 0 0 1 6 0v2" strokeLinecap="round" />
                  </svg>
                  <span>Đơn hàng của tôi</span>
                </button>
              </nav>
            </aside>

            {/* CỘT PHẢI: Nội dung từng tab */}
            <section className="lg:col-span-8 xl:col-span-9 bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xs min-h-[420px]">
              {/* Thông báo phản hồi */}
              {msg.text && (
                <div
                  className={`mb-6 p-3.5 rounded-xl border text-xs sm:text-sm ${
                    msg.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {msg.text}
                </div>
              )}

              {/* TAB 1: HỒ SƠ CÁ NHÂN */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="border-b border-stone-100 pb-4">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A]">
                      Hồ Sơ Cá Nhân
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Quản lý thông tin liên hệ và địa chỉ giao nhận ấn phẩm mặc
                      định
                    </p>
                  </div>

                  <form
                    onSubmit={handleUpdateProfile}
                    className="max-w-2xl space-y-4"
                  >
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Email đăng nhập (Không thể thay đổi)
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full bg-stone-100 border border-stone-200/80 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-stone-500 cursor-not-allowed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                          Họ và tên <span className="text-[#9A5B13]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={profileForm.username}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              username: e.target.value,
                            })
                          }
                          placeholder="Nhập họ và tên"
                          className="w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              phone: e.target.value,
                            })
                          }
                          placeholder="Ví dụ: 0988 123 456"
                          className="w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Địa chỉ nhận sách mặc định
                      </label>
                      <div>
                      <AddressPickerMap
                        value={profileForm.address}
                        labelPrefix="Địa chỉ nhận sách mặc định"
                        onChange={(fullAddress) =>
                          setProfileForm((prev) => ({ ...prev, address: fullAddress }))
                        }
                      />
                    </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="w-full sm:w-auto px-6 py-3 bg-[#141414] hover:bg-stone-800 disabled:opacity-60 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-xs"
                      >
                        {saving ? "Đang lưu thay đổi..." : "Lưu thay đổi"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: ĐỔI MẬT KHẨU */}
              {activeTab === "password" && (
                <div className="space-y-6">
                  <div className="border-b border-stone-100 pb-4">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A]">
                      Đổi Mật Khẩu
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Cập nhật mật khẩu định kỳ để bảo vệ tài khoản độc giả của bạn
                    </p>
                  </div>

                  <form
                    onSubmit={handleChangePassword}
                    className="max-w-xl space-y-4"
                  >
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Mật khẩu hiện tại{" "}
                        <span className="text-[#9A5B13]">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordForm.old_password}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            old_password: e.target.value,
                          })
                        }
                        placeholder="Nhập mật khẩu hiện tại"
                        className="w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Mật khẩu mới (tối thiểu 8 ký tự){" "}
                        <span className="text-[#9A5B13]">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={passwordForm.new_password}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            new_password: e.target.value,
                          })
                        }
                        placeholder="Nhập mật khẩu mới"
                        className="w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Xác nhận mật khẩu mới{" "}
                        <span className="text-[#9A5B13]">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={passwordForm.new_password_confirmation}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            new_password_confirmation: e.target.value,
                          })
                        }
                        placeholder="Nhập lại mật khẩu mới"
                        className="w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="w-full sm:w-auto px-6 py-3 bg-[#141414] hover:bg-stone-800 disabled:opacity-60 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-xs"
                      >
                        {saving ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: ĐƠN HÀNG CỦA TÔI */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <div className="border-b border-stone-100 pb-4">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A]">
                      Đơn Hàng Của Tôi
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Theo dõi lịch sử đặt mua và trạng thái giao nhận ấn phẩm
                    </p>
                  </div>

                  {Array.isArray(orders) && orders.length > 0 ? (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3"
                        >
                          <div>
                            <div className="text-xs font-bold text-[#9A5B13]">
                              Mã đơn #{order.id}
                            </div>
                            <div className="text-xs text-stone-500 mt-0.5">
                              {order.created_at}
                            </div>
                          </div>
                          <div className="text-sm font-bold text-stone-900">
                            {Number(order.total_amount || 0).toLocaleString(
                              "vi-VN"
                            )}{" "}
                            ₫
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-8 sm:p-12 text-center space-y-3.5">
                      <div className="w-12 h-12 mx-auto rounded-full bg-white border border-stone-200 flex items-center justify-center text-[#9A5B13]">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="w-6 h-6"
                        >
                          <path
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                        Chưa có đơn hàng nào
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
                        Khi bạn hoàn tất đặt sách, thông tin và trạng thái vận
                        chuyển đơn hàng sẽ hiển thị tại đây.
                      </p>
                      <div className="pt-1">
                        <a
                          href="/products"
                          className="inline-block px-6 py-2.5 bg-[#141414] hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition"
                        >
                          Tiếp tục mua sắm
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
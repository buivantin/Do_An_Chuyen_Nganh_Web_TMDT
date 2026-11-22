import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";
import LoginRequiredModal from "../components/LoginRequiredModal";
import ProductService from "../services/ProductService";
import CheckoutStepper from "../components/CheckoutStepper";
import AddressPickerMap from "../components/AddressPickerMap";

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function Checkout() {
  const storedUser = useMemo(() => getStoredUser(), []);
  const initialName = storedUser?.username || storedUser?.name || "";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Chế độ địa chỉ: 'saved' | 'new'
  const [addressMode, setAddressMode] = useState("saved");
  const [savedProfile, setSavedProfile] = useState({
    name: initialName,
    phone: storedUser?.phone || "",
    email: storedUser?.email || "",
    address: storedUser?.address || "",
  });

  // Form thông tin giao nhận
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(storedUser?.phone || "");
  const [email, setEmail] = useState(storedUser?.email || "");
  const [shippingAddress, setShippingAddress] = useState(
    storedUser?.address || ""
  );
  const [saveAsDefault, setSaveAsDefault] = useState(true);
  const [note, setNote] = useState("");

  // Phương thức giao hàng & thanh toán
  const [shippingMethod, setShippingMethod] = useState("standard"); // 'standard' | 'express'
  const [paymentMethod, setPaymentMethod] = useState("cod"); // 'cod' | 'banking'

  // Mã ưu đãi
  const [promoInput, setPromoInput] = useState("");
  const [promoNotice, setPromoNotice] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setShowLoginModal(true);
      return;
    }

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [cartItems, profileRes] = await Promise.all([
          ProductService.getCart(),
          axios
            .get("/api/profile", {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            })
            .catch(() => null),
        ]);

        setItems(Array.isArray(cartItems) ? cartItems : []);

        const p =
          profileRes?.data?.user ||
          profileRes?.data?.data ||
          profileRes?.data;

        if (p && typeof p === "object") {
          const nextProfile = {
            name: p.username || p.name || initialName,
            phone: p.phone || storedUser?.phone || "",
            email: p.email || storedUser?.email || "",
            address: p.address || storedUser?.address || "",
          };
          setSavedProfile(nextProfile);
          if (nextProfile.name) setFullName(nextProfile.name);
          if (nextProfile.phone) setPhone(nextProfile.phone);
          if (nextProfile.email) setEmail(nextProfile.email);
          if (nextProfile.address) setShippingAddress(nextProfile.address);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setShowLoginModal(true);
        } else {
          setErrorMsg(
            err.response?.data?.message || "Không thể tải thông tin giỏ hàng."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [storedUser, initialName]);

  const handleSelectAddressMode = (mode) => {
    setAddressMode(mode);
    if (mode === "saved") {
      setFullName(savedProfile.name || "");
      setPhone(savedProfile.phone || "");
      setEmail(savedProfile.email || "");
      setShippingAddress(savedProfile.address || "");
    } else {
      setFullName("");
      setPhone("");
      setShippingAddress("");
    }
  };

  const totalBooks = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
        0
      ),
    [items]
  );

  const shippingFee = shippingMethod === "express" ? 35000 : 0;
  const grandTotal = subtotal + shippingFee;

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setPromoNotice("Vui lòng nhập mã ưu đãi độc giả.");
      return;
    }
    setPromoNotice(`Mã "${code}" chưa áp dụng cho chương trình hiện tại.`);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    if (items.length === 0) {
      setErrorMsg("Giỏ hàng đang trống, vui lòng chọn sách trước khi đặt hàng.");
      return;
    }

    const fullAddress = shippingAddress.trim();
    if (!fullName.trim() || !phone.trim() || !fullAddress) {
      setErrorMsg(
        "Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao nhận."
      );
      return;
    }

    const payload = {
      shipping_name: fullName.trim(),
      receiver_name: fullName.trim(),
      customer_name: fullName.trim(),
      name: fullName.trim(),
      shipping_phone: phone.trim(),
      receiver_phone: phone.trim(),
      phone: phone.trim(),
      email: email.trim(),
      shipping_email: email.trim(),
      shipping_address: fullAddress,
      receiver_address: fullAddress,
      address: fullAddress,
      payment_method: paymentMethod,
      shipping_method: shippingMethod,
      shipping_fee: shippingFee,
      total_amount: grandTotal,
      note: note.trim(),
      notes: note.trim(),
    };

    setSubmitting(true);
    try {
      const response =
        typeof ProductService.createOrder === "function"
          ? await ProductService.createOrder(payload)
          : (
              await axios.post("/api/orders", payload, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                },
              })
            ).data;

      // Lưu làm địa chỉ mặc định nếu người dùng tích chọn
      if (saveAsDefault && fullAddress !== savedProfile.address) {
        axios
          .put(
            "/api/profile",
            {
              username: fullName.trim(),
              name: fullName.trim(),
              phone: phone.trim(),
              address: fullAddress,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
          )
          .then(() => {
            const currentStored = getStoredUser() || {};
            localStorage.setItem(
              "user",
              JSON.stringify({
                ...currentStored,
                username: fullName.trim(),
                name: fullName.trim(),
                phone: phone.trim(),
                address: fullAddress,
              })
            );
          })
          .catch(() => null);
      }

      const createdOrder = response?.data || response?.order || response || {};
      setOrderSuccess({
        code:
          createdOrder.order_code ||
          createdOrder.code ||
          (createdOrder.id ? `#MS${createdOrder.id}` : "#MS2026"),
        receiver: fullName.trim(),
        phone: phone.trim(),
        address: fullAddress,
        total: grandTotal,
        paymentMethod,
      });

      window.dispatchEvent(new CustomEvent("cart-updated"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setShowLoginModal(true);
      } else {
        const validationErrors = err.response?.data?.errors;
        const firstValidationMsg = validationErrors
          ? Object.values(validationErrors).flat()[0]
          : null;
        setErrorMsg(
          firstValidationMsg ||
            err.response?.data?.message ||
            "Đặt hàng không thành công. Vui lòng kiểm tra lại thông tin."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const currentStep = orderSuccess ? 3 : 2;

  return (
    <MainLayout>
      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Thanh điều hướng Breadcrumb */}
        <nav className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <a href="/" className="hover:text-[#9A5B13] transition">
            Trang chủ
          </a>
          <span>&rsaquo;</span>
          <a href="/cart" className="hover:text-[#9A5B13] transition">
            Giỏ ấn phẩm
          </a>
          <span>&rsaquo;</span>
          <span className="text-[#9A5B13]">Tiến trình thanh toán</span>
        </nav>

        {/* Tiêu đề trang & Thanh tiến trình 3 bước dùng chung */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-stone-200/80 pb-5">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-[#9A5B13]">
              Quy trình hoàn tất bản đặt
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1A1A1A] mt-1 tracking-tight">
              Thông Tin Giao Nhận &amp; Thanh Toán
            </h1>
          </div>

          <CheckoutStepper currentStep={currentStep} />
        </div>

        {/* Màn hình hoàn tất đơn hàng (Bước 3) */}
        {orderSuccess ? (
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-10 max-w-2xl mx-auto text-center space-y-5 shadow-xs">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                className="w-7 h-7"
              >
                <path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-widest text-[#9A5B13]">
                Đặt hàng thành công &bull; Mã đơn {orderSuccess.code}
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
                Cảm ơn bạn đã tin chọn Mọt Sách BookHouse
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
                Đơn ấn phẩm của bạn đã được ghi nhận và đang được thủ thư chuẩn bị
                đóng gói chống móp gáy.
              </p>
            </div>

            <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-4 text-left text-xs sm:text-sm space-y-2">
              <div className="flex justify-between gap-3">
                <span className="text-stone-500">Người nhận:</span>
                <span className="font-semibold text-stone-900 text-right">
                  {orderSuccess.receiver} ({orderSuccess.phone})
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-stone-500 shrink-0">Địa chỉ giao:</span>
                <span className="font-medium text-stone-800 text-right">
                  {orderSuccess.address}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-stone-500">Thanh toán:</span>
                <span className="font-medium text-stone-800">
                  {orderSuccess.paymentMethod === "banking"
                    ? "Chuyển khoản ngân hàng"
                    : "Thanh toán khi nhận hàng (COD)"}
                </span>
              </div>
              <div className="border-t border-stone-200/80 pt-2 flex justify-between items-baseline">
                <span className="font-bold text-stone-900">Tổng thanh toán:</span>
                <span className="text-base sm:text-lg font-bold text-[#9A5B13]">
                  {Number(orderSuccess.total || 0).toLocaleString("vi-VN")} ₫
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/products"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#141414] hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold transition"
              >
                Tiếp tục khám phá sách
              </a>
              <a
                href="/"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#FAF8F5] hover:bg-stone-100 border border-stone-200 text-stone-800 text-xs sm:text-sm font-semibold transition"
              >
                Về trang chủ
              </a>
            </div>
          </div>
        ) : loading ? (
          <div className="py-16 text-center text-sm text-stone-500">
            Đang tải thông tin thanh toán...
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-stone-200/80 rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4">
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Chưa có ấn phẩm nào để thanh toán
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Giỏ hàng của bạn hiện đang trống. Hãy chọn thêm sách trước khi tiến
              hành đặt hàng.
            </p>
            <a
              href="/products"
              className="inline-block bg-[#141414] hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition"
            >
              Khám phá danh mục sách
            </a>
          </div>
        ) : (
          <form
            onSubmit={handleSubmitOrder}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            {/* CỘT TRÁI: Địa chỉ + Phương thức vận chuyển + Thanh toán */}
            <div className="lg:col-span-7 space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              {/* KHỐI 1: Địa Chỉ Nhận Sách */}
              <section className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-6 space-y-5 shadow-2xs">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#141414] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A]">
                        Địa Chỉ Nhận Sách
                      </h2>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Thông tin xác thực địa chỉ giao ấn phẩm tận tay
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F5EDE2] border border-[#E5D5BE] text-[11px] font-bold text-[#9A5B13]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7l7-4z" />
                    </svg>
                    <span>Độc giả Thành viên</span>
                  </span>
                </div>

                {/* 2 Thẻ chọn nhanh: Địa chỉ lưu sẵn / Giao tới địa chỉ mới */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectAddressMode("saved")}
                    className={`text-left p-3.5 rounded-xl border transition cursor-pointer ${
                      addressMode === "saved"
                        ? "bg-[#FAF6F0] border-[#9A5B13]/60 shadow-2xs"
                        : "bg-[#FAF8F5] border-stone-200/80 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            addressMode === "saved"
                              ? "border-[#9A5B13]"
                              : "border-stone-400"
                          }`}
                        >
                          {addressMode === "saved" && (
                            <span className="w-2 h-2 rounded-full bg-[#9A5B13]" />
                          )}
                        </span>
                        <span className="text-xs font-bold text-stone-900 truncate">
                          Địa chỉ lưu sẵn{" "}
                          {savedProfile.name ? `(${savedProfile.name})` : ""}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-stone-200/80 text-stone-600 shrink-0">
                        Mặc định
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-500 mt-1.5 pl-6 line-clamp-1">
                      {savedProfile.address || "Chưa có địa chỉ lưu sẵn"}
                    </p>
                    <p className="text-[11px] font-medium text-[#9A5B13] mt-0.5 pl-6 truncate">
                      {savedProfile.phone || "Cập nhật số điện thoại bên dưới"}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectAddressMode("new")}
                    className={`text-left p-3.5 rounded-xl border transition cursor-pointer ${
                      addressMode === "new"
                        ? "bg-[#FAF6F0] border-[#9A5B13]/60 shadow-2xs"
                        : "bg-[#FAF8F5] border-stone-200/80 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          addressMode === "new"
                            ? "border-[#9A5B13]"
                            : "border-stone-400"
                        }`}
                      >
                        {addressMode === "new" && (
                          <span className="w-2 h-2 rounded-full bg-[#9A5B13]" />
                        )}
                      </span>
                      <span className="text-xs font-bold text-stone-900">
                        Giao tới địa chỉ mới
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1.5 pl-6 leading-relaxed">
                      Thiết lập nơi nhận riêng tư, tư gia hoặc cơ quan đối tác
                    </p>
                  </button>
                </div>

                {/* Các trường nhập liệu thông tin & địa chỉ */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Họ và tên người nhận <span className="text-[#9A5B13]">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="w-4 h-4"
                          >
                            <circle cx="12" cy="8" r="4" />
                            <path d="M5 20a7 7 0 0 1 14 0" />
                          </svg>
                        </span>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Nhập họ và tên người nhận"
                          className="w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Số điện thoại liên lạc <span className="text-[#9A5B13]">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="w-4 h-4"
                          >
                            <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
                          </svg>
                        </span>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Ví dụ: 0988 123 456"
                          className="w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                      Thư điện tử (Email nhận thông báo đơn hàng){" "}
                      <span className="text-[#9A5B13]">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="w-4 h-4"
                        >
                          <rect x="3" y="5" width="18" height="14" rx="2" />
                          <path d="m3 7 9 6 9-6" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@domain.com"
                        className="w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Dropdown Tỉnh/Thành - Quận/Huyện - Xã/Phường + Địa chỉ chi tiết + Bản đồ Google Maps */}
                  <AddressPickerMap
                    required
                    value={shippingAddress}
                    labelPrefix="Địa chỉ giao nhận"
                    onChange={(fullAddr) => setShippingAddress(fullAddr)}
                  />

                  <label className="inline-flex items-center gap-2 text-xs text-stone-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={saveAsDefault}
                      onChange={(e) => setSaveAsDefault(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#9A5B13] cursor-pointer"
                    />
                    <span>Lưu làm địa chỉ giao nhận mặc định cho lần đặt sau</span>
                  </label>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                      Ghi chú gửi thủ thư &amp; người vận chuyển
                    </label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ví dụ: Bọc chống va đập kỹ các góc gáy bìa cứng, giao giờ hành chính..."
                      className="w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 px-3 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* KHỐI 2: Phương Thức Giao Nhận */}
              <section className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-6 space-y-4 shadow-2xs">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#141414] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A]">
                      Phương Thức Giao Nhận Ấn Phẩm
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Tiêu chuẩn bảo quản gáy sách và chống ẩm khép kín suốt hành trình
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Giao tiêu chuẩn */}
                  <button
                    type="button"
                    onClick={() => setShippingMethod("standard")}
                    className={`w-full text-left p-4 rounded-xl border transition cursor-pointer ${
                      shippingMethod === "standard"
                        ? "bg-[#FAF6F0] border-[#9A5B13]/60"
                        : "bg-white border-stone-200/80 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            shippingMethod === "standard"
                              ? "border-[#9A5B13]"
                              : "border-stone-400"
                          }`}
                        >
                          {shippingMethod === "standard" && (
                            <span className="w-2 h-2 rounded-full bg-[#9A5B13]" />
                          )}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-stone-900">
                          Giao Hàng Tiêu Chuẩn (2 - 3 ngày)
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F5EDE2] text-[#9A5B13]">
                          Khuyên Dùng
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                        <span className="font-bold text-[#9A5B13]">MIỄN PHÍ</span>
                        <span className="text-stone-400 line-through text-xs">
                          35.000đ
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-500 mt-2 pl-6 leading-relaxed">
                      Đóng gói chuẩn hộp carton 4 lớp định lượng cao kèm đệm bọc túi
                      khí bảo vệ 360 độ góc sách.
                    </p>
                  </button>

                  {/* Giao hỏa tốc */}
                  <button
                    type="button"
                    onClick={() => setShippingMethod("express")}
                    className={`w-full text-left p-4 rounded-xl border transition cursor-pointer ${
                      shippingMethod === "express"
                        ? "bg-[#FAF6F0] border-[#9A5B13]/60"
                        : "bg-white border-stone-200/80 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            shippingMethod === "express"
                              ? "border-[#9A5B13]"
                              : "border-stone-400"
                          }`}
                        >
                          {shippingMethod === "express" && (
                            <span className="w-2 h-2 rounded-full bg-[#9A5B13]" />
                          )}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-stone-900">
                          Giao Hỏa Tốc Nội Thành 2H
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                          Tức thì
                        </span>
                      </div>

                      <span className="text-xs sm:text-sm font-bold text-stone-900">
                        +35.000đ
                      </span>
                    </div>

                    <p className="text-xs text-stone-500 mt-2 pl-6 leading-relaxed">
                      Đội ngũ chuyển phát chuyên biệt trao tận tay trong 120 phút kể từ
                      lúc xác nhận đơn ấn phẩm.
                    </p>
                  </button>
                </div>
              </section>

              {/* KHỐI 3: Phương Thức Thanh Toán */}
              <section className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-6 space-y-4 shadow-2xs">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#141414] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A]">
                      Phương Thức Thanh Toán
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Lựa chọn hình thức thanh toán thuận tiện và an toàn
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`text-left p-3.5 rounded-xl border transition cursor-pointer ${
                      paymentMethod === "cod"
                        ? "bg-[#FAF6F0] border-[#9A5B13]/60"
                        : "bg-white border-stone-200/80 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentMethod === "cod"
                            ? "border-[#9A5B13]"
                            : "border-stone-400"
                        }`}
                      >
                        {paymentMethod === "cod" && (
                          <span className="w-2 h-2 rounded-full bg-[#9A5B13]" />
                        )}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-stone-900">
                        Thanh toán khi nhận hàng (COD)
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1.5 pl-6">
                      Kiểm tra nguyên vẹn gáy sách trước khi thanh toán tiền mặt
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("banking")}
                    className={`text-left p-3.5 rounded-xl border transition cursor-pointer ${
                      paymentMethod === "banking"
                        ? "bg-[#FAF6F0] border-[#9A5B13]/60"
                        : "bg-white border-stone-200/80 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentMethod === "banking"
                            ? "border-[#9A5B13]"
                            : "border-stone-400"
                        }`}
                      >
                        {paymentMethod === "banking" && (
                          <span className="w-2 h-2 rounded-full bg-[#9A5B13]" />
                        )}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-stone-900">
                        Chuyển khoản ngân hàng / QR
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1.5 pl-6">
                      Xác nhận tự động 24/7 qua mã VietQR ngân hàng
                    </p>
                  </button>
                </div>
              </section>
            </div>

            {/* CỘT PHẢI: Tóm tắt đơn hàng */}
            <aside className="lg:col-span-5 bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-6 space-y-5 shadow-2xs lg:sticky lg:top-6">
              {/* Header Đơn hàng */}
              <div className="flex items-end justify-between gap-2 border-b border-stone-100 pb-3.5">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#9A5B13]">
                    Tuyển thư ký gửi
                  </div>
                  <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mt-0.5">
                    Đơn Hàng Của Bạn
                  </h2>
                </div>

                <a
                  href="/cart"
                  className="text-xs font-semibold text-[#9A5B13] hover:underline flex items-center gap-1"
                >
                  <span>Sửa giỏ</span>
                  <span>&#9998;</span>
                </a>
              </div>

              {/* Danh sách sách trong đơn */}
              <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                {items.map((item) => {
                  const cleanName = (item.name || "").normalize("NFC");
                  const lineTotal =
                    Number(item.price || 0) * Number(item.quantity || 1);

                  return (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-12 h-16 rounded-lg bg-[#EAEAEA] p-1 flex items-center justify-center shrink-0">
                          <img
                            src={item.image}
                            alt={cleanName}
                            className="h-full object-contain shadow-2xs"
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-serif text-xs sm:text-sm font-bold text-stone-900 line-clamp-2">
                            {cleanName}
                          </h3>
                          <p className="text-[11px] text-stone-500 truncate mt-0.5">
                            {item.author?.normalize("NFC")}
                          </p>
                          <div className="text-[11px] text-stone-500 mt-1">
                            Bản in tiêu chuẩn &bull;{" "}
                            <span className="font-bold text-[#9A5B13]">
                              SL: {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs sm:text-sm font-bold text-stone-900">
                          {lineTotal.toLocaleString("vi-VN")}đ
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-stone-400 mt-0.5">
                            {Number(item.price || 0).toLocaleString("vi-VN")}đ/c
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quà tặng đính kèm */}
              <div className="bg-[#FAF5EE] border border-[#EADBC8] rounded-xl p-3 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9A5B13] flex items-center gap-1.5">
                  <span>&#127873;</span>
                  <span>Tặng phẩm đính kèm tri ân</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-[11px] text-stone-700">
                  <span className="truncate">
                    &bull; 01 Bookmark giấy mỹ thuật Mọt Sách
                  </span>
                  <span className="font-bold text-[#9A5B13] shrink-0">0đ</span>
                </div>
              </div>

              {/* Mã ưu đãi độc giả */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Phiếu ưu đãi độc giả / Thẻ quà tặng
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Nhập mã ưu đãi..."
                    className="flex-1 min-w-0 bg-[#F5F2EE] border border-stone-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#9A5B13]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-3.5 py-2 rounded-xl bg-[#EAE5DD] hover:bg-[#DFD8CE] text-xs font-bold text-stone-800 transition cursor-pointer shrink-0"
                  >
                    Áp dụng
                  </button>
                </div>
                {promoNotice && (
                  <p className="text-[11px] text-[#9A5B13]">{promoNotice}</p>
                )}
              </div>

              {/* Chi tiết tính tiền */}
              <div className="border-t border-stone-100 pt-3.5 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Tạm tính ấn phẩm ({totalBooks} cuốn)</span>
                  <span className="font-bold text-stone-900">
                    {subtotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Phí vận chuyển bảo quản</span>
                  <span
                    className={`font-bold ${
                      shippingFee === 0 ? "text-[#9A5B13]" : "text-stone-900"
                    }`}
                  >
                    {shippingFee === 0
                      ? "Miễn phí (0đ)"
                      : `${shippingFee.toLocaleString("vi-VN")}đ`}
                  </span>
                </div>
              </div>

              {/* Khung Tổng Thanh Toán Toàn Bộ */}
              <div className="bg-[#F3EFEA] border border-stone-200/70 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-800">
                    Tổng thanh toán
                    <br />
                    toàn bộ
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    (Đã bao gồm thuế GTGT)
                  </div>
                </div>

                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight text-right">
                  {grandTotal.toLocaleString("vi-VN")}
                  <span className="text-base sm:text-lg font-sans font-bold ml-0.5">
                    đ
                  </span>
                </div>
              </div>

              {/* Nút Xác Nhận Đặt Hàng */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#141414] hover:bg-stone-800 disabled:opacity-60 text-white text-xs sm:text-sm font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
              >
                <span>
                  {submitting
                    ? "Đang xử lý đơn hàng..."
                    : "Xác nhận đặt hàng & thanh toán"}
                </span>
                {!submitting && <span>&rarr;</span>}
              </button>

              {/* Cam kết dịch vụ bên dưới */}
              <ul className="space-y-2.5 pt-1 text-[11px] text-stone-500">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9A5B13] mt-0.5 shrink-0">&#128737;</span>
                  <span>
                    Bảo mật giao dịch chuẩn{" "}
                    <strong className="text-stone-700">SSL 256-bit</strong> tiêu
                    chuẩn ngân hàng
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9A5B13] mt-0.5 shrink-0">&#128230;</span>
                  <span>
                    Đóng gói 4 lớp hộp carton cao cấp{" "}
                    <strong className="text-stone-700">
                      chống móp gáy 100%
                    </strong>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9A5B13] mt-0.5 shrink-0">&#8635;</span>
                  <span>
                    Đổi trả ấn bản tận nhà trong{" "}
                    <strong className="text-stone-700">15 ngày</strong> nếu phát
                    hiện lỗi in ấn
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9A5B13] mt-0.5 shrink-0">&#127911;</span>
                  <span>
                    Hỗ trợ thủ thư trực tiếp:{" "}
                    <strong className="text-stone-700">1900 6886</strong>
                  </span>
                </li>
              </ul>
            </aside>
          </form>
        )}
      </div>
    </MainLayout>
  );
}
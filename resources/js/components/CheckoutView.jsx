import React from "react";
import { createPortal } from "react-dom";
import CheckoutStepper from "./CheckoutStepper";
import VietnamAddressSelector from "./VietnamAddressSelector";
import MobileActionBar from "./MobileActionBar";

export const PAYMENT_METHODS = [
  {
    id: "cod",
    title: "Thanh toán khi nhận hàng (COD)",
    badge: "Tiền mặt",
    badgeClass: "bg-stone-100 text-stone-700 border-stone-200",
    description: "Kiểm tra nguyên vẹn gáy sách trước khi thanh toán tiền mặt",
  },
  {
    id: "vnpay",
    title: "Thanh toán qua VNPay",
    badge: "VNPAY-QR",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
    description: "Quét mã VNPAY-QR, thẻ ATM nội địa hoặc thẻ quốc tế",
  },
  {
    id: "momo",
    title: "Thanh toán qua Ví MoMo",
    badge: "MoMo",
    badgeClass: "bg-pink-50 text-pink-700 border-pink-200",
    description: "Thanh toán nhanh qua ứng dụng Ví điện tử MoMo",
  },
];

export function getPaymentMethodLabel(method) {
  const key = String(method || "cod").toLowerCase();
  const found = PAYMENT_METHODS.find((item) => item.id === key);
  return found ? found.title : "Thanh toán khi nhận hàng (COD)";
}

/**
 * DUMB COMPONENT: Giao diện Checkout (Thêm voucher của user, Stepper tinh gọn, Responsive Mobile & PC)
 */
export default function CheckoutView({
  items = [],
  totalBooks = 0,
  subtotal = 0,
  shippingFee = 0,
  voucherDiscount = 0,
  grandTotal = 0,
  loading = false,
  submitting = false,
  errorMsg = "",
  orderSuccess = null,
  currentStep = 2,
  addressMode = "saved",
  savedProfile = {},
  fullName = "",
  phone = "",
  email = "",
  provinceCode = "79",
  districtCode = "",
  wardName = "",
  streetAddress = "",
  saveAsDefault = true,
  note = "",
  shippingMethod = "standard",
  paymentMethod = "cod",
  vouchers = [],
  vouchersLoading = false,
  selectedVoucher = null,
  voucherModalOpen = false,
  eligibleVoucherCount = 0,
  onSelectAddressMode,
  onFullNameChange,
  onPhoneChange,
  onEmailChange,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  onStreetChange,
  onSaveAsDefaultChange,
  onNoteChange,
  onShippingMethodChange,
  onPaymentMethodChange,
  onOpenVoucherModal,
  onCloseVoucherModal,
  onApplyVoucher,
  onRemoveVoucher,
  onSubmitOrder,
}) {
  return (
    <div className="bg-[#FCFBF9] min-h-screen pb-24 lg:pb-12">
      {/* Đẩy bong bóng liên hệ lên trên thanh đặt hàng cố định ở Mobile (< 1024px) */}
      <style>{`
        @media (max-width: 1023px) {
          body.bh-checkout-mobile-bar .fixed.bottom-4.right-4,
          body.bh-checkout-mobile-bar .fixed.bottom-5.right-5,
          body.bh-checkout-mobile-bar .fixed.bottom-6.right-6,
          body.bh-checkout-mobile-bar [data-contact-bubble] {
            bottom: 5.25rem !important;
            transition: bottom 0.2s ease;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8 space-y-5 sm:space-y-8">
        {/* Breadcrumb */}
        <nav className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <a href="/" className="hover:text-[#9A5B13] transition">
            Trang chủ
          </a>
          <span>&rsaquo;</span>
          <a href="/cart" className="hover:text-[#9A5B13] transition">
            Giỏ hàng
          </a>
          <span>&rsaquo;</span>
          <span className="text-[#9A5B13]">Thanh toán</span>
        </nav>

        {/* Tiêu đề & Stepper tinh gọn */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 border-b border-stone-200/80 pb-4 sm:pb-5">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1A1A] tracking-tight">
            Giao Nhận &amp; Thanh Toán
          </h1>

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
                Đơn ấn phẩm của bạn đã được ghi nhận và đang được thủ thư chuẩn
                bị đóng gói chống móp gáy.
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
                  {getPaymentMethodLabel(orderSuccess.paymentMethod)}
                </span>
              </div>
              {orderSuccess.voucherCode && orderSuccess.discount > 0 && (
                <div className="flex justify-between gap-3 text-emerald-700">
                  <span>Voucher ({orderSuccess.voucherCode}):</span>
                  <span className="font-bold">
                    -{Number(orderSuccess.discount).toLocaleString("vi-VN")} ₫
                  </span>
                </div>
              )}
              <div className="border-t border-stone-200/80 pt-2 flex justify-between items-baseline">
                <span className="font-bold text-stone-900">
                  Tổng thanh toán:
                </span>
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
              Giỏ hàng của bạn hiện đang trống. Hãy chọn thêm sách trước khi
              tiến hành đặt hàng.
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
            id="checkout-form"
            onSubmit={onSubmitOrder}
            className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start"
          >
            {/* CỘT TRÁI: Địa chỉ + Vận chuyển + Thanh toán */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              {/* KHỐI 1: Địa Chỉ Nhận Sách */}
              <section className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-[#141414] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A]">
                      Địa Chỉ Nhận Sách
                    </h2>
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

                {/* 2 Thẻ chọn địa chỉ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectAddressMode?.("saved")}
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
                    onClick={() => onSelectAddressMode?.("new")}
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

                {/* Thông tin liên hệ */}
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Họ và tên người nhận{" "}
                        <span className="text-[#9A5B13]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => onFullNameChange?.(e.target.value)}
                        placeholder="Nhập họ và tên người nhận"
                        className="w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 px-3 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Số điện thoại liên lạc{" "}
                        <span className="text-[#9A5B13]">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => onPhoneChange?.(e.target.value)}
                        placeholder="Ví dụ: 0988 123 456"
                        className="w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 px-3 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                      Email nhận thông báo đơn hàng
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => onEmailChange?.(e.target.value)}
                      placeholder="email@domain.com"
                      className="w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 px-3 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition"
                    />
                  </div>

                  {addressMode === "saved" ? (
                    <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                          Địa chỉ nhận hàng
                        </span>
                        <a
                          href="/account"
                          className="text-[11px] font-bold text-[#9A5B13] hover:underline"
                        >
                          Sửa trong hồ sơ
                        </a>
                      </div>

                      {savedProfile.address ? (
                        <p className="text-xs sm:text-sm font-medium text-stone-900 leading-relaxed">
                          {savedProfile.address}
                        </p>
                      ) : (
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <p className="text-xs text-red-600">
                            Bạn chưa lưu địa chỉ giao hàng mặc định trong tài
                            khoản.
                          </p>
                          <button
                            type="button"
                            onClick={() => onSelectAddressMode?.("new")}
                            className="text-xs font-bold text-[#9A5B13] underline cursor-pointer"
                          >
                            Nhập địa chỉ mới
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <VietnamAddressSelector
                      provinceCode={provinceCode}
                      onProvinceChange={onProvinceChange}
                      districtCode={districtCode}
                      onDistrictChange={onDistrictChange}
                      wardName={wardName}
                      onWardChange={onWardChange}
                      streetAddress={streetAddress}
                      onStreetChange={onStreetChange}
                      streetRequired
                      mapLabel="Vị trí giao:"
                      mapHeightClass="h-44 sm:h-52"
                      footer={
                        <label className="inline-flex items-center gap-2 text-xs text-stone-600 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={saveAsDefault}
                            onChange={(e) =>
                              onSaveAsDefaultChange?.(e.target.checked)
                            }
                            className="w-4 h-4 rounded accent-[#9A5B13] cursor-pointer"
                          />
                          <span>
                            Lưu làm địa chỉ giao nhận mặc định cho lần đặt sau
                          </span>
                        </label>
                      }
                    />
                  )}

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                      Ghi chú giao hàng
                    </label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => onNoteChange?.(e.target.value)}
                      placeholder="Ví dụ: Bọc chống va đập kỹ các góc gáy bìa cứng, giao giờ hành chính..."
                      className="w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 px-3 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* KHỐI 2: Phương Thức Vận Chuyển */}
              <section className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-6 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[#141414] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A]">
                      Phương Thức Vận Chuyển
                    </h2>
                    <p className="text-xs text-stone-500">
                      Đóng gói chống ẩm &amp; bảo vệ gáy sách 360 độ
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => onShippingMethodChange?.("standard")}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition cursor-pointer ${
                      shippingMethod === "standard"
                        ? "bg-[#FAF6F0] border-[#9A5B13]/60"
                        : "bg-white border-stone-200/80 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
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
                          Tiêu Chuẩn (2 - 3 ngày)
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F5EDE2] text-[#9A5B13]">
                          Khuyên Dùng
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                        <span className="font-bold text-[#9A5B13]">
                          MIỄN PHÍ
                        </span>
                        <span className="text-stone-400 line-through text-xs">
                          35.000đ
                        </span>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onShippingMethodChange?.("express")}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition cursor-pointer ${
                      shippingMethod === "express"
                        ? "bg-[#FAF6F0] border-[#9A5B13]/60"
                        : "bg-white border-stone-200/80 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
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
                      </div>

                      <span className="text-xs sm:text-sm font-bold text-stone-900">
                        +35.000đ
                      </span>
                    </div>
                  </button>
                </div>
              </section>

              {/* KHỐI 3: Phương Thức Thanh Toán */}
              <section className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-6 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[#141414] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A]">
                      Phương Thức Thanh Toán
                    </h2>
                    <p className="text-xs text-stone-500">
                      Lựa chọn hình thức thanh toán thuận tiện và an toàn
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => onPaymentMethodChange?.(method.id)}
                        className={`text-left p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-[#FAF6F0] border-[#9A5B13]/60 shadow-2xs"
                            : "bg-white border-stone-200/80 hover:border-stone-300"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "border-[#9A5B13]"
                                  : "border-stone-400"
                              }`}
                            >
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-[#9A5B13]" />
                              )}
                            </span>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${method.badgeClass}`}
                            >
                              {method.badge}
                            </span>
                          </div>

                          <div className="text-xs sm:text-sm font-bold text-stone-900">
                            {method.title}
                          </div>
                        </div>

                        <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed">
                          {method.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* CỘT PHẢI: Đơn Hàng & Thêm Voucher */}
            <aside className="lg:col-span-5 bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xs lg:sticky lg:top-28">
              <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A]">
                  Đơn Hàng ({totalBooks} cuốn)
                </h2>

                <a
                  href="/cart"
                  className="text-xs font-semibold text-[#9A5B13] hover:underline"
                >
                  Sửa giỏ hàng
                </a>
              </div>

              {/* Danh sách sách đặt */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => {
                  const cleanName = (item.name || "").normalize("NFC");
                  const lineTotal =
                    Number(item.price || 0) * Number(item.quantity || 1);

                  return (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-11 h-15 rounded-lg bg-[#EAEAEA] p-1 flex items-center justify-center shrink-0">
                          <img
                            src={item.resolvedImage}
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
                          <div className="text-[11px] font-bold text-[#9A5B13] mt-0.5">
                            SL: {item.quantity}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs sm:text-sm font-bold text-stone-900">
                          {lineTotal.toLocaleString("vi-VN")}đ
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PHẦN THÊM VOUCHER (Voucher Admin cấp cho User) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Voucher của bạn
                  </span>
                  {vouchers.length > 0 && (
                    <span className="text-[11px] font-semibold text-[#9A5B13]">
                      {eligibleVoucherCount}/{vouchers.length} đủ điều kiện
                    </span>
                  )}
                </div>

                {selectedVoucher ? (
                  <div className="bg-[#FAF6F0] border border-[#9A5B13]/50 rounded-xl p-3 flex items-center justify-between gap-2.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-[#9A5B13] text-white text-[10px] font-extrabold tracking-wider">
                          {selectedVoucher.code}
                        </span>
                        <span className="text-xs font-bold text-emerald-700">
                          -{voucherDiscount.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 truncate mt-1">
                        {selectedVoucher.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={onOpenVoucherModal}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 text-[11px] font-bold text-stone-700 hover:border-[#9A5B13] cursor-pointer"
                      >
                        Đổi
                      </button>
                      <button
                        type="button"
                        onClick={onRemoveVoucher}
                        aria-label="Gỡ voucher"
                        className="px-2 py-1.5 rounded-lg bg-white border border-stone-200 text-[11px] font-bold text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        Gỡ
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenVoucherModal}
                    className="w-full bg-[#FAF8F5] hover:bg-[#F5EFE6] border border-dashed border-[#9A5B13]/60 rounded-xl p-3 flex items-center justify-between gap-3 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-8 h-8 rounded-lg bg-[#F3E2D2] text-[#9A5B13] flex items-center justify-center shrink-0">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                          />
                        </svg>
                      </span>
                      <div className="text-left min-w-0">
                        <div className="text-xs font-bold text-stone-900 group-hover:text-[#9A5B13] transition">
                          + Thêm voucher
                        </div>
                        <div className="text-[11px] text-stone-500 truncate">
                          {vouchersLoading
                            ? "Đang tải voucher ưu đãi..."
                            : vouchers.length === 0
                            ? "Chưa có voucher được cấp"
                            : eligibleVoucherCount > 0
                            ? `Có ${eligibleVoucherCount} voucher áp dụng được cho đơn này`
                            : "Xem điều kiện áp dụng voucher"}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-[#9A5B13] shrink-0">
                      Chọn &rsaquo;
                    </span>
                  </button>
                )}
              </div>

              {/* Chi tiết tính tiền */}
              <div className="border-t border-stone-100 pt-3.5 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Tạm tính ({totalBooks} cuốn)</span>
                  <span className="font-bold text-stone-900">
                    {subtotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Phí vận chuyển</span>
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

                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Giảm giá voucher ({selectedVoucher?.code})</span>
                    <span className="font-bold">
                      -{voucherDiscount.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}
              </div>

              {/* Tổng thanh toán */}
              <div className="bg-[#F3EFEA] border border-stone-200/70 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-800">
                    Tổng thanh toán
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

              {/* Nút đặt hàng trên PC */}
              <button
                type="submit"
                disabled={submitting}
                className="hidden lg:flex w-full bg-[#141414] hover:bg-stone-800 disabled:opacity-60 text-white text-sm font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl items-center justify-center gap-2 transition cursor-pointer shadow-sm"
              >
                <span>
                  {submitting
                    ? "Đang xử lý đơn hàng..."
                    : "Xác nhận đặt hàng & thanh toán"}
                </span>
                {!submitting && <span>&rarr;</span>}
              </button>
            </aside>
          </form>
        )}
      </div>

      {/* THANH ĐẶT HÀNG CỐ ĐỊNH Ở ĐÁY MÀN HÌNH RIÊNG CHO MOBILE (< lg) */}
      {!orderSuccess && !loading && items.length > 0 && (
        <MobileActionBar>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
                <span>Tổng thanh toán</span>
                {voucherDiscount > 0 && (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold">
                    -{voucherDiscount.toLocaleString("vi-VN")}đ
                  </span>
                )}
              </div>
              <div className="font-serif text-lg font-bold text-[#9A5B13] leading-tight truncate">
                {grandTotal.toLocaleString("vi-VN")} ₫
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#141414] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <span>{submitting ? "Đang xử lý..." : "Đặt hàng"}</span>
              {!submitting && <span>&rarr;</span>}
            </button>
          </div>
        </MobileActionBar>
      )}

      {/* MODAL / BOTTOM SHEET CHỌN VOUCHER ADMIN CẤP CHO USER */}
      {voucherModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-2xs flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={onCloseVoucherModal}
          >
            <div
              className="w-full sm:max-w-lg bg-[#FCFBF9] rounded-t-3xl sm:rounded-2xl border border-stone-200 shadow-2xl max-h-[82vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div className="px-4 sm:px-5 py-3.5 bg-white border-b border-stone-200 flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                    Chọn Voucher Ưu Đãi
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Giá trị đơn hàng hiện tại:{" "}
                    <strong className="text-[#9A5B13]">
                      {subtotal.toLocaleString("vi-VN")}đ
                    </strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onCloseVoucherModal}
                  aria-label="Đóng danh sách voucher"
                  className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center text-lg font-bold cursor-pointer"
                >
                  &times;
                </button>
              </div>

              {/* Danh sách voucher */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {vouchersLoading ? (
                  <div className="py-10 text-center text-xs text-stone-500">
                    Đang tải danh sách voucher của bạn...
                  </div>
                ) : vouchers.length === 0 ? (
                  <div className="bg-white border border-stone-200/80 rounded-2xl p-8 text-center space-y-2">
                    <p className="font-serif text-base font-bold text-stone-800">
                      Bạn chưa có voucher nào
                    </p>
                    <p className="text-xs text-stone-500">
                      Các voucher ưu đãi do Admin cấp cho tài khoản sẽ hiển thị
                      tại đây.
                    </p>
                  </div>
                ) : (
                  vouchers.map((voucher) => {
                    const isSelected =
                      selectedVoucher &&
                      String(selectedVoucher.id) === String(voucher.id);

                    return (
                      <div
                        key={voucher.id}
                        className={`rounded-2xl border p-3.5 transition flex items-center justify-between gap-3 ${
                          !voucher.isEligible
                            ? "bg-stone-50 border-stone-200/80 opacity-65"
                            : isSelected
                            ? "bg-[#FAF6F0] border-[#9A5B13] shadow-2xs"
                            : "bg-white border-stone-200 hover:border-[#9A5B13]/60"
                        }`}
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-[#141414] text-white text-[10px] font-extrabold tracking-wider">
                              {voucher.code}
                            </span>
                            <span className="text-xs font-bold text-[#9A5B13]">
                              {voucher.discountLabel}
                            </span>
                          </div>

                          <div className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1">
                            {voucher.title}
                          </div>

                          <div className="text-[11px] text-stone-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span>
                              Đơn tối thiểu:{" "}
                              <strong className="text-stone-700">
                                {voucher.minOrderValue.toLocaleString("vi-VN")}đ
                              </strong>
                            </span>
                            {voucher.expiresLabel && (
                              <>
                                <span>&bull;</span>
                                <span>HSD: {voucher.expiresLabel}</span>
                              </>
                            )}
                          </div>

                          {!voucher.isEligible && (
                            <p className="text-[11px] font-semibold text-amber-700 pt-0.5">
                              Mua thêm{" "}
                              {voucher.missingAmount.toLocaleString("vi-VN")}đ để
                              áp dụng voucher này
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={!voucher.isEligible}
                          onClick={() => onApplyVoucher?.(voucher)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
                            !voucher.isEligible
                              ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                              : isSelected
                              ? "bg-[#9A5B13] text-white cursor-pointer"
                              : "bg-[#141414] hover:bg-stone-800 text-white cursor-pointer"
                          }`}
                        >
                          {isSelected ? "Đang dùng" : "Áp dụng"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer Modal */}
              <div className="px-4 py-3 bg-white border-t border-stone-200 flex items-center justify-between gap-2">
                {selectedVoucher ? (
                  <button
                    type="button"
                    onClick={onRemoveVoucher}
                    className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    Bỏ chọn voucher
                  </button>
                ) : (
                  <span className="text-[11px] text-stone-400">
                    Chỉ áp dụng 1 voucher cho mỗi đơn hàng
                  </span>
                )}

                <button
                  type="button"
                  onClick={onCloseVoucherModal}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-800 cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}